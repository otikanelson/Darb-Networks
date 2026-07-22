require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkPermissions() {
  console.log('=== Checking TiDB Permissions ===\n');
  
  const config = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '4000'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
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

    // Show current user
    console.log('Current user:');
    const [user] = await connection.execute('SELECT USER()');
    console.log(`  ${user[0]['USER()']}\n`);

    // Show databases
    console.log('Available databases:');
    const [databases] = await connection.execute('SHOW DATABASES');
    databases.forEach(db => {
      console.log(`  - ${Object.values(db)[0]}`);
    });
    console.log('');

    // Try to create a database
    console.log('Testing database creation...');
    const dbName = 'darb_network';
    
    try {
      await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      console.log(`✓ Successfully created database: ${dbName}`);
      console.log(`\nUpdate your .env file to use: DB_NAME=${dbName}\n`);
    } catch (error) {
      console.error(`✗ Cannot create database: ${error.message}`);
      console.log('\nYou need to:');
      console.log('1. Contact your TiDB admin to create a database for you');
      console.log('2. Or use an existing database where you have CREATE permissions');
      console.log('3. Or request elevated privileges for your current user\n');
    }

    // Show grants
    console.log('Checking user privileges...');
    try {
      const [grants] = await connection.execute('SHOW GRANTS');
      grants.forEach(grant => {
        console.log(`  ${Object.values(grant)[0]}`);
      });
    } catch (error) {
      console.log(`  Could not retrieve grants: ${error.message}`);
    }

  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkPermissions();
