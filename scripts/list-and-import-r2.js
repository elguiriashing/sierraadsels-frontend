// List R2 bucket and import all images to database
// Requires AWS CLI configured with R2 credentials

const { execSync } = require('child_process');
const fs = require('fs');

const API_URL = 'https://sierraadsels-backend-production.up.railway.app/api';
const ADMIN_PASSWORD = 'Sierra2026';
const R2_PUBLIC_URL = 'https://pub-fb7131de275a4e598478e0a825c2b165.r2.dev';

// Get from environment or prompt
const R2_ENDPOINT = process.env.R2_ENDPOINT || 'https://501bc9434d8ae555a6ac984a26dd2725.r2.cloudflarestorage.com';
const R2_BUCKET = process.env.R2_BUCKET_NAME || 'sierraadsels-images';

async function login() {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: ADMIN_PASSWORD }),
  });
  const data = await res.json();
  if (!data.token) throw new Error('Login failed: ' + JSON.stringify(data));
  return data.token;
}

function listR2Objects() {
  console.log('Listing R2 bucket contents...\n');
  
  try {
    const cmd = `aws s3api list-objects-v2 --bucket ${R2_BUCKET} --endpoint-url=${R2_ENDPOINT} --region=auto`;
    const output = execSync(cmd, { 
      encoding: 'utf-8',
      env: {
        ...process.env,
        AWS_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
      }
    });
    
    const data = JSON.parse(output);
    return data.Contents || [];
  } catch (err) {
    console.error('Failed to list R2 objects:', err.message);
    console.log('\nMake sure AWS CLI is installed and R2 credentials are set:');
    console.log('  R2_ACCESS_KEY_ID');
    console.log('  R2_SECRET_ACCESS_KEY');
    return [];
  }
}

function categorizeObject(key) {
  // Extract category from folder path
  const parts = key.split('/');
  const folder = parts[0].toLowerCase();
  
  const mapping = {
    'ringen 1': 'ringen-1',
    'ringen 2': 'ringen-2',
    'ringen-1': 'ringen-1',
    'ringen-2': 'ringen-2',
    'armbanden': 'armbanden',
    'hangers': 'halssieraden',
    'halssieraden': 'halssieraden',
    'oorbellen': 'oorbellen',
    'in opdracht': 'in-opdracht',
    'in-opdracht': 'in-opdracht',
    'schilderwerk': 'schilderwerk',
  };
  
  return mapping[folder] || folder;
}

async function createItem(token, item) {
  const res = await fetch(`${API_URL}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(item),
  });
  
  if (!res.ok) {
    const err = await res.text();
    console.error(`  Failed: ${err}`);
    return null;
  }
  return await res.json();
}

async function importAll() {
  console.log('=== R2 to Database Import ===\n');
  
  // Check env vars
  if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    console.error('Error: R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY must be set');
    console.log('\nSet them like:');
    console.log('  $env:R2_ACCESS_KEY_ID="765cce88f065345893b3df822850a750"');
    console.log('  $env:R2_SECRET_ACCESS_KEY="079949f5776940989fbff3c324d89d7715aa2743958723edc8e7f07e6a0ad467"');
    return;
  }
  
  // List R2 objects
  const objects = listR2Objects();
  if (objects.length === 0) {
    console.log('No objects found in R2 bucket');
    return;
  }
  
  console.log(`Found ${objects.length} objects\n`);
  
  // Filter images only
  const images = objects.filter(obj => 
    /\.(jpg|jpeg|png|gif|webp|jfif)$/i.test(obj.Key)
  );
  
  console.log(`Found ${images.length} images to import\n`);
  
  if (images.length === 0) return;
  
  // Login
  let token;
  try {
    token = await login();
    console.log('✓ Authenticated\n');
  } catch (err) {
    console.error('Login failed:', err.message);
    console.log('\nMake sure ADMIN_PASSWORD_HASH in Railway matches "Sierra2026"');
    return;
  }
  
  // Import images
  let success = 0;
  let failed = 0;
  
  // Group by category for ordering
  const byCategory = {};
  images.forEach(img => {
    const cat = categorizeObject(img.Key);
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(img);
  });
  
  for (const [category, catImages] of Object.entries(byCategory)) {
    console.log(`\n--- Category: ${category} (${catImages.length} images) ---`);
    
    for (let i = 0; i < catImages.length; i++) {
      const img = catImages[i];
      const filename = img.Key.split('/').pop();
      console.log(`[${i + 1}/${catImages.length}] ${filename}`);
      
      const item = {
        id: `${category}-${Date.now()}-${i}`,
        src: `${R2_PUBLIC_URL}/${img.Key}`,
        title: '',
        description: '',
        category: category,
        order: i,
      };
      
      const created = await createItem(token, item);
      if (created) {
        success++;
        console.log(`  ✓ Imported`);
      } else {
        failed++;
        console.log(`  ✗ Failed`);
      }
      
      await new Promise(r => setTimeout(r, 200));
    }
  }
  
  console.log(`\n=== Import Complete ===`);
  console.log(`Success: ${success}`);
  console.log(`Failed: ${failed}`);
  console.log(`\nTotal images now in database: ${success}`);
}

// Run
importAll().catch(console.error);
