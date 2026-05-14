// Seed script to populate the database with initial data
// Run this locally to populate your live database

const API_URL = process.env.API_URL || 'https://sierraadsels-backend-production.up.railway.app/api';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Sierra2026';

const defaultCategories = [
  { id: 'ringen', name: 'Ringen', slug: 'ringen', description: '', topText: '', bottomText: '', order: 0 },
  { id: 'armbanden', name: 'Armbanden', slug: 'armbanden', description: '', topText: '', bottomText: '', order: 1 },
  { id: 'hangers', name: 'Hangers', slug: 'hangers', description: '', topText: '', bottomText: '', order: 2 },
  { id: 'oorbellen', name: 'Oorbellen', slug: 'oorbellen', description: '', topText: '', bottomText: '', order: 3 },
  { id: 'in-opdracht', name: 'In Opdracht', slug: 'in-opdracht', description: '', topText: '', bottomText: '', order: 4 },
  { id: 'schilderwerk', name: 'Schilderwerk', slug: 'schilderwerk', description: '', topText: '', bottomText: '', order: 5 },
];

const defaultSiteContent = {
  title: "Sierraadsels",
  aboutText: "Handgemaakte sieraden met een verhaal. Elk stuk is uniek en met liefde gemaakt.",
  contactEmail: "info@sierraadsels.nl",
  contactPhone: "",
  heroTitle: "SIERRAADSELS",
  heroSubtitle: "Unieke handgemaakte zilveren sieraden",
  heroDescription: "Ontdek onze collectie handgemaakte sieraden, elk stuk vertelt een eigen verhaal.",
  quoteText: "Sieraden zijn niet alleen versieringen, ze zijn verhalen die je draagt.",
  ctaText: "Benieuwd naar onze collectie? Neem een kijkje en laat je inspireren.",
  makerImage: "",
  makerTitle: "De Maker",
  makerName: "Tilly",
  makerDescription: "Al meer dan 20 jaar creëer ik unieke sieraden met passie en aandacht voor detail.",
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

async function seedCategories(token) {
  console.log('Seeding categories...');
  for (const cat of defaultCategories) {
    try {
      const res = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(cat),
      });
      if (res.ok) {
        console.log(`✓ Created category: ${cat.name}`);
      } else {
        console.log(`✗ Failed to create ${cat.name}:`, await res.text());
      }
    } catch (err) {
      console.error(`Error creating ${cat.name}:`, err.message);
    }
  }
}

async function seedSiteContent(token) {
  console.log('Seeding site content...');
  try {
    const res = await fetch(`${API_URL}/site-content`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(defaultSiteContent),
    });
    if (res.ok) {
      console.log('✓ Site content updated');
    } else {
      console.log('✗ Failed to update site content:', await res.text());
    }
  } catch (err) {
    console.error('Error updating site content:', err.message);
  }
}

async function seed() {
  console.log(`Connecting to ${API_URL}...`);
  try {
    const token = await login();
    console.log('✓ Logged in successfully');
    
    await seedCategories(token);
    await seedSiteContent(token);
    
    console.log('\n✓ Seeding complete!');
    console.log('You can now visit your live site and log in to add images.');
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
