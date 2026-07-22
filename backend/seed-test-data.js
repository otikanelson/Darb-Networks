require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function seedTestData() {
  console.log('=== Seeding Test Data to TiDB ===\n');
  
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

    // Create test users
    console.log('Creating test users...');
    
    // 1. Test Founder
    const founderPassword = await bcrypt.hash('password123', 10);
    const [founderResult] = await connection.execute(
      `INSERT INTO users (email, password, fullName, userType, companyName, isActive, isVerified, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
      ['founder@test.com', founderPassword, 'Test Founder', 'founder', 'Test Startup Inc', true, true]
    );
    const founderId = founderResult.insertId;
    console.log(`  ✓ Created founder user (ID: ${founderId})`);

    // 2. Test Investor
    const investorPassword = await bcrypt.hash('password123', 10);
    const [investorResult] = await connection.execute(
      `INSERT INTO users (email, password, fullName, userType, isActive, isVerified, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
      ['investor@test.com', investorPassword, 'Test Investor', 'investor', true, true]
    );
    const investorId = investorResult.insertId;
    console.log(`  ✓ Created investor user (ID: ${investorId})`);

    // 3. Test Admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const [adminResult] = await connection.execute(
      `INSERT INTO users (email, password, fullName, userType, isActive, isVerified, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
      ['admin@test.com', adminPassword, 'Test Admin', 'admin', true, true]
    );
    const adminId = adminResult.insertId;
    console.log(`  ✓ Created admin user (ID: ${adminId})\n`);

    // Create test campaigns
    console.log('Creating test campaigns...');

    const campaigns = [
      {
        title: 'EcoTech Solar Solutions',
        description: 'Revolutionary solar panel technology that increases efficiency by 40%. We are seeking investment to scale production and reach mass market.',
        category: 'Technology',
        location: 'Lagos, Nigeria',
        target_amount: 50000000,
        minimum_investment: 100000,
        maximum_investment: 5000000,
        problem_statement: 'Current solar panels are expensive and inefficient, limiting adoption in Africa.',
        solution: 'Our patented technology reduces costs by 30% while increasing efficiency.',
        status: 'approved',
        is_featured: true,
        duration_days: 90,
        founder_id: founderId
      },
      {
        title: 'AgriConnect - Farm to Market Platform',
        description: 'Digital platform connecting farmers directly with buyers, eliminating middlemen and increasing farmer profits by 60%.',
        category: 'Agriculture',
        location: 'Abuja, Nigeria',
        target_amount: 25000000,
        minimum_investment: 50000,
        maximum_investment: 2000000,
        problem_statement: 'Farmers lose 40% of their income to middlemen and lack access to fair market prices.',
        solution: 'Our mobile app connects farmers directly with buyers, providing real-time pricing and logistics.',
        status: 'approved',
        is_featured: false,
        duration_days: 60,
        founder_id: founderId
      },
      {
        title: 'HealthTech Diagnostic App',
        description: 'AI-powered mobile app for preliminary health diagnostics, making healthcare accessible to remote areas.',
        category: 'Healthcare',
        location: 'Port Harcourt, Nigeria',
        target_amount: 35000000,
        minimum_investment: 75000,
        maximum_investment: 3000000,
        problem_statement: 'Rural areas lack access to basic healthcare diagnostics, leading to late disease detection.',
        solution: 'AI-powered app provides preliminary diagnostics using smartphone camera and questionnaire.',
        status: 'approved',
        is_featured: true,
        duration_days: 75,
        founder_id: founderId
      },
      {
        title: 'EduLearn - Online Skills Training',
        description: 'Affordable online platform offering vocational skills training with job placement guarantee.',
        category: 'Education',
        location: 'Ibadan, Nigeria',
        target_amount: 15000000,
        minimum_investment: 25000,
        maximum_investment: 1000000,
        problem_statement: 'Youth unemployment is high due to skills gap and expensive training programs.',
        solution: 'Online platform offering affordable, practical skills training with verified job placement.',
        status: 'under_review',
        is_featured: false,
        duration_days: 45,
        founder_id: founderId
      }
    ];

    for (const campaign of campaigns) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + campaign.duration_days);

      const [result] = await connection.execute(
        `INSERT INTO campaigns (
          title, description, category, location, target_amount, current_amount,
          minimum_investment, maximum_investment, problem_statement, solution,
          status, is_featured, duration_days, start_date, end_date, founder_id,
          createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, NOW(), NOW())`,
        [
          campaign.title,
          campaign.description,
          campaign.category,
          campaign.location,
          campaign.target_amount,
          0, // current_amount
          campaign.minimum_investment,
          campaign.maximum_investment,
          campaign.problem_statement,
          campaign.solution,
          campaign.status,
          campaign.is_featured,
          campaign.duration_days,
          endDate,
          campaign.founder_id
        ]
      );
      
      console.log(`  ✓ Created campaign: ${campaign.title} (ID: ${result.insertId})`);
    }

    console.log('\n=== Test Data Seeded Successfully! ===\n');
    console.log('Test Accounts:');
    console.log('  Founder:  founder@test.com  / password123');
    console.log('  Investor: investor@test.com / password123');
    console.log('  Admin:    admin@test.com    / admin123\n');
    console.log('You can now:');
    console.log('  1. Login with any of these accounts');
    console.log('  2. View campaigns on the frontend');
    console.log('  3. Test investment functionality');
    console.log('  4. Test campaign creation as founder\n');

  } catch (error) {
    console.error('✗ Error seeding data:', error.message);
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('\nNote: Some test data already exists. This is normal if you ran this script before.\n');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedTestData();
