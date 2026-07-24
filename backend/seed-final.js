require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function seedDatabase() {
  console.log('=== Seeding Darb Network Database ===\n');
  
  const config = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '4000'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true
    },
    connectTimeout: 60000
  };

  let connection;

  try {
    console.log('Connecting to TiDB...');
    connection = await mysql.createConnection(config);
    console.log('✓ Connected\n');

    // Clear existing test data
    console.log('Cleaning up old test data...');
    await connection.execute('DELETE FROM campaign_images WHERE 1=1');
    await connection.execute('DELETE FROM investments WHERE 1=1');
    await connection.execute('DELETE FROM campaigns WHERE 1=1');
    await connection.execute('DELETE FROM users WHERE email LIKE "%@darbnetwork.com" OR email LIKE "%@test.com" OR email LIKE "%@example.com"');
    console.log('✓ Cleanup complete\n');

    // === CREATE USERS ===
    console.log('Creating users...');
    
    // 1. Brian (Founder)
    const brianPassword = 'Brian2025!';
    const brianHash = await bcrypt.hash(brianPassword, 10);
    const [brianResult] = await connection.execute(
      `INSERT INTO users (email, password, fullName, userType, companyName, phoneNumber, isActive, isVerified, profileImageUrl, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        'brian@darbnetwork.com', 
        brianHash, 
        'Brian Okeke', 
        'founder', 
        'Tech Innovations Ltd', 
        '+2348123456789', 
        true, 
        true, 
        'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400'
      ]
    );
    const brianId = brianResult.insertId;
    console.log(`  ✓ Brian (Founder) - ID: ${brianId}`);

    // 2. Frank (Investor)
    const frankPassword = 'Frank2025!';
    const frankHash = await bcrypt.hash(frankPassword, 10);
    const [frankResult] = await connection.execute(
      `INSERT INTO users (email, password, fullName, userType, phoneNumber, isActive, isVerified, profileImageUrl, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        'frank@darbnetwork.com', 
        frankHash, 
        'Frank Egwu', 
        'investor', 
        '+2348987654321', 
        true, 
        true, 
        'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400'
      ]
    );
    const frankId = frankResult.insertId;
    console.log(`  ✓ Frank (Investor) - ID: ${frankId}`);

    // 3. Nelson (Admin)
    const nelsonPassword = 'Nelson2025!';
    const nelsonHash = await bcrypt.hash(nelsonPassword, 10);
    const [nelsonResult] = await connection.execute(
      `INSERT INTO users (email, password, fullName, userType, phoneNumber, isActive, isVerified, profileImageUrl, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        'nelson@darbnetwork.com', 
        nelsonHash, 
        'Nelson Somto', 
        'admin', 
        '+2348111222333', 
        true, 
        true, 
        'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400'
      ]
    );
    const nelsonId = nelsonResult.insertId;
    console.log(`  ✓ Nelson (Admin) - ID: ${nelsonId}\n`);

    // === CREATE CAMPAIGNS WITH IMAGES AND RAISED AMOUNTS ===
    console.log('Creating campaigns with reliable direct images and active raised funds...');

    const campaigns = [
      {
        title: 'EcoTech Solar Solutions',
        description: 'Revolutionary solar panel technology that increases efficiency by 40% while reducing costs. We are seeking investment to scale production and reach mass market across West Africa.',
        category: 'Energy & Green Tech',
        location: 'Lagos, Nigeria',
        target_amount: 50000000,
        current_amount: 18500000, // 37% funded
        minimum_investment: 100000,
        maximum_investment: 5000000,
        view_count: 342,
        favorite_count: 28,
        problem_statement: 'Traditional solar panels are expensive and inefficient, making clean energy inaccessible to most Nigerian households and businesses.',
        solution: 'Our patented nano-coating technology increases solar panel efficiency by 40% while reducing manufacturing costs by 30%.',
        business_plan: 'We plan to manufacture 50,000 units in Year 1. Revenue projection: ₦2.8B in Year 1, ₦8.5B in Year 3.',
        market_analysis: 'The Nigerian solar market is projected to grow 25% annually with a TAM of ₦180B.',
        main_image_url: 'https://images.pexels.com/photos/356036/pexels-photo-356036.jpeg?auto=compress&cs=tinysrgb&w=800',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        gallery_images: [
          { url: 'https://images.pexels.com/photos/356036/pexels-photo-356036.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Solar panel installation' },
          { url: 'https://images.pexels.com/photos/2800832/pexels-photo-2800832.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Our manufacturing facility' }
        ]
      },
      {
        title: 'AgriConnect - Farm to Market Platform',
        description: 'Digital platform connecting farmers directly with buyers, eliminating middlemen and increasing farmer profits by 60%.',
        category: 'Food & Beverages',
        location: 'Abuja, Nigeria',
        target_amount: 25000000,
        current_amount: 12500000, // 50% funded
        minimum_investment: 50000,
        maximum_investment: 2000000,
        view_count: 189,
        favorite_count: 15,
        problem_statement: 'Farmers lose 40% of their income to middlemen and lack access to fair market prices.',
        solution: 'Our mobile app connects farmers directly with buyers, providing real-time pricing and logistics support.',
        business_plan: 'Platform fee model: 4% of transaction value. Year 1 GMV target: ₦2.4B.',
        market_analysis: 'Nigerian agricultural supply chain is worth ₦12 trillion.',
        main_image_url: 'https://images.pexels.com/photos/2255801/pexels-photo-2255801.jpeg?auto=compress&cs=tinysrgb&w=800',
        gallery_images: [
          { url: 'https://images.pexels.com/photos/2255801/pexels-photo-2255801.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Fresh produce from farmers' },
          { url: 'https://images.pexels.com/photos/2132250/pexels-photo-2132250.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Farmer using the app' }
        ]
      },
      {
        title: 'HealthTech Diagnostic App',
        description: 'AI-powered mobile app for preliminary health diagnostics, making healthcare accessible to remote areas.',
        category: 'Healthcare',
        location: 'Port Harcourt, Nigeria',
        target_amount: 35000000,
        current_amount: 26250000, // 75% funded
        minimum_investment: 75000,
        maximum_investment: 3000000,
        view_count: 512,
        favorite_count: 42,
        problem_statement: 'Rural areas lack access to basic healthcare diagnostics, leading to late disease detection.',
        solution: 'AI-powered app provides preliminary diagnostics using smartphone camera for vital signs.',
        business_plan: 'Freemium model: Free basic screening, ₦500/consultation.',
        market_analysis: 'Nigerian digital health market projected to reach $4B by 2027.',
        main_image_url: 'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=800',
        gallery_images: [
          { url: 'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Doctor consultation via app' }
        ]
      },
      {
        title: 'EduLearn - Online Skills Training',
        description: 'Affordable online platform offering vocational skills training with job placement guarantee.',
        category: 'Education',
        location: 'Ibadan, Nigeria',
        target_amount: 15000000,
        current_amount: 3000000, // 20% funded
        minimum_investment: 25000,
        maximum_investment: 1000000,
        view_count: 98,
        favorite_count: 9,
        problem_statement: 'Youth unemployment is high due to the skills gap in traditional curricula.',
        solution: 'Online platform offering affordable training (₦15K/course) with job placement support.',
        business_plan: 'Course fee revenue + 10% placement fee from employers.',
        market_analysis: 'Nigerian EdTech market valued at $180M, growing at 37% CAGR.',
        main_image_url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
        gallery_images: [
          { url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Students learning online' }
        ]
      },
      {
        title: 'SwiftPay - Cross-Border Remittance',
        description: 'Instant cross-border money transfer platform for diaspora Nigerians at lower fees.',
        category: 'Productivity',
        location: 'Lagos, Nigeria',
        target_amount: 85000000,
        current_amount: 51000000, // 60% funded
        minimum_investment: 250000,
        maximum_investment: 10000000,
        view_count: 620,
        favorite_count: 55,
        problem_statement: 'Traditional services charge high fees and take 2-5 days for remittance.',
        solution: 'Instant transfers with 1.5% flat fee and local cashout agent network.',
        business_plan: '1.5% transaction fee. Break-even at Month 14.',
        market_analysis: 'West Africa remittance corridor: $35B annually.',
        main_image_url: 'https://images.pexels.com/photos/6214476/pexels-photo-6214476.jpeg?auto=compress&cs=tinysrgb&w=800',
        gallery_images: [
          { url: 'https://images.pexels.com/photos/6214476/pexels-photo-6214476.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Mobile money transfer' }
        ]
      }
    ];

    for (const camp of campaigns) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 60);

      const [result] = await connection.execute(
        `INSERT INTO campaigns (
          title, description, category, location, target_amount, current_amount,
          minimum_investment, maximum_investment, problem_statement, solution,
          business_plan, market_analysis, main_image_url, video_url, view_count, favorite_count,
          status, is_featured, duration_days, start_date, end_date, founder_id,
          submitted_at, approved_at, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 90, NOW(), ?, ?, NOW(), NOW(), NOW(), NOW())`,
        [
          camp.title, camp.description, camp.category, camp.location,
          camp.target_amount, camp.current_amount, camp.minimum_investment, camp.maximum_investment,
          camp.problem_statement, camp.solution, camp.business_plan, camp.market_analysis,
          camp.main_image_url, camp.video_url || null, camp.view_count || 0, camp.favorite_count || 0,
          'approved', camp.title.includes('EcoTech') || camp.title.includes('HealthTech') || camp.title.includes('SwiftPay'),
          endDate, brianId
        ]
      );
      
      const campaignId = result.insertId;
      console.log(`  ✓ Created: ${camp.title} (ID: ${campaignId}) - Raised: ₦${camp.current_amount.toLocaleString()}`);

      // Add gallery images
      if (camp.gallery_images) {
        for (let i = 0; i < camp.gallery_images.length; i++) {
          const img = camp.gallery_images[i];
          await connection.execute(
            `INSERT INTO campaign_images (campaign_id, image_url, image_type, caption, filename, order_index, createdAt)
             VALUES (?, ?, 'gallery', ?, ?, ?, NOW())`,
            [campaignId, img.url, img.caption, `gallery-${i}.jpg`, i]
          );
        }
      }
    }

    console.log('\n=== Database Seeded Successfully! ===\n');

  } catch (error) {
    console.error('\n✗ Error seeding database:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedDatabase();