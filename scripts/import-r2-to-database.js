// Import existing R2 images into database
// Run: node scripts/import-r2-to-database.js

const API_URL = 'https://sierraadsels-backend-production.up.railway.app/api';
const ADMIN_PASSWORD = 'Sierra2026';
const R2_PUBLIC_URL = 'https://pub-fb7131de275a4e598478e0a825c2b165.r2.dev';

// Category mapping from your folder structure
const categoryMapping = {
  'ringen 1': 'ringen-1',
  'ringen 2': 'ringen-2', 
  'ringen-1': 'ringen-1',
  'ringen-2': 'ringen-2',
  'armbanden': 'armbanden',
  'hangers': 'halssieraden',  // mapped to halssieraden
  'halssieraden': 'halssieraden',
  'oorbellen': 'oorbellen',
  'in opdracht': 'in-opdracht',
  'in-opdracht': 'in-opdracht',
  'schilderwerk': 'schilderwerk',
};

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

async function listR2Objects(prefix = '') {
  // We'll use the R2 public URL pattern to construct image URLs
  // Since we can't directly list R2 without AWS CLI, you'll provide the list
  console.log('Note: You need to provide a list of R2 object keys');
  console.log('Format: [{"key": "ringen-1/image1.jpg", "category": "ringen-1"}]');
  return [];
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
    console.error(`Failed to create item: ${err}`);
    return null;
  }
  return await res.json();
}

// Main import function
async function importImages(imageList) {
  console.log('=== Importing R2 Images to Database ===\n');
  
  try {
    const token = await login();
    console.log('✓ Logged in\n');
    
    let success = 0;
    let failed = 0;
    
    for (let i = 0; i < imageList.length; i++) {
      const img = imageList[i];
      console.log(`[${i + 1}/${imageList.length}] ${img.key}`);
      
      const item = {
        id: `img-${Date.now()}-${i}`,
        src: `${R2_PUBLIC_URL}/${img.key}`,
        title: img.title || '',
        description: img.description || '',
        category: img.category,
        order: i,
      };
      
      const created = await createItem(token, item);
      if (created) {
        success++;
        console.log(`  ✓ Created`);
      } else {
        failed++;
        console.log(`  ✗ Failed`);
      }
      
      await new Promise(r => setTimeout(r, 300));
    }
    
    console.log(`\n=== Import Complete ===`);
    console.log(`Success: ${success}`);
    console.log(`Failed: ${failed}`);
  } catch (err) {
    console.error('Import failed:', err.message);
  }
}

// Example usage - replace with your actual R2 object keys
const myImages = [
  // Add your R2 object keys here like:
  // { key: 'ringen-1/MG_8342_bew.jpg', category: 'ringen-1', title: 'Zilveren Ring' },
  // { key: 'ringen-1/MG_8340_bew.jpg', category: 'ringen-1' },
  // { key: 'armbanden/armband1.jpg', category: 'armbanden' },
];

console.log('To use this script:');
console.log('1. First fix the password hash in Railway');
console.log('2. Get list of your R2 objects from Cloudflare dashboard');
console.log('3. Update the myImages array above with your actual image keys');
console.log('4. Run: node scripts/import-r2-to-database.js');
console.log('\nCurrent myImages array is empty - add your images first!');
