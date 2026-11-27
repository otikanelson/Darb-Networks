/**
 * Check Database Connection
 * Verifies connection to the database
 */

require('dotenv').config({ path: './.env.production' });

const mysql = require('mysql2/promise');

async function checkConnection() {
  console.log('🔍 Checking database connection...');
  console.log(`📊 Database: ${process.env.DB_NAME}`);
  console.log(`🏠 Host: ${process.env.DB_HOST}`);
  console.log(`👤 User: ${process.env.DB_USER}`);

  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
      } : undefined
    });

    console.log('✅ Connected successfully!');

    // Get table count
    const [tables] = await connection.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`,
      [process.env.DB_NAME]
    );

    console.log(`📋 Tables in database: ${tables.length}`);
    tables.forEach(t => console.log(`  - ${t.TABLE_NAME}`));

    // Get row counts
    console.log('\n📊 Row counts:');
    const [result] = await connection.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM campaigns) as campaigns,
        (SELECT COUNT(*) FROM investments) as investments,
        (SELECT COUNT(*) FROM milestones) as milestones
    `);
    
    if (result && result.length > 0) {
      const counts = result[0];
      console.log(`  users: ${counts.users}`);
      console.log(`  campaigns: ${counts.campaigns}`);
      console.log(`  investments: ${counts.investments}`);
      console.log(`  milestones: ${counts.milestones}`);
    }

  } catch (error) {
    console.error('❌ Connection failed:');
    console.error(error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkConnection();
