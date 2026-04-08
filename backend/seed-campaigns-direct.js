const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedCampaigns() {
  let connection;
  
  try {
    console.log('🌱 Starting campaign seed process...');
    
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
      } : false
    });

    console.log('✅ Connected to database');

    // Create sample founder user
    console.log('👤 Creating sample founder user...');
    const [founderResult] = await connection.query(`
      INSERT INTO users (email, password, fullName, userType, companyName, phoneNumber, address, isActive, isVerified, isEmailVerified, bio, website)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)
    `, [
      'founder@example.com',
      '$2b$10$YourHashedPasswordHere',
      'John Doe',
      'founder',
      'Tech Innovations Ltd',
      '+2348012345678',
      'Lagos, Nigeria',
      true,
      true,
      true,
      'Experienced entrepreneur with 10+ years in tech startups',
      'https://techinnovations.com'
    ]);

    const founderId = founderResult.insertId;
    console.log(`✅ Founder user created with ID: ${founderId}`);

    // Campaign 1: EcoCharge
    console.log('\n📌 Creating Campaign 1: EcoCharge...');
    const [campaign1Result] = await connection.query(`
      INSERT INTO campaigns (
        title, description, category, location, target_amount, current_amount,
        minimum_investment, maximum_investment, problem_statement, solution,
        business_plan, market_analysis, competitive_advantage, financial_projections,
        team_information, risks_and_challenges, main_image_url, status, is_featured,
        view_count, investor_count, start_date, end_date, duration_days, founder_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), ?, ?)
    `, [
      'EcoCharge - Affordable Solar Power for Nigerian Homes',
      'EcoCharge is revolutionizing access to clean, affordable energy in Nigeria by providing innovative solar power solutions for homes and small businesses.',
      'Clean Energy',
      'Lagos, Nigeria',
      50000000.00,
      12500000.00,
      50000.00,
      5000000.00,
      'Over 85 million Nigerians lack access to reliable electricity. The average Nigerian household spends ₦30,000-₦50,000 monthly on fuel for generators.',
      'EcoCharge offers affordable, modular solar power systems with flexible payment plans including pay-as-you-go options.',
      'Phase 1: Establish manufacturing facility. Phase 2: Launch pilot program. Phase 3: Scale to 10,000 installations.',
      'The Nigerian solar market is projected to reach $2.5 billion by 2025. Target market includes 15 million middle-income households.',
      'Local manufacturing reduces costs by 40%. Mobile money integration enables micro-payments. Proprietary IoT monitoring system.',
      'Year 1: Revenue ₦500M. Year 2: Revenue ₦2.5B, Net profit ₦400M. Year 3: Revenue ₦8B, Net profit ₦1.6B. ROI: 35% annually.',
      'CEO: Adebayo Okonkwo - 15 years in renewable energy. CTO: Chioma Nwosu - MIT graduate. CFO: Ibrahim Musa - Former investment banker.',
      'Currency fluctuation, regulatory changes, competition, customer payment defaults. Mitigations in place for all risks.',
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
      'approved',
      true,
      1250,
      45,
      90,
      founderId
    ]);

    const campaign1Id = campaign1Result.insertId;
    console.log(`✅ EcoCharge campaign created with ID: ${campaign1Id}`);

    // Add images for Campaign 1
    const images1 = [
      [campaign1Id, 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800', 'banner', 'Solar panels installation', 1, 'solar-banner.jpg', 'image/jpeg'],
      [campaign1Id, 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800', 'gallery', 'Residential solar installation', 2, 'solar-residential.jpg', 'image/jpeg'],
      [campaign1Id, 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=800', 'gallery', 'Solar panel manufacturing', 3, 'solar-manufacturing.jpg', 'image/jpeg'],
      [campaign1Id, 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800', 'gallery', 'Team installing solar panels', 4, 'solar-team.jpg', 'image/jpeg']
    ];
    for (const img of images1) {
      await connection.query(
        'INSERT INTO campaign_images (campaign_id, image_url, image_type, caption, order_index, filename, mime_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
        img
      );
    }
    console.log('✅ Campaign 1 images added');

    // Add milestones for Campaign 1
    await connection.query(`
      INSERT INTO campaign_milestones (campaign_id, title, description, target_amount, order_index, deliverables, timeline, success_metrics, status) VALUES
      (?, 'Manufacturing Facility Setup', 'Establish local manufacturing facility and hire technical team', 15000000.00, 1, 'Fully equipped facility, 50 trained technicians', '3 months', 'Facility operational, First batch produced', 'active'),
      (?, 'Pilot Program Launch', 'Launch pilot program in 5 Lagos communities', 20000000.00, 2, '500 installations completed, Mobile app launched', '6 months', '500 active customers, 90% satisfaction', 'pending'),
      (?, 'Scale to 10,000 Installations', 'Expand operations across Lagos and Abuja', 15000000.00, 3, '10,000 installations, 5 service centers', '12 months', '10,000 customers, 95% uptime', 'pending')
    `, [campaign1Id, campaign1Id, campaign1Id]);
    console.log('✅ Campaign 1 milestones added');

    // Campaign 2: AgroConnect
    console.log('\n📌 Creating Campaign 2: AgroConnect...');
    const [campaign2Result] = await connection.query(`
      INSERT INTO campaigns (
        title, description, category, location, target_amount, current_amount,
        minimum_investment, maximum_investment, problem_statement, solution,
        business_plan, market_analysis, competitive_advantage, financial_projections,
        team_information, risks_and_challenges, main_image_url, status, is_featured,
        view_count, investor_count, start_date, end_date, duration_days, founder_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 75 DAY), ?, ?)
    `, [
      'AgroConnect - Connecting Farmers Directly to Markets',
      'AgroConnect is a digital platform that connects smallholder farmers directly with buyers, eliminating middlemen and ensuring fair prices.',
      'Agriculture',
      'Abuja, Nigeria',
      35000000.00,
      8750000.00,
      25000.00,
      3000000.00,
      'Nigerian farmers lose 40-60% of their produce value to middlemen and post-harvest losses. Smallholder farmers lack access to markets.',
      'Mobile app connecting farmers directly to buyers with real-time pricing, logistics network, and cold storage facilities.',
      'Phase 1: Launch in FCT with 500 farmers. Phase 2: Establish collection centers. Phase 3: Expand to Kaduna and Kano.',
      'Nigeria\'s agricultural market is worth $90 billion annually. 14 million smallholder farmers could benefit from our platform.',
      'Direct farmer-to-buyer model eliminates middlemen. Proprietary logistics network. Cold storage reduces losses by 70%.',
      'Year 1: Revenue ₦400M, 2,000 farmers. Year 2: Revenue ₦1.8B, Net profit ₦300M. Year 3: Revenue ₦5B, Net profit ₦1B. ROI: 40% annually.',
      'CEO: Amina Bello - Agricultural economist. CTO: Emeka Okafor - Former Andela lead. COO: Yusuf Mohammed - 15 years logistics.',
      'Farmer adoption challenges, logistics in rural areas, seasonal demand fluctuations. Comprehensive mitigation strategies in place.',
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
      'approved',
      true,
      890,
      32,
      90,
      founderId
    ]);

    const campaign2Id = campaign2Result.insertId;
    console.log(`✅ AgroConnect campaign created with ID: ${campaign2Id}`);

    // Add images for Campaign 2
    const images2 = [
      [campaign2Id, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800', 'banner', 'Fresh farm produce', 1, 'agro-banner.jpg', 'image/jpeg'],
      [campaign2Id, 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800', 'gallery', 'Farmers in the field', 2, 'agro-farmers.jpg', 'image/jpeg'],
      [campaign2Id, 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800', 'gallery', 'Mobile app interface', 3, 'agro-app.jpg', 'image/jpeg'],
      [campaign2Id, 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800', 'gallery', 'Logistics and delivery', 4, 'agro-logistics.jpg', 'image/jpeg']
    ];
    for (const img of images2) {
      await connection.query(
        'INSERT INTO campaign_images (campaign_id, image_url, image_type, caption, order_index, filename, mime_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
        img
      );
    }
    console.log('✅ Campaign 2 images added');

    // Add milestones for Campaign 2
    await connection.query(`
      INSERT INTO campaign_milestones (campaign_id, title, description, target_amount, order_index, deliverables, timeline, success_metrics, status) VALUES
      (?, 'Platform Launch & Farmer Onboarding', 'Launch mobile app and onboard first 500 farmers', 10000000.00, 1, 'Mobile app live, 500 farmers registered', '4 months', '500 active farmers, 1000 transactions', 'active'),
      (?, 'Collection Centers & Cold Storage', 'Establish 3 collection centers with cold storage', 15000000.00, 2, '3 centers operational, 500 tons capacity', '8 months', '70% reduction in losses', 'pending'),
      (?, 'Multi-State Expansion', 'Expand to Kaduna and Kano states', 10000000.00, 3, '2,000 farmers onboarded, 5 new centers', '12 months', '10,000 tons traded', 'pending')
    `, [campaign2Id, campaign2Id, campaign2Id]);
    console.log('✅ Campaign 2 milestones added');

    // Campaign 3: HealthTech Nigeria
    console.log('\n📌 Creating Campaign 3: HealthTech Nigeria...');
    const [campaign3Result] = await connection.query(`
      INSERT INTO campaigns (
        title, description, category, location, target_amount, current_amount,
        minimum_investment, maximum_investment, problem_statement, solution,
        business_plan, market_analysis, competitive_advantage, financial_projections,
        team_information, risks_and_challenges, main_image_url, status, is_featured,
        view_count, investor_count, start_date, end_date, duration_days, founder_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 45 DAY), ?, ?)
    `, [
      'HealthTech Nigeria - Accessible Healthcare Through Telemedicine',
      'HealthTech Nigeria is democratizing healthcare access across Nigeria through our comprehensive telemedicine platform.',
      'Healthcare',
      'Port Harcourt, Nigeria',
      45000000.00,
      18000000.00,
      50000.00,
      4000000.00,
      'Nigeria has only 4 doctors per 10,000 people. 70% of Nigerians live more than 5km from the nearest healthcare facility.',
      '24/7 video consultations with licensed doctors, AI-powered symptom checker, e-prescription and medication delivery within 2 hours.',
      'Phase 1: Launch with 50 doctors. Phase 2: Expand to 200 doctors across 6 states. Phase 3: Add 500 doctors, integrate with HMOs.',
      'Nigeria\'s healthcare market is valued at $12 billion. Telemedicine market growing at 35% annually. Target: 40 million smartphone users.',
      'Largest network of verified doctors. AI-powered triage. Integrated pharmacy network. HIPAA-compliant security. Affordable: ₦2,000 per consultation.',
      'Year 1: Revenue ₦600M, 100,000 consultations. Year 2: Revenue ₦2.5B, Net profit ₦500M. Year 3: Revenue ₦8B, Net profit ₦2B. ROI: 45% annually.',
      'CEO: Dr. Oluwaseun Adebayo - 10 years clinical experience. CTO: Tunde Bakare - Former Flutterwave engineer. CMO: Dr. Ngozi Okonjo - WHO specialist.',
      'Regulatory compliance, doctor recruitment, data security, patient trust. Comprehensive mitigation strategies including MDCN approval.',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
      'approved',
      true,
      1580,
      67,
      90,
      founderId
    ]);

    const campaign3Id = campaign3Result.insertId;
    console.log(`✅ HealthTech Nigeria campaign created with ID: ${campaign3Id}`);

    // Add images for Campaign 3
    const images3 = [
      [campaign3Id, 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800', 'banner', 'Doctor consultation via telemedicine', 1, 'health-banner.jpg', 'image/jpeg'],
      [campaign3Id, 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800', 'gallery', 'Mobile app interface', 2, 'health-app.jpg', 'image/jpeg'],
      [campaign3Id, 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800', 'gallery', 'Healthcare professionals', 3, 'health-doctors.jpg', 'image/jpeg'],
      [campaign3Id, 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800', 'gallery', 'Patient using telemedicine', 4, 'health-patient.jpg', 'image/jpeg']
    ];
    for (const img of images3) {
      await connection.query(
        'INSERT INTO campaign_images (campaign_id, image_url, image_type, caption, order_index, filename, mime_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
        img
      );
    }
    console.log('✅ Campaign 3 images added');

    // Add milestones for Campaign 3
    await connection.query(`
      INSERT INTO campaign_milestones (campaign_id, title, description, target_amount, order_index, deliverables, timeline, success_metrics, status) VALUES
      (?, 'Platform Launch & Doctor Onboarding', 'Launch telemedicine platform with initial doctor network', 15000000.00, 1, 'Platform live, 50 doctors onboarded', '3 months', '5,000 consultations, 90% satisfaction', 'active'),
      (?, 'Multi-State Expansion & HMO Integration', 'Expand to 6 states and integrate with health insurance', 18000000.00, 2, '200 doctors across 6 states, 5 HMO partnerships', '6 months', '50,000 consultations, 5 HMO integrations', 'pending'),
      (?, 'National Scale & Specialist Network', 'Scale to all states with specialist services', 12000000.00, 3, '2,000 doctors, Specialist network, Mental health services', '12 months', '500,000 consultations', 'pending')
    `, [campaign3Id, campaign3Id, campaign3Id]);
    console.log('✅ Campaign 3 milestones added');

    // Display summary
    console.log('\n📊 Campaign Seed Summary:');
    console.log('═══════════════════════════════════════════════════════════════');
    
    const [campaigns] = await connection.query(`
      SELECT 
        id, title, category, target_amount, current_amount,
        ROUND((current_amount / target_amount) * 100, 2) as progress_percentage,
        investor_count, status, is_featured
      FROM campaigns
      WHERE id IN (?, ?, ?)
    `, [campaign1Id, campaign2Id, campaign3Id]);

    campaigns.forEach(campaign => {
      console.log(`\n📌 ${campaign.title}`);
      console.log(`   Category: ${campaign.category}`);
      console.log(`   Target: ₦${campaign.target_amount.toLocaleString()}`);
      console.log(`   Raised: ₦${campaign.current_amount.toLocaleString()} (${campaign.progress_percentage}%)`);
      console.log(`   Investors: ${campaign.investor_count}`);
      console.log(`   Status: ${campaign.status}`);
      console.log(`   Featured: ${campaign.is_featured ? 'Yes' : 'No'}`);
    });

    const [imageCount] = await connection.query('SELECT COUNT(*) as count FROM campaign_images WHERE campaign_id IN (?, ?, ?)', [campaign1Id, campaign2Id, campaign3Id]);
    const [milestoneCount] = await connection.query('SELECT COUNT(*) as count FROM campaign_milestones WHERE campaign_id IN (?, ?, ?)', [campaign1Id, campaign2Id, campaign3Id]);

    console.log('\n📈 Additional Data:');
    console.log(`   Campaign Images: ${imageCount[0].count}`);
    console.log(`   Milestones: ${milestoneCount[0].count}`);

    console.log('\n✅ Campaign seeding completed successfully!');
    console.log('═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error seeding campaigns:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the seed function
seedCampaigns();
