const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true
};

async function updateSchema() {
  let connection;
  
  try {
    console.log('📡 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Read the schema update file
    const schemaPath = path.join(__dirname, 'database', 'schema-updated.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📝 Executing schema updates...');
    await connection.query(schema);
    
    console.log('✅ Schema updated successfully!');
    console.log('');
    console.log('New tables and columns added:');
    console.log('  - campaign_collaborators table');
    console.log('  - campaign_milestones.image_url column');
    console.log('  - Updated TEXT fields to LONGTEXT for rich text');
    
  } catch (error) {
    console.error('❌ Error updating schema:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

updateSchema();
