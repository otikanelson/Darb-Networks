require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function resetDatabase() {
  console.log('🔄 Starting database reset...');

  const config = {
    host: process.env.DB_HOST || 'gateway01.us-east-1.prod.aws.tidbcloud.com',
    port: parseInt(process.env.DB_PORT || '4000'),
    user: process.env.DB_USER || '3KStFbgUmQthP1a.root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'darb_network',
    ssl: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    },
    waitForConnections: true,
    connectionLimit: 1,
    queueLimit: 0,
    enableKeepAlive: true,
    connectTimeout: 30000
  };

  console.log(`📊 Database: ${config.database}`);
  console.log(`🏠 Host: ${config.host}:${config.port}`);
  console.log(`👤 User: ${config.user}`);

  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to database');

    // 1. Disable foreign key checks
    console.log('⏳ Disabling foreign key checks...');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');

    // Drop all tables
    console.log('⏳ Dropping existing tables...');
    await connection.execute('DROP TABLE IF EXISTS `investments`');
    await connection.execute('DROP TABLE IF EXISTS `campaigns`');
    await connection.execute('DROP TABLE IF EXISTS `users`');
    console.log('✅ Tables dropped');

    // Re-enable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

    // 2. Create users table
    console.log('⏳ Creating users table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`firebase_uid\` VARCHAR(255) UNIQUE,
        \`email\` VARCHAR(255) UNIQUE NOT NULL,
        \`password\` VARCHAR(255),
        \`fullName\` VARCHAR(255),
        \`userType\` ENUM('investor', 'admin', 'business', 'founder') DEFAULT 'investor',
        \`companyName\` VARCHAR(255),
        \`phoneNumber\` VARCHAR(20),
        \`address\` TEXT,
        \`bvn\` VARCHAR(11),
        \`cacNumber\` VARCHAR(50),
        \`accountNumber\` VARCHAR(10),
        \`bankName\` VARCHAR(50),
        \`profileImageUrl\` VARCHAR(255),
        \`isActive\` BOOLEAN DEFAULT true,
        \`isVerified\` BOOLEAN DEFAULT false,
        \`isEmailVerified\` BOOLEAN DEFAULT false,
        \`emailVerifiedAt\` DATETIME,
        \`lastLoginAt\` DATETIME,
        \`createdAt\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // 3. Create campaigns table
    console.log('⏳ Creating campaigns table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`campaigns\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`title\` VARCHAR(255) NOT NULL,
        \`description\` TEXT,
        \`fullDescription\` LONGTEXT,
        \`category\` VARCHAR(100),
        \`founder_id\` INT,
        \`target_amount\` DECIMAL(15, 2),
        \`current_amount\` DECIMAL(15, 2) DEFAULT 0,
        \`minimumInvestment\` DECIMAL(15, 2),
        \`riskLevel\` ENUM('low', 'medium', 'high') DEFAULT 'medium',
        \`investorCount\` INT DEFAULT 0,
        \`status\` ENUM('draft', 'approved', 'completed', 'closed') DEFAULT 'approved',
        \`is_featured\` BOOLEAN DEFAULT false,
        \`view_count\` INT DEFAULT 0,
        \`country\` VARCHAR(100),
        \`documents\` JSON,
        \`thumbnailUrl\` VARCHAR(500),
        \`createdAt\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`founder_id\`) REFERENCES \`users\`(\`id\`)
      )
    `);
    console.log('✅ Campaigns table created');

    // 4. Create investments table
    console.log('⏳ Creating investments table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`investments\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`userId\` INT NOT NULL,
        \`campaignId\` INT NOT NULL,
        \`amount\` DECIMAL(15, 2) NOT NULL,
        \`status\` ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
        \`transactionRef\` VARCHAR(255),
        \`createdAt\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`),
        FOREIGN KEY (\`campaignId\`) REFERENCES \`campaigns\`(\`id\`)
      )
    `);
    console.log('✅ Investments table created');

    // 5. Create admin user
    console.log('⏳ Creating admin user...');
    const adminPassword = 'Admin@123456';
    const hashedPassword = bcrypt.hashSync(adminPassword, 12);
    console.log('Generated hash:', hashedPassword);
    console.log('Hash length:', hashedPassword.length);

    await connection.execute(
      'INSERT INTO users (firebase_uid, email, fullName, userType, companyName, phoneNumber, address, password, bvn, cacNumber, accountNumber, bankName, profileImageUrl, isActive, isVerified, isEmailVerified, emailVerifiedAt, lastLoginAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      ['admin-uid-12345', 'admin@darb.com', 'Admin User', 'admin', 'Darb Networks', '+2348012345678', 'Lagos, Nigeria', hashedPassword, null, null, null, null, null, true, true, true, new Date(), null]
    );
    console.log('✅ Admin user created with password hash');

    // 6. Create 2 sample campaigns
    console.log('⏳ Creating sample campaigns...');

    // Get admin user ID
    const [adminUserResult] = await connection.query('SELECT id FROM users WHERE email = ?', ['admin@darb.com']);
    const adminUserId = adminUserResult[0].id;

    const campaign1Docs = JSON.stringify([
      { name: 'Business Plan', url: '/documents/ecocharge-plan.pdf', type: 'pdf' },
      { name: 'Financial Projections', url: '/documents/ecocharge-financials.xlsx', type: 'xlsx' }
    ]);

    await connection.execute(
      `INSERT INTO campaigns (title, description, fullDescription, category, founder_id, target_amount, current_amount, minimumInvestment, riskLevel, investorCount, status, is_featured, view_count, country, documents, thumbnailUrl) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'EcoCharge - Solar Energy Solution',
        'Revolutionary solar charging stations for Nigeria. We are building a network of eco-friendly charging infrastructure across major cities.',
        'EcoCharge is developing innovative solar-powered electric vehicle charging stations. Our mission is to provide sustainable energy solutions while creating employment opportunities in rural and urban areas. We are seeking ₦50 million to expand our network to 20 cities.',
        'Energy',
        adminUserId,
        50000000,
        15000000,
        500000,
        'medium',
        8,
        'approved',
        true,
        1250,
        'Nigeria',
        campaign1Docs,
        'https://via.placeholder.com/400x250?text=EcoCharge'
      ]
    );

    const campaign2Docs = JSON.stringify([
      { name: 'Pitch Deck', url: '/documents/farmtech-pitch.pdf', type: 'pdf' },
      { name: 'Technology Overview', url: '/documents/farmtech-tech.pdf', type: 'pdf' }
    ]);

    await connection.execute(
      `INSERT INTO campaigns (title, description, fullDescription, category, founder_id, target_amount, current_amount, minimumInvestment, riskLevel, investorCount, status, is_featured, view_count, country, documents, thumbnailUrl) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'FarmTech - Smart Agricultural Platform',
        'Digital platform connecting farmers directly to buyers using AI and IoT sensors. Eliminate middlemen and increase farmer profits by 40%.',
        'FarmTech is revolutionizing Nigerian agriculture through technology. Our platform uses IoT sensors to monitor crop health and AI to predict market prices. Farmers get real-time data and direct market access. We are raising ₦30 million to expand to 500 farms across Nigeria.',
        'Agriculture',
        adminUserId,
        30000000,
        8500000,
        250000,
        'low',
        12,
        'approved',
        true,
        845,
        'Nigeria',
        campaign2Docs,
        'https://via.placeholder.com/400x250?text=FarmTech'
      ]
    );

    console.log('✅ Sample campaigns created');

    console.log('✨ Database reset complete!');
    console.log('📋 Summary:');
    console.log('  - Admin user: admin@darb.com');
    console.log('  - Admin password: Admin@123456');
    console.log('  - Campaign 1: EcoCharge - Solar Energy Solution');
    console.log('  - Campaign 2: FarmTech - Smart Agricultural Platform');

  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

resetDatabase();
