/**
 * Reset Database - Clean slate with 2 sample campaigns and admin user
 * 
 * Usage: node scripts/reset-database-clean.js
 * 
 * This script:
 * 1. Drops all tables
 * 2. Recreates schema
 * 3. Creates admin user
 * 4. Creates 2 sample campaigns
 */

require('dotenv').config();
const db = require('../models');
const { createUser } = require('../config/firebase');

const run = async () => {
  try {
    console.log('🔄 Starting database reset...');

    // 1. Force sync (drop and recreate tables)
    console.log('⏳ Dropping all tables...');
    await db.sequelize.sync({ force: true });
    console.log('✅ Tables recreated');

    // 2. Create admin user in MySQL
    console.log('⏳ Creating admin user in database...');
    const adminUser = await db.user.create({
      firebase_uid: 'admin-uid-12345',
      email: 'admin@darb.com',
      fullName: 'Admin User',
      userType: 'admin',
      companyName: 'Darb Networks',
      phoneNumber: '+2348012345678',
      address: 'Lagos, Nigeria',
      isActive: true,
      isVerified: true,
      isEmailVerified: true
    });
    console.log('✅ Admin user created:', adminUser.email);

    // 3. Create 2 sample campaigns
    console.log('⏳ Creating sample campaigns...');
    
    const campaign1 = await db.campaign.create({
      title: 'EcoCharge - Solar Energy Solution',
      description: 'Revolutionary solar charging stations for Nigeria. We are building a network of eco-friendly charging infrastructure across major cities.',
      fullDescription: 'EcoCharge is developing innovative solar-powered electric vehicle charging stations. Our mission is to provide sustainable energy solutions while creating employment opportunities in rural and urban areas. We are seeking ₦50 million to expand our network to 20 cities.',
      category: 'Energy',
      fundingGoal: 50000000,
      amountRaised: 15000000,
      minimumInvestment: 500000,
      riskLevel: 'medium',
      investorCount: 8,
      status: 'active',
      isFeatured: true,
      country: 'Nigeria',
      documents: JSON.stringify([
        { name: 'Business Plan', url: '/documents/ecocharge-plan.pdf', type: 'pdf' },
        { name: 'Financial Projections', url: '/documents/ecocharge-financials.xlsx', type: 'xlsx' }
      ]),
      thumbnailUrl: 'https://via.placeholder.com/400x250?text=EcoCharge',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ Campaign 1 created:', campaign1.title);

    const campaign2 = await db.campaign.create({
      title: 'FarmTech - Smart Agricultural Platform',
      description: 'Digital platform connecting farmers directly to buyers using AI and IoT sensors. Eliminate middlemen and increase farmer profits by 40%.',
      fullDescription: 'FarmTech is revolutionizing Nigerian agriculture through technology. Our platform uses IoT sensors to monitor crop health and AI to predict market prices. Farmers get real-time data and direct market access. We are raising ₦30 million to expand to 500 farms across Nigeria.',
      category: 'Agriculture',
      fundingGoal: 30000000,
      amountRaised: 8500000,
      minimumInvestment: 250000,
      riskLevel: 'low',
      investorCount: 12,
      status: 'active',
      isFeatured: true,
      country: 'Nigeria',
      documents: JSON.stringify([
        { name: 'Pitch Deck', url: '/documents/farmtech-pitch.pdf', type: 'pdf' },
        { name: 'Technology Overview', url: '/documents/farmtech-tech.pdf', type: 'pdf' }
      ]),
      thumbnailUrl: 'https://via.placeholder.com/400x250?text=FarmTech',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ Campaign 2 created:', campaign2.title);

    console.log('\n✅ Database reset complete!');
    console.log('\n📊 Database Summary:');
    console.log('  - Users: 1 (admin)');
    console.log('  - Campaigns: 2');
    console.log('\n🔑 Admin Credentials:');
    console.log('  - Email: admin@darb.com');
    console.log('  - Firebase UID: admin-uid-12345');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during reset:', error.message);
    console.error(error);
    process.exit(1);
  }
};

run();
