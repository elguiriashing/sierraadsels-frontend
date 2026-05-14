// Bulk upload images from local media folder to R2 and create database items
// This restores your local content to the live site

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const API_URL = process.env.API_URL || 'https://sierraadsels-backend-production.up.railway.app/api';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Sierra2026';
const MEDIA_DIR = process.env.MEDIA_DIR || './public/media';

// R2 credentials from Railway (you'll need to set these)
const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'sierraadsels-images';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

// Category mapping based on folder names
const categoryMapping = {
  'ringen 1': 'ringen',
  'ringen-1': 'ringen',
  'ringen': 'ringen',
  'armbanden': 'armbanden',
  'hangers': 'hangers',
  'oorbellen': 'oorbellen',
  'in opdracht': 'in-opdracht',
  'in-opdracht': 'in-opdracht',
  'schilderwerk': 'schilderwerk',
  'index': null, // Skip index folder
};

async function login() {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: ADMIN_PASSWORD }),
  });
  const data = await res.json();
  return data.token;
}

// Check if AWS CLI is installed
function checkAwsCli() {
  try {
    execSync('aws --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

// Configure AWS CLI for R2
function configureR2() {
  if (!checkAwsCli()) {
    console.log('AWS CLI not found. Installing via npm...');
    try {
      execSync('npm install -g aws-cli', { stdio: 'inherit' });
    } catch {
      console.error('Please install AWS CLI manually:');
      console.error('  Windows: https://aws.amazon.com/cli/');
      console.error('  Or use: npm install -g aws-cli');
      process.exit(1);
    }
  }
  
  // Set environment variables for AWS CLI
  process.env.AWS_ACCESS_KEY_ID = R2_ACCESS_KEY_ID;
  process.env.AWS_SECRET_ACCESS_KEY = R2_SECRET_ACCESS_KEY;
  process.env.AWS_DEFAULT_REGION = 'auto';
}

// Upload single file to R2
async function uploadToR2(localPath, key) {
  const endpoint = R2_ENDPOINT.replace('https://', '');
  const command = `aws s3 cp "${localPath}" "s3://${R2_BUCKET_NAME}/${key}" --endpoint-url="${R2_ENDPOINT}" --region=auto`;
  
  try {
    execSync(command, { stdio: 'pipe' });
    return `${R2_PUBLIC_URL}/${key}`;
  } catch (err) {
    console.error(`Failed to upload ${key}:`, err.message);
    return null;
  }
}

// Scan media folder
function scanMediaFolder(dir) {
  const results = [];
  
  if (!fs.existsSync(dir)) {
    console.error(`Media directory not found: ${dir}`);
    return results;
  }
  
  const folders = fs.readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory());
  
  for (const folder of folders) {
    const folderName = folder.name;
    const category = categoryMapping[folderName.toLowerCase()];
    
    if (!category) {
      console.log(`Skipping folder: ${folderName}`);
      continue;
    }
    
    const folderPath = path.join(dir, folderName);
    const files = fs.readdirSync(folderPath)
      .filter(f => /\.(jpg|jpeg|png|gif|webp|jfif)$/i.test(f));
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      results.push({
        localPath: path.join(folderPath, file),
        category,
        folder: folderName,
        filename: file,
        order: i,
      });
    }
  }
  
  return results;
}

// Create item in database
async function createItem(token, item) {
  try {
    const res = await fetch(`${API_URL}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(item),
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log(`✓ Created: ${item.title || item.src.split('/').pop()}`);
      return data;
    } else {
      console.error(`✗ Failed to create item:`, await res.text());
      return null;
    }
  } catch (err) {
    console.error(`Error creating item:`, err.message);
    return null;
  }
}

// Get upload URL from backend
async function getUploadUrl(token) {
  try {
    const res = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ filename: 'test.jpg', contentType: 'image/jpeg' }),
    });
    
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch {
    return null;
  }
}

async function bulkUpload() {
  console.log('=== Bulk Upload to R2 and Database ===\n');
  
  // Check credentials
  if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.error('Missing R2 credentials. Set these environment variables:');
    console.error('  R2_ACCESS_KEY_ID');
    console.error('  R2_SECRET_ACCESS_KEY');
    console.error('  R2_ENDPOINT');
    console.error('  R2_PUBLIC_URL');
    process.exit(1);
  }
  
  // Login
  console.log('Logging in...');
  const token = await login();
  console.log('✓ Logged in\n');
  
  // Scan media folder
  console.log(`Scanning ${MEDIA_DIR}...`);
  const files = scanMediaFolder(MEDIA_DIR);
  console.log(`Found ${files.length} images to upload\n`);
  
  if (files.length === 0) {
    console.log('No images found. Exiting.');
    return;
  }
  
  // Configure AWS CLI
  configureR2();
  
  // Upload each file
  console.log('Starting upload...\n');
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    console.log(`[${i + 1}/${files.length}] ${file.filename} (${file.category})`);
    
    // Generate unique key for R2
    const key = `${file.category}/${Date.now()}-${file.filename}`;
    
    // Upload to R2
    const publicUrl = await uploadToR2(file.localPath, key);
    
    if (!publicUrl) {
      failCount++;
      continue;
    }
    
    // Create item in database
    const item = {
      src: publicUrl,
      title: '',
      description: '',
      category: file.category,
      order: file.order,
    };
    
    const created = await createItem(token, item);
    if (created) {
      successCount++;
    } else {
      failCount++;
    }
    
    // Small delay to avoid overwhelming the API
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log(`\n=== Upload Complete ===`);
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`\nYour images are now live at: ${API_URL.replace('/api', '')}`);
}

bulkUpload().catch(err => {
  console.error('Bulk upload failed:', err);
  process.exit(1);
});
