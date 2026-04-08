const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'darb_network_db',
  connectTimeout: 60000,
  ssl: process.env.DB_HOST && process.env.DB_HOST.includes('aivencloud.com') 
    ? { rejectUnauthorized: false } 
    : undefined
};

const campaigns = [
  {
    title: "AI-Powered Healthcare Diagnostics Platform",
    description: "Revolutionary AI system for early disease detection",
    category: "Healthcare",
    location: "Lagos, Nigeria",
    target_amount: 75000000,
    minimum_investment: 500000,
    problem_statement: "Late diagnosis leads to 60% higher mortality rates",
    solution: "AI-powered diagnostic tool with 95% accuracy",
    business_plan: "B2B SaaS model targeting hospitals and clinics",
    video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    main_image_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d",
    milestones: [
      { title: "MVP Development", description: "Complete core AI model", target_amount: 25000000, video_url: "https://www.youtube.com/watch?v=jNQXAC9IVRw" },
      { title: "Clinical Trials", description: "Partner with 5 hospitals", target_amount: 50000000, video_url: "https://www.youtube.com/watch?v=ScMzIvxBSi4" }
    ],
    collaborators: [
      { name: "Dr. Amina Yusuf", role: "Chief Medical Officer", description: "15 years in healthcare AI", email: "amina@healthai.com", phoneNumber: "08012345678" },
      { name: "Chidi Okonkwo", role: "CTO", description: "Former Google AI engineer", email: "chidi@healthai.com", phoneNumber: "08023456789" }
    ]
  },
  {
    title: "Solar-Powered Cold Storage for Farmers",
    description: "Affordable refrigeration solution for rural farmers",
    category: "Agriculture",
    location: "Kano, Nigeria",
    target_amount: 45000000,
    minimum_investment: 250000,
    problem_statement: "40% of farm produce spoils due to lack of storage",
    solution: "Solar-powered cold storage units with IoT monitoring",
    business_plan: "Lease-to-own model for smallholder farmers",
    video_url: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
    main_image_url: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449",
    milestones: [
      { title: "Prototype Testing", description: "Build and test 10 units", target_amount: 15000000 },
      { title: "Pilot Program", description: "Deploy to 50 farmers", target_amount: 30000000 }
    ],
    collaborators: [
      { name: "Ibrahim Musa", role: "CEO", description: "Agricultural engineer", email: "ibrahim@agritech.ng", phoneNumber: "08034567890" }
    ]
  },
  {
    title: "Fintech Payment Gateway for SMEs",
    description: "Seamless payment processing for small businesses",
    category: "Finance",
    location: "Lagos, Nigeria",
    target_amount: 100000000,
    minimum_investment: 1000000,
    problem_statement: "SMEs lose 30% revenue due to payment friction",
    solution: "Unified payment gateway with instant settlement",
    business_plan: "Transaction fee model with premium features",
    video_url: "https://www.youtube.com/watch?v=9bZkp7q19f0",
    main_image_url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3",
    milestones: [
      { title: "Platform Launch", description: "Go live with core features", target_amount: 40000000 },
      { title: "Market Expansion", description: "Onboard 1000 merchants", target_amount: 60000000 }
    ],
    collaborators: [
      { name: "Funke Adeyemi", role: "CEO", description: "Ex-Paystack product lead", email: "funke@finpay.ng", phoneNumber: "08045678901" },
      { name: "Tunde Bakare", role: "CFO", description: "Investment banker", email: "tunde@finpay.ng", phoneNumber: "08056789012" }
    ]
  }
];

