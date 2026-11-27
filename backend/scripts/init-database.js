/**
 * Initialize Local Database
 * Creates all tables and prepares for testing
 * Usage: node scripts/init-database.js [mysql_password]
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  const password = process.argv[2] || process.env.DB_PASSWORD || '';
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const dbName = process.env.DB_NAME || 'darb_network_dev';
  const port = parseInt(process.env.DB_PORT || '3306');

  console.log('🔧 Initializing local database...');
  console.log(`📍 Host: ${host}:${port}`);
  console.log(`👤 User: ${user}`);
  console.log(`📦 Database: ${dbName}\n`);

  let connection;

  try {
    // Connect without database first
    console.log('🔌 Connecting to MySQL...');
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true,
      connectionLimit: 1,
      waitForConnections: true,
      enableKeepAlive: true,
      keepAliveInitialDelayMs: 0,
    });
    console.log('✅ Connected\n');

    // Create database
    console.log(`📦 Creating database '${dbName}'...`);
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log('✅ Database created/exists\n');

    // Switch to database
    await connection.query(`USE \`${dbName}\``);

    // Drop existing tables (careful!)
    console.log('🗑️  Dropping existing tables...');
    const tables = [
      'campaign_documents',
      'campaign_images',
      'investments',
      'milestones',
      'campaigns',
      'users'
    ];

    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of tables) {
      try {
        await connection.query(`DROP TABLE IF EXISTS \`${table}\``);
        console.log(`  ✓ ${table}`);
      } catch (err) {
        console.log(`  ⚠ ${table}: ${err.message.substring(0, 50)}`);
      }
    }
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Tables dropped\n');

    // Create tables
    console.log('📋 Creating tables...\n');

    // Users table
    console.log('  Creating users table...');
    await connection.query(`
      CREATE TABLE users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        firebase_uid VARCHAR(128) NULL UNIQUE,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NULL,
        fullName VARCHAR(100) NOT NULL,
        userType ENUM('founder', 'investor', 'admin') NOT NULL,
        companyName VARCHAR(100) NULL,
        phoneNumber VARCHAR(20) NULL,
        address TEXT NULL,
        
        bvn VARCHAR(11) NULL,
        cacNumber VARCHAR(50) NULL,
        
        accountNumber VARCHAR(10) NULL,
        bankName VARCHAR(50) NULL,
        bankCode VARCHAR(10) NULL,
        
        profileImageUrl VARCHAR(500) NULL,
        bio TEXT NULL,
        website VARCHAR(255) NULL,
        linkedinUrl VARCHAR(255) NULL,
        twitterUrl VARCHAR(255) NULL,
        
        isActive BOOLEAN DEFAULT TRUE,
        isVerified BOOLEAN DEFAULT FALSE,
        isEmailVerified BOOLEAN DEFAULT FALSE,
        isPhoneVerified BOOLEAN DEFAULT FALSE,
        isBvnVerified BOOLEAN DEFAULT FALSE,
        isCacVerified BOOLEAN DEFAULT FALSE,
        
        emailVerifiedAt DATETIME NULL,
        phoneVerifiedAt DATETIME NULL,
        bvnVerifiedAt DATETIME NULL,
        cacVerifiedAt DATETIME NULL,
        lastLoginAt DATETIME NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_email (email),
        INDEX idx_firebase_uid (firebase_uid),
        INDEX idx_userType (userType),
        INDEX idx_isActive (isActive)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('  ✓ users');

    // Campaigns table
    console.log('  Creating campaigns table...');
    await connection.query(`
      CREATE TABLE campaigns (
        id INT PRIMARY KEY AUTO_INCREMENT,
        
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        location VARCHAR(100) NOT NULL,
        country VARCHAR(100) NOT NULL DEFAULT 'Nigeria',
        
        target_amount DECIMAL(15,2) NOT NULL,
        current_amount DECIMAL(15,2) DEFAULT 0.00,
        minimum_investment DECIMAL(15,2) NOT NULL,
        maximum_investment DECIMAL(15,2) NULL,
        
        problem_statement TEXT NULL,
        solution TEXT NULL,
        business_plan TEXT NULL,
        market_analysis TEXT NULL,
        competitive_advantage TEXT NULL,
        financial_projections TEXT NULL,
        team_information TEXT NULL,
        risks_and_challenges TEXT NULL,
        
        main_image_url VARCHAR(500) NULL,
        video_url VARCHAR(500) NULL,
        pitch_deck_url VARCHAR(500) NULL,
        business_plan_url VARCHAR(500) NULL,
        
        documents JSON NULL,
        
        status ENUM('draft', 'submitted', 'under_review', 'approved', 'rejected', 'paused', 'completed', 'cancelled') DEFAULT 'draft',
        is_featured BOOLEAN DEFAULT FALSE,
        is_urgent BOOLEAN DEFAULT FALSE,
        
        view_count INT DEFAULT 0,
        favorite_count INT DEFAULT 0,
        investor_count INT DEFAULT 0,
        share_count INT DEFAULT 0,
        
        start_date DATETIME NULL,
        end_date DATETIME NULL,
        duration_days INT DEFAULT 90,
        
        founder_id INT NOT NULL,
        reviewed_by INT NULL,
        
        admin_comments TEXT NULL,
        rejection_reason TEXT NULL,
        
        submitted_at DATETIME NULL,
        approved_at DATETIME NULL,
        rejected_at DATETIME NULL,
        featured_at DATETIME NULL,
        completed_at DATETIME NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (founder_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
        
        INDEX idx_founder_id (founder_id),
        INDEX idx_status (status),
        INDEX idx_category (category),
        INDEX idx_country (country),
        INDEX idx_createdAt (createdAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('  ✓ campaigns');

    // Milestones table
    console.log('  Creating milestones table...');
    await connection.query(`
      CREATE TABLE milestones (
        id INT PRIMARY KEY AUTO_INCREMENT,
        campaign_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NULL,
        target_amount DECIMAL(15,2) NOT NULL,
        achieved BOOLEAN DEFAULT FALSE,
        achieved_at DATETIME NULL,
        target_date DATE NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
        INDEX idx_campaign_id (campaign_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('  ✓ milestones');

    // Investments table
    console.log('  Creating investments table...');
    await connection.query(`
      CREATE TABLE investments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        campaign_id INT NOT NULL,
        investor_id INT NOT NULL,
        
        amount DECIMAL(15,2) NOT NULL,
        shares INT NULL,
        
        reference_id VARCHAR(100) NULL,
        payment_method VARCHAR(50) NULL,
        
        status ENUM('pending', 'completed', 'failed', 'refunded', 'cancelled') DEFAULT 'pending',
        
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
        FOREIGN KEY (investor_id) REFERENCES users(id) ON DELETE CASCADE,
        
        INDEX idx_campaign_id (campaign_id),
        INDEX idx_investor_id (investor_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('  ✓ investments');

    // Campaign images table
    console.log('  Creating campaign_images table...');
    await connection.query(`
      CREATE TABLE campaign_images (
        id INT PRIMARY KEY AUTO_INCREMENT,
        campaign_id INT NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        image_type ENUM('main', 'gallery') DEFAULT 'gallery',
        \`order\` INT DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
        INDEX idx_campaign_id (campaign_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('  ✓ campaign_images');

    // Campaign documents table
    console.log('  Creating campaign_documents table...');
    await connection.query(`
      CREATE TABLE campaign_documents (
        id INT PRIMARY KEY AUTO_INCREMENT,
        campaign_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        url VARCHAR(500) NOT NULL,
        type VARCHAR(50) NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
        INDEX idx_campaign_id (campaign_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('  ✓ campaign_documents');

    console.log('  Creating investments table...');
    await connection.query(`
      CREATE TABLE investments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        campaign_id INT NOT NULL,
        investor_id INT NOT NULL,
        
        amount DECIMAL(15,2) NOT NULL,
        payment_reference VARCHAR(100) UNIQUE,
        payment_status ENUM('pending', 'completed', 'failed', 'abandoned') DEFAULT 'pending',
        payment_method VARCHAR(50),
        payment_gateway_id VARCHAR(100),
        payment_gateway_response JSON,
        
        confirmed_at DATETIME,
        transaction_id VARCHAR(100),
        investor_message TEXT,
        campaign_snapshot JSON,
        
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
        FOREIGN KEY (investor_id) REFERENCES users(id) ON DELETE CASCADE,
        
        INDEX idx_campaign_id (campaign_id),
        INDEX idx_investor_id (investor_id),
        INDEX idx_payment_status (payment_status),
        INDEX idx_payment_reference (payment_reference)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('  ✓ investments');

    console.log('  Creating investment_notifications table...');
    await connection.query(`
      CREATE TABLE investment_notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        investment_id INT,
        user_id INT NOT NULL,
        
        type VARCHAR(50),
        title VARCHAR(255),
        message TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_created (createdAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('  ✓ investment_notifications');

    console.log('  Creating payment_webhooks table...');
    await connection.query(`
      CREATE TABLE payment_webhooks (
        id INT PRIMARY KEY AUTO_INCREMENT,
        payment_reference VARCHAR(100),
        gateway VARCHAR(50),
        event_type VARCHAR(50),
        payload JSON,
        processed BOOLEAN DEFAULT FALSE,
        
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        INDEX idx_reference (payment_reference),
        INDEX idx_gateway (gateway),
        INDEX idx_created (createdAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('  ✓ payment_webhooks\n');

    console.log('✨ Database initialization complete!\n');
    console.log('📊 Summary:');
    console.log(`  ✓ Database: ${dbName}`);
    console.log('  ✓ Tables: users, campaigns, milestones, investments, campaign_images, campaign_documents');
    console.log('  ✓ Relationships: Configured with foreign keys');
    console.log('\n🎉 Ready for testing! You can now:');
    console.log('  1. Create a user (founder/investor)');
    console.log('  2. Add a campaign');
    console.log('  3. Create investments');
    console.log('  4. Test payment integration\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_FOR_USER') {
      console.log('\n💡 Password incorrect. Try:');
      console.log('   node scripts/init-database.js "your_mysql_password"\n');
    } else if (error.code === 'ER_BAD_HOST_ERROR') {
      console.log('\n💡 Cannot connect to MySQL. Make sure:');
      console.log('   1. MySQL service is running');
      console.log('   2. Host is correct: ' + host);
      console.log('   3. Port is correct: ' + port + '\n');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initializeDatabase();
