// backend/seed-images.js
// Adds campaign images and profile images to seeded data
// Run with: node seed-images.js
require('dotenv').config();
const { Sequelize } = require('sequelize');
const dbConfig = require('./config/db.config');

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  port: dbConfig.PORT,
  dialect: dbConfig.dialect,
  dialectOptions: dbConfig.dialectOptions,
  dialectModule: require('mysql2'),
  logging: false,
});

// ─── IMAGE ASSIGNMENTS ────────────────────────────────────────────────────────
// Using Unsplash's source CDN — free, no auth, reliable.
// Format: https://images.unsplash.com/photo-{ID}?w=900&q=85&fit=crop

const campaignImages = {
  // SwiftPay — mobile fintech / money transfer
  'SwiftPay': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=85&fit=crop',

  // ObiLearn — students / tablets / education Nigeria
  'ObiLearn': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&q=85&fit=crop',

  // GreenRoots FarmConnect — African market / produce / supply chain
  'GreenRoots FarmConnect': 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=900&q=85&fit=crop',

  // SoilSense — soil / agriculture / IoT sensors
  'SoilSense': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&q=85&fit=crop',

  // CreditBridge — market trader / informal economy / cash
  'CreditBridge': 'https://images.unsplash.com/photo-1604594849809-dfedbc827105?w=900&q=85&fit=crop',

  // PensionPlus — savings / retirement / mobile banking
  'PensionPlus': 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=900&q=85&fit=crop',

  // HealthBridge Telemedicine — doctor / telemedicine / Africa health
  'HealthBridge Telemedicine': 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=900&q=85&fit=crop',

  // MediStock — pharmacy / medicine / inventory
  'MediStock': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=900&q=85&fit=crop',
};

// Profile images — African professional portraits (Unsplash free)
const profileImages = {
  // Chukwuemeka Obi — Nigerian male professional
  'chukwuemeka.obi@darbmail.ng':
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=85&fit=crop&crop=face',

  // Adaeze Nwosu — Nigerian female professional
  'adaeze.nwosu@darbmail.ng':
    'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=85&fit=crop&crop=face',

  // Babatunde Fashola — Nigerian male professional (fintech)
  'babatunde.fashola@darbmail.ng':
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=85&fit=crop&crop=face',

  // Ngozi Eze — Nigerian female doctor/professional
  'ngozi.eze@darbmail.ng':
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=85&fit=crop&crop=face',
};

async function run() {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connected\n');

    // ── Update campaign main_image_url ──────────────────────────────────────
    const campaigns = await sequelize.query(
      'SELECT id, title FROM campaigns',
      { type: sequelize.QueryTypes.SELECT }
    );

    for (const campaign of campaigns) {
      // Match by title prefix
      const key = Object.keys(campaignImages).find((k) =>
        campaign.title.startsWith(k)
      );
      if (!key) {
        console.warn(`  ⚠️  No image mapping for: ${campaign.title.substring(0, 50)}`);
        continue;
      }
      const imageUrl = campaignImages[key];
      await sequelize.query(
        'UPDATE campaigns SET main_image_url = ? WHERE id = ?',
        { replacements: [imageUrl, campaign.id] }
      );
      console.log(`  🖼️  Campaign #${campaign.id} "${campaign.title.substring(0, 45)}..." → image set`);
    }

    // ── Update user profileImageUrl ─────────────────────────────────────────
    console.log('');
    const users = await sequelize.query(
      'SELECT id, email, fullName FROM users WHERE email IN (?)',
      {
        replacements: [Object.keys(profileImages)],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    for (const user of users) {
      const imageUrl = profileImages[user.email];
      if (!imageUrl) continue;
      await sequelize.query(
        'UPDATE users SET profileImageUrl = ? WHERE id = ?',
        { replacements: [imageUrl, user.id] }
      );
      console.log(`  👤 User "${user.fullName}" → profile image set`);
    }

    console.log('\n🎉 All images updated successfully!');
  } catch (err) {
    console.error('❌ Failed:', err.message);
  } finally {
    await sequelize.close();
  }
}

run();