// Add 22 more campaigns with varied data
const additionalCampaigns = [
  { title: "EdTech Learning Platform", category: "Education", location: "Abuja, Nigeria", target_amount: 35000000, video_url: "https://www.youtube.com/watch?v=CevxZvSJLk8" },
  { title: "Electric Vehicle Charging Network", category: "Energy & Green Tech", location: "Port Harcourt, Nigeria", target_amount: 120000000, video_url: "https://www.youtube.com/watch?v=y8Kyi0WNg40" },
  { title: "Telemedicine Mobile App", category: "Healthcare", location: "Ibadan, Nigeria", target_amount: 28000000, video_url: "https://www.youtube.com/watch?v=L_jWHffIx5E" },
  { title: "Smart Irrigation System", category: "Agriculture", location: "Kaduna, Nigeria", target_amount: 40000000, video_url: "https://www.youtube.com/watch?v=fJ9rUzIMcZQ" },
  { title: "E-commerce Logistics Platform", category: "E-commerce", location: "Lagos, Nigeria", target_amount: 85000000, video_url: "https://www.youtube.com/watch?v=GC-VM5rOKWs" },
  { title: "Blockchain Supply Chain Tracker", category: "Technology", location: "Lagos, Nigeria", target_amount: 65000000, video_url: "https://www.youtube.com/watch?v=Ks-_Mh1QhMc" },
  { title: "Affordable Housing Construction", category: "Real Estate", location: "Enugu, Nigeria", target_amount: 200000000, video_url: "https://www.youtube.com/watch?v=UxxajLWwzqY" },
  { title: "Food Delivery Drone Service", category: "Transportation", location: "Lagos, Nigeria", target_amount: 95000000, video_url: "https://www.youtube.com/watch?v=ALZHF5UqnU4" },
  { title: "Organic Food Processing Plant", category: "Food & Beverages", location: "Jos, Nigeria", target_amount: 55000000, video_url: "https://www.youtube.com/watch?v=hTWKbfoikeg" },
  { title: "Waste-to-Energy Facility", category: "Energy & Green Tech", location: "Kano, Nigeria", target_amount: 150000000, video_url: "https://www.youtube.com/watch?v=uelHwf8o7_U" },
  { title: "Virtual Reality Training Platform", category: "Education", location: "Lagos, Nigeria", target_amount: 42000000, video_url: "https://www.youtube.com/watch?v=e-ORhEE9VVg" },
  { title: "Mental Health Support App", category: "Healthcare", location: "Abuja, Nigeria", target_amount: 30000000, video_url: "https://www.youtube.com/watch?v=tmY-G6sngk8" },
  { title: "Aquaponics Farming System", category: "Agriculture", location: "Calabar, Nigeria", target_amount: 38000000, video_url: "https://www.youtube.com/watch?v=ZXsQAXx_ao0" },
  { title: "Peer-to-Peer Lending Platform", category: "Finance", location: "Lagos, Nigeria", target_amount: 70000000, video_url: "https://www.youtube.com/watch?v=Ahg6qcgoay4" },
  { title: "Smart Home Automation System", category: "Technology", location: "Lagos, Nigeria", target_amount: 48000000, video_url: "https://www.youtube.com/watch?v=CQ_fc3LRu" },
  { title: "Modular Co-working Spaces", category: "Real Estate", location: "Lagos, Nigeria", target_amount: 90000000, video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
  { title: "Electric Motorcycle Manufacturing", category: "Transportation", location: "Nnewi, Nigeria", target_amount: 180000000, video_url: "https://www.youtube.com/watch?v=jNQXAC9IVRw" },
  { title: "Artisan Marketplace Platform", category: "E-commerce", location: "Lagos, Nigeria", target_amount: 32000000, video_url: "https://www.youtube.com/watch?v=ScMzIvxBSi4" },
  { title: "Craft Brewery and Taproom", category: "Food & Beverages", location: "Lagos, Nigeria", target_amount: 60000000, video_url: "https://www.youtube.com/watch?v=kJQP7kiw5Fk" },
  { title: "Biogas Production from Waste", category: "Energy & Green Tech", location: "Ibadan, Nigeria", target_amount: 75000000, video_url: "https://www.youtube.com/watch?v=9bZkp7q19f0" },
  { title: "Coding Bootcamp for Youth", category: "Education", location: "Port Harcourt, Nigeria", target_amount: 25000000, video_url: "https://www.youtube.com/watch?v=CevxZvSJLk8" },
  { title: "Medical Equipment Leasing", category: "Healthcare", location: "Lagos, Nigeria", target_amount: 110000000, video_url: "https://www.youtube.com/watch?v=y8Kyi0WNg40" }
];

async function seedCampaigns() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Get founder user (assuming user with ID 1 exists)
    const [users] = await connection.execute('SELECT id FROM users WHERE userType = ? LIMIT 1', ['founder']);
    
    if (users.length === 0) {
      console.error('❌ No founder user found. Please create a founder user first.');
      return;
    }

    const founderId = users[0].id;
    console.log(`📝 Using founder ID: ${founderId}`);

    // Insert first 3 detailed campaigns
    for (const campaign of campaigns) {
      const [result] = await connection.execute(
        `INSERT INTO campaigns (
          title, description, category, location, target_amount, current_amount,
          minimum_investment, problem_statement, solution, business_plan,
          video_url, main_image_url, status, founder_id, is_featured
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          campaign.title, campaign.description, campaign.category, campaign.location,
          campaign.target_amount, Math.floor(campaign.target_amount * (Math.random() * 0.4 + 0.1)),
          campaign.minimum_investment, campaign.problem_statement, campaign.solution,
          campaign.business_plan, campaign.video_url, campaign.main_image_url,
          'approved', founderId, Math.random() > 0.7
        ]
      );

      const campaignId = result.insertId;
      console.log(`✅ Created campaign: ${campaign.title} (ID: ${campaignId})`);

      // Insert milestones
      if (campaign.milestones) {
        for (let i = 0; i < campaign.milestones.length; i++) {
          const milestone = campaign.milestones[i];
          await connection.execute(
            `INSERT INTO campaign_milestones (
              campaign_id, title, description, target_amount, order_index, video_url
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [campaignId, milestone.title, milestone.description, milestone.target_amount, i + 1, milestone.video_url || null]
          );
        }
        console.log(`  ✅ Added ${campaign.milestones.length} milestones`);
      }

      // Insert collaborators
      if (campaign.collaborators) {
        for (let i = 0; i < campaign.collaborators.length; i++) {
          const collab = campaign.collaborators[i];
          await connection.execute(
            `INSERT INTO campaign_collaborators (
              campaign_id, name, role, description, email, phoneNumber, order_index
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [campaignId, collab.name, collab.role, collab.description, collab.email, collab.phoneNumber, i + 1]
          );
        }
        console.log(`  ✅ Added ${campaign.collaborators.length} collaborators`);
      }
    }

    // Insert remaining 22 campaigns with basic data
    for (const campaign of additionalCampaigns) {
      await connection.execute(
        `INSERT INTO campaigns (
          title, description, category, location, target_amount, current_amount,
          minimum_investment, video_url, status, founder_id, is_featured
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          campaign.title,
          `Innovative ${campaign.category.toLowerCase()} solution addressing market needs with cutting-edge technology and sustainable practices.`,
          campaign.category,
          campaign.location,
          campaign.target_amount,
          Math.floor(campaign.target_amount * (Math.random() * 0.5 + 0.05)),
          Math.floor(campaign.target_amount * 0.01),
          campaign.video_url,
          'approved',
          founderId,
          Math.random() > 0.8
        ]
      );
      console.log(`✅ Created campaign: ${campaign.title}`);
    }

    console.log('\n🎉 Successfully seeded 25 campaigns!');

  } catch (error) {
    console.error('❌ Error seeding campaigns:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedCampaigns();
