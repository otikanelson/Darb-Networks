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
    await connection.execute('DELETE FROM users WHERE email LIKE "%@test.com" OR email LIKE "%@example.com"');
    console.log('✓ Cleanup complete\n');

    // === CREATE USERS ===
    console.log('Creating users...');
    
    // 1. Brian (Founder)
    const brianPassword = 'Brian2025!';
    const brianHash = await bcrypt.hash(brianPassword, 10);
    const [brianResult] = await connection.execute(
      `INSERT INTO users (email, password, fullName, userType, companyName, phoneNumber, isActive, isVerified, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      ['brian@darbnetwork.com', brianHash, 'Brian', 'founder', 'Tech Innovations Ltd', '+2348123456789', true, true]
    );
    const brianId = brianResult.insertId;
    console.log(`  ✓ Brian (Founder) - ID: ${brianId}`);
    console.log(`    Email: brian@darbnetwork.com`);
    console.log(`    Password: ${brianPassword}\n`);

    // 2. Frank (Investor)
    const frankPassword = 'Frank2025!';
    const frankHash = await bcrypt.hash(frankPassword, 10);
    const [frankResult] = await connection.execute(
      `INSERT INTO users (email, password, fullName, userType, phoneNumber, isActive, isVerified, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      ['frank@darbnetwork.com', frankHash, 'Frank', 'investor', '+2348987654321', true, true]
    );
    const frankId = frankResult.insertId;
    console.log(`  ✓ Frank (Investor) - ID: ${frankId}`);
    console.log(`    Email: frank@darbnetwork.com`);
    console.log(`    Password: ${frankPassword}\n`);

    // 3. Nelson (Admin)
    const nelsonPassword = 'Nelson2025!';
    const nelsonHash = await bcrypt.hash(nelsonPassword, 10);
    const [nelsonResult] = await connection.execute(
      `INSERT INTO users (email, password, fullName, userType, phoneNumber, isActive, isVerified, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      ['nelson@darbnetwork.com', nelsonHash, 'Nelson', 'admin', '+2348111222333', true, true]
    );
    const nelsonId = nelsonResult.insertId;
    console.log(`  ✓ Nelson (Admin) - ID: ${nelsonId}`);
    console.log(`    Email: nelson@darbnetwork.com`);
    console.log(`    Password: ${nelsonPassword}\n`);

    // === CREATE CAMPAIGNS WITH IMAGES ===
    console.log('Creating campaigns with images...');

    const campaigns = [
      {
        title: 'EcoTech Solar Solutions',
        description: 'Revolutionary solar panel technology that increases efficiency by 40% while reducing costs. We are seeking investment to scale production and reach mass market across West Africa.',
        category: 'Energy & Green Tech',
        location: 'Lagos, Nigeria',
        target_amount: 50000000,
        minimum_investment: 100000,
        maximum_investment: 5000000,
        problem_statement: 'Traditional solar panels are expensive and inefficient, making clean energy inaccessible to most Nigerian households and businesses. Current solutions require significant upfront capital.',
        solution: 'Our patented nano-coating technology increases solar panel efficiency by 40% while reducing manufacturing costs by 30%. We manufacture locally, creating jobs and making solar energy affordable.',
        business_plan: 'We plan to manufacture 50,000 units in Year 1, targeting the residential and SME sectors. Revenue projection: ₦2.8B in Year 1, ₦8.5B in Year 3.',
        market_analysis: 'The Nigerian solar market is projected to grow 25% annually. We target the residential and SME sectors with a combined TAM of ₦180B.',
        main_image_url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&h=800&fit=crop&q=80',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        gallery_images: [
          { url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop&q=80', caption: 'Solar panel installation' },
          { url: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&h=600&fit=crop&q=80', caption: 'Our manufacturing facility' },
          { url: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=800&h=600&fit=crop&q=80', caption: 'Team at work' },
          { url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=600&fit=crop&q=80', caption: 'Solar farm project' }
        ]
      },
      {
        title: 'AgriConnect - Farm to Market Platform',
        description: 'Digital platform connecting farmers directly with buyers, eliminating middlemen and increasing farmer profits by 60%. Real-time pricing, logistics support, and payment security.',
        category: 'Food & Beverages',
        location: 'Abuja, Nigeria',
        target_amount: 25000000,
        minimum_investment: 50000,
        maximum_investment: 2000000,
        problem_statement: 'Farmers lose 40% of their income to middlemen and lack access to fair market prices. Post-harvest losses exceed 30% due to poor logistics.',
        solution: 'Our mobile app connects farmers directly with buyers, providing real-time pricing, quality inspection, and cold-chain logistics. Payments are secured through escrow.',
        business_plan: 'Platform fee model: 4% of transaction value. Year 1 GMV target: ₦2.4B, scaling to ₦28B by Year 3.',
        market_analysis: 'Nigerian agricultural supply chain is worth ₦12 trillion. Fresh produce segment alone represents ₦4.2 trillion opportunity.',
        main_image_url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&h=800&fit=crop&q=80',
        gallery_images: [
          { url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&h=600&fit=crop&q=80', caption: 'Fresh produce from farmers' },
          { url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=600&fit=crop&q=80', caption: 'Farmer using the app' },
          { url: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800&h=600&fit=crop&q=80', caption: 'Cold storage facility' }
        ]
      },
      {
        title: 'HealthTech Diagnostic App',
        description: 'AI-powered mobile app for preliminary health diagnostics, making healthcare accessible to remote areas. Instant health screening using smartphone camera and AI analysis.',
        category: 'Healthcare',
        location: 'Port Harcourt, Nigeria',
        target_amount: 35000000,
        minimum_investment: 75000,
        maximum_investment: 3000000,
        problem_statement: 'Rural areas lack access to basic healthcare diagnostics, leading to late disease detection. 60% of Nigerians live more than 10km from a health facility.',
        solution: 'AI-powered app provides preliminary diagnostics using smartphone camera for vital signs and symptom-based questionnaire. Connects users with licensed doctors via telemedicine.',
        business_plan: 'Freemium model: Free basic screening, ₦500/consultation. Targeting 500K users in Year 1, 5M by Year 3.',
        market_analysis: 'Nigerian digital health market projected to reach $4B by 2027. Telemedicine adoption growing 45% annually.',
        main_image_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=800&fit=crop&q=80',
        gallery_images: [
          { url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop&q=80', caption: 'Doctor consultation via app' },
          { url: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&h=600&fit=crop&q=80', caption: 'AI diagnostic interface' },
          { url: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&h=600&fit=crop&q=80', caption: 'Mobile health screening' }
        ]
      },
      {
        title: 'EduLearn - Online Skills Training',
        description: 'Affordable online platform offering vocational skills training with job placement guarantee. Focus on digital skills, coding, and entrepreneurship.',
        category: 'Education',
        location: 'Ibadan, Nigeria',
        target_amount: 15000000,
        minimum_investment: 25000,
        maximum_investment: 1000000,
        problem_statement: 'Youth unemployment is 42% due to skills gap. Traditional training programs cost ₦150K-₦500K, making them inaccessible to most.',
        solution: 'Online platform offering affordable training (₦15K/course) with payment plans. Partnerships with 150+ companies for guaranteed job placement.',
        business_plan: 'Course fee revenue + 10% placement fee from employers. Target: 10K students in Year 1, 50K by Year 3.',
        market_analysis: 'Nigerian EdTech market valued at $180M, growing at 37% CAGR. Youth vocational training is a ₦2.5T market.',
        main_image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&h=800&fit=crop&q=80',
        gallery_images: [
          { url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop&q=80', caption: 'Students learning online' },
          { url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop&q=80', caption: 'Coding bootcamp session' },
          { url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop&q=80', caption: 'Job placement ceremony' }
        ]
      },
      {
        title: 'SwiftPay - Cross-Border Remittance',
        description: 'Instant cross-border money transfer platform for diaspora Nigerians. Send money home in 60 seconds at 80% lower fees than traditional services.',
        category: 'Productivity',
        location: 'Lagos, Nigeria',
        target_amount: 85000000,
        minimum_investment: 250000,
        maximum_investment: 10000000,
        problem_statement: 'Nigeria receives $20B in remittances annually. Traditional services charge 8-12% fees and take 2-5 days.',
        solution: 'Blockchain-based instant transfers with 1.5% flat fee. Network of 1,200 cashout agents across 28 states for recipients without smartphones.',
        business_plan: '1.5% transaction fee. Year 1: ₦500M GMV, Year 3: ₦18B GMV. Break-even at Month 14.',
        market_analysis: 'West Africa remittance corridor: $35B annually, growing 7% YoY. 5.5M Nigerians in diaspora.',
        main_image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=800&fit=crop&q=80',
        gallery_images: [
          { url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop&q=80', caption: 'Mobile money transfer' },
          { url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop&q=80', caption: 'Cashout agent network' },
          { url: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=800&h=600&fit=crop&q=80', caption: 'App interface' }
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
          business_plan, market_analysis, main_image_url, video_url,
          status, is_featured, duration_days, start_date, end_date, founder_id,
          submitted_at, approved_at, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, NOW(), NOW(), NOW(), NOW())`,
        [
          camp.title, camp.description, camp.category, camp.location,
          camp.target_amount, 0, camp.minimum_investment, camp.maximum_investment,
          camp.problem_statement, camp.solution, camp.business_plan, camp.market_analysis,
          camp.main_image_url, camp.video_url || null,
          'approved', camp.title.includes('EcoTech') || camp.title.includes('HealthTech') || camp.title.includes('SwiftPay'),
          90, endDate, brianId
        ]
      );
      
      const campaignId = result.insertId;
      console.log(`  ✓ Created: ${camp.title} (ID: ${campaignId})`);

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
        console.log(`    Added ${camp.gallery_images.length} gallery images`);
      }
    }

    console.log('\n=== Database Seeded Successfully! ===\n');
    console.log('Login Credentials:');
    console.log('─'.repeat(50));
    console.log('👤 FOUNDER');
    console.log('   Email:    brian@darbnetwork.com');
    console.log(`   Password: ${brianPassword}`);
    console.log('');
    console.log('💰 INVESTOR');
    console.log('   Email:    frank@darbnetwork.com');
    console.log(`   Password: ${frankPassword}`);
    console.log('');
    console.log('🔧 ADMIN');
    console.log('   Email:    nelson@darbnetwork.com');
    console.log(`   Password: ${nelsonPassword}`);
    console.log('─'.repeat(50));
    console.log('\n✅ You can now:');
    console.log('   - Login to frontend with any account');
    console.log('   - View 5 campaigns with images');
    console.log('   - Create new campaigns as Brian (founder)');
    console.log('   - Make investments as Frank (investor)');
    console.log('   - Manage campaigns as Nelson (admin)\n');

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
