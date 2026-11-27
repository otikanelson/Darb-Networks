/**
 * Setup Local Database Script
 * Creates database and runs the schema
 */

require('dotenv').config();

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  console.log('🔧 Setting up local database...');

  let connection;

  try {
    // First, connect without specifying database
    console.log(`📍 Connecting to MySQL at ${process.env.DB_HOST}...`);
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || '',
    });

    console.log('✅ Connected to MySQL');

    // Create database
    console.log(`📦 Creating database: ${process.env.DB_NAME}`);
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` 
       CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`✅ Database created`);

    // Switch to the database
    await connection.query(`USE \`${process.env.DB_NAME}\``);

    // Read schema file
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split by statements (simple split by semicolon)
    const statements = schema.split(';').filter(stmt => stmt.trim());

    console.log(`📋 Running ${statements.length} SQL statements...`);
    let count = 0;

    for (const statement of statements) {
      const trimmed = statement.trim();
      if (trimmed) {
        try {
          await connection.query(trimmed);
          count++;
          if (count % 5 === 0) {
            console.log(`  ✓ Executed ${count}/${statements.length} statements`);
          }
        } catch (err) {
          // Skip duplicate table errors during schema creation
          if (err.code !== 'ER_TABLE_EXISTS_ERROR') {
            console.warn(`  ⚠ Skipped statement: ${err.message.substring(0, 50)}`);
          }
        }
      }
    }

    console.log(`✅ All schema statements executed`);

    // Get table count
    const [tables] = await connection.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`,
      [process.env.DB_NAME]
    );

    console.log(`\n📊 Database setup complete!`);
    console.log(`📋 Tables created: ${tables.length}`);
    tables.forEach(t => console.log(`  - ${t.TABLE_NAME}`));

  } catch (error) {
    console.error('❌ Setup failed:');
    console.error(error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();
