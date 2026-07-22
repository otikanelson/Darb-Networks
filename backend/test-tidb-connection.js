require('dotenv').config();
const mysql = require('mysql2/promise');

async function testTiDBConnection() {
  console.log('Testing TiDB connection...\n');
  
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

  console.log('Connection config:');
  console.log(`Host: ${config.host}`);
  console.log(`Port: ${config.port}`);
  console.log(`User: ${config.user}`);
  console.log(`Database: ${config.database}`);
  console.log(`SSL: enabled\n`);

  try {
    console.log('Attempting to connect...');
    const connection = await mysql.createConnection(config);
    
    console.log('✓ Connected successfully!\n');

    // Test query
    console.log('Running test query...');
    const [rows] = await connection.execute('SELECT VERSION() as version, DATABASE() as current_db');
    console.log('✓ Query successful!');
    console.log(`TiDB Version: ${rows[0].version}`);
    console.log(`Current Database: ${rows[0].current_db}\n`);

    // List tables
    console.log('Listing tables in database...');
    const [tables] = await connection.execute('SHOW TABLES');
    if (tables.length > 0) {
      console.log(`Found ${tables.length} tables:`);
      tables.forEach(table => console.log(`  - ${Object.values(table)[0]}`));
    } else {
      console.log('No tables found in database.');
    }

    await connection.end();
    console.log('\n✓ Connection test completed successfully!');
    
  } catch (error) {
    console.error('✗ Connection failed!');
    console.error('Error:', error.message);
    if (error.code) {
      console.error('Error Code:', error.code);
    }
    if (error.errno) {
      console.error('Error Number:', error.errno);
    }
    process.exit(1);
  }
}

testTiDBConnection();
