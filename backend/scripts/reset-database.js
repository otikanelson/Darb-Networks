/**
 * Reset Database Script
 * Clears all data from the database while preserving the schema
 * This is safe for development/testing only
 */

require('dotenv').config();

const mysql = require('mysql2/promise');

async function resetDatabase() {
  console.log('🔄 Starting database reset...');
  console.log(`📊 Database: ${process.env.DB_NAME}`);
  console.log(`🏠 Host: ${process.env.DB_HOST}`);

  let connection;

  try {
    // Create connection
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

    console.log('✅ Connected to database');

    // Get list of all tables
    const [tables] = await connection.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`,
      [process.env.DB_NAME]
    );

    console.log(`📋 Found ${tables.length} tables to clear`);

    // Disable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('🔓 Disabled foreign key constraints');

    // Clear each table
    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      await connection.query(`TRUNCATE TABLE \`${tableName}\``);
      console.log(`  ✓ Cleared table: ${tableName}`);
    }

    // Re-enable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('🔒 Re-enabled foreign key constraints');

    // Reset auto-increment for all tables
    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      try {
        await connection.query(`ALTER TABLE \`${tableName}\` AUTO_INCREMENT = 1`);
        console.log(`  ✓ Reset auto-increment for: ${tableName}`);
      } catch (err) {
        // Some tables might not have auto-increment, skip silently
      }
    }

    console.log('\n✨ Database reset complete! All tables are now empty.');
    console.log('📝 Schema is preserved. Ready for fresh data entry.\n');

  } catch (error) {
    console.error('❌ Error resetting database:');
    console.error(error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the script
resetDatabase();
