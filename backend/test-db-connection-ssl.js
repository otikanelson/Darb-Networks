const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 Testing database connection...\n');
  
  const config = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectTimeout: 60000,
    ssl: { rejectUnauthorized: false }
  };

  console.log('Configuration:');
  console.log('  Host:', config.host);
  console.log('  Port:', config.port);
  console.log('  User:', config.user);
  console.log('  Database:', config.database);
  console.log('  SSL:', config.ssl ? 'Enabled' : 'Disabled');
  console.log('');

  let connection;
  try {
    console.log('📡 Attempting connection...');
    connection = await mysql.createConnection(config);
    console.log('✅ Connected successfully!\n');

    // Test query
    const [rows] = await connection.query('SELECT DATABASE() as db, NOW() as time');
    console.log('📊 Connection test query:');
    console.log('  Current database:', rows[0].db);
    console.log('  Server time:', rows[0].time);
    console.log('');

    // Check tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`📋 Found ${tables.length} tables in database`);
    
    // Check if campaign_milestones exists
    const [milestones] = await connection.query("SHOW TABLES LIKE 'campaign_milestones'");
    if (milestones.length > 0) {
      console.log('✅ campaign_milestones table exists');
      const [columns] = await connection.query('DESCRIBE campaign_milestones');
      console.log('   Columns:', columns.map(c => c.Field).join(', '));
    } else {
      console.log('❌ campaign_milestones table not found');
    }

    console.log('\n✅ Database connection test passed!');

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('\nError details:', error.code);
    
    if (error.code === 'ETIMEDOUT') {
      console.error('\n💡 Troubleshooting tips:');
      console.error('   1. Check if your IP is whitelisted in Aiven console');
      console.error('   2. Verify internet connection');
      console.error('   3. Try connecting from Aiven console first');
      console.error('   4. Check if VPN/firewall is blocking connection');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('👋 Connection closed');
    }
  }
}

testConnection();
