// Setup script to create database tables in Aiven MySQL
require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  console.log('🔧 Setting up Aiven MySQL database...\n');

  let connection;
  
  try {
    // Connect to Aiven MySQL
    console.log('📡 Connecting to Aiven MySQL...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '25252'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        rejectUnauthorized: false // Accept self-signed certificates for Aiven
      },
      multipleStatements: true
    });

    console.log('✅ Connected to Aiven MySQL\n');

    // Drop existing tables first
    console.log('🗑️  Dropping existing tables (if any)...');
    const dropTablesSQL = `
      SET FOREIGN_KEY_CHECKS = 0;
      DROP TABLE IF EXISTS user_statistics;
      DROP TABLE IF EXISTS investment_summary;
      DROP TABLE IF EXISTS campaign_details;
      DROP TABLE IF EXISTS audit_logs;
      DROP TABLE IF EXISTS system_settings;
      DROP TABLE IF EXISTS email_verifications;
      DROP TABLE IF EXISTS password_resets;
      DROP TABLE IF EXISTS payment_webhooks;
      DROP TABLE IF EXISTS notifications;
      DROP TABLE IF EXISTS repayments;
      DROP TABLE IF EXISTS investments;
      DROP TABLE IF EXISTS campaign_favorites;
      DROP TABLE IF EXISTS campaign_views;
      DROP TABLE IF EXISTS campaign_images;
      DROP TABLE IF EXISTS campaign_milestones;
      DROP TABLE IF EXISTS campaigns;
      DROP TABLE IF EXISTS users;
      SET FOREIGN_KEY_CHECKS = 1;
    `;
    
    await connection.query(dropTablesSQL);
    console.log('✅ Existing tables dropped\n');

    // Read schema file
    console.log('📄 Reading schema file...');
    const schemaPath = path.join(__dirname, 'database', 'schema-aiven.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema
    console.log('🔨 Creating tables...');
    await connection.query(schema);

    console.log('✅ Database schema created successfully!\n');

    // Verify tables were created
    console.log('🔍 Verifying tables...');
    const [tables] = await connection.query('SHOW TABLES');
    
    console.log(`\n✅ Created ${tables.length} tables:`);
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   - ${tableName}`);
    });

    console.log('\n🎉 Database setup complete!');
    console.log('\nNext steps:');
    console.log('1. Generate JWT_SECRET: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
    console.log('2. Add your Paystack keys to .env.production');
    console.log('3. Import .env.production to Vercel');
    console.log('4. Redeploy your backend\n');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run setup
setupDatabase();
