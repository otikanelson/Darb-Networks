/**
 * Setup Local Database Script (Interactive)
 * Creates database and runs the schema
 * Accepts password as command line argument or prompts for it
 */

require('dotenv').config();

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  console.log('🔧 Setting up local database...');

  let connection;

  // Get password from command line or use empty string
  const passwordArg = process.argv[2];
  const password = passwordArg || process.env.DB_PASSWORD || '';

  try {
    // First, connect without specifying database
    console.log(`📍 Connecting to MySQL at ${process.env.DB_HOST}:${process.env.DB_PORT}...`);
    console.log(`👤 User: ${process.env.DB_USER}`);
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: password,
      connectionLimit: 1,
    });

    console.log('✅ Connected to MySQL');

    // Create database
    console.log(`📦 Creating database: ${process.env.DB_NAME}`);
    try {
      await connection.query(
        `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` 
         CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
      );
      console.log(`✅ Database created/exists`);
    } catch (err) {
      if (err.code !== 'ER_DB_CREATE_EXISTS') {
        throw err;
      }
      console.log(`ℹ Database already exists`);
    }

    // Switch to the database
    await connection.query(`USE \`${process.env.DB_NAME}\``);

    // Drop all tables first (safe reset)
    console.log(`🗑️  Dropping existing tables...`);
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    const [tables] = await connection.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`,
      [process.env.DB_NAME]
    );

    for (const table of tables) {
      await connection.query(`DROP TABLE IF EXISTS \`${table.TABLE_NAME}\``);
      console.log(`  ✓ Dropped ${table.TABLE_NAME}`);
    }

    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log(`✅ All tables dropped`);

    // Read schema file
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split by statements (simple split by semicolon)
    const statements = schema.split(';').filter(stmt => stmt.trim());

    console.log(`📋 Creating schema (${statements.length} statements)...`);
    let count = 0;
    let skipped = 0;

    for (const statement of statements) {
      const trimmed = statement.trim();
      if (trimmed && !trimmed.toUpperCase().startsWith('DROP TABLE')) {
        try {
          await connection.query(trimmed);
          count++;
        } catch (err) {
          skipped++;
          if (!err.message.includes('already exists')) {
            console.warn(`  ⚠ Error: ${err.message.substring(0, 60)}`);
          }
        }
      }
    }

    console.log(`✅ Schema created (${count} statements, ${skipped} skipped)`);

    // Get table count
    const [finalTables] = await connection.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`,
      [process.env.DB_NAME]
    );

    console.log(`\n✨ Database setup complete!`);
    console.log(`📋 Tables created: ${finalTables.length}`);
    finalTables.forEach(t => console.log(`  - ${t.TABLE_NAME}`));
    console.log(`\n📊 Database is ready for testing!`);

  } catch (error) {
    console.error('❌ Setup failed:');
    console.error(error.message);
    if (error.code === 'ER_ACCESS_DENIED_FOR_USER') {
      console.log('\n💡 Tip: Try running with password: node scripts/setup-local-db-interactive.js "your_password"');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();
