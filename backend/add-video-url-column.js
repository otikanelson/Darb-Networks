const mysql = require('mysql2/promise');
require('dotenv').config();

async function addVideoUrlColumn() {
  const config = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectTimeout: 60000,
    ssl: { rejectUnauthorized: false }
  };

  let connection;
  try {
    console.log('📦 Connecting to database...');
    connection = await mysql.createConnection(config);
    console.log('✅ Connected\n');

    // Check current columns
    console.log('📋 Current columns in campaign_milestones:');
    const [currentColumns] = await connection.query('DESCRIBE campaign_milestones');
    currentColumns.forEach(col => console.log(`   - ${col.Field}`));
    
    // Check if video_url exists
    const hasVideoUrl = currentColumns.some(col => col.Field === 'video_url');
    
    if (hasVideoUrl) {
      console.log('\n✅ video_url column already exists!');
    } else {
      console.log('\n🔄 Adding video_url column...');
      await connection.query(
        'ALTER TABLE campaign_milestones ADD COLUMN video_url VARCHAR(500) NULL AFTER image_url'
      );
      console.log('✅ video_url column added successfully!');
    }

    // Verify
    console.log('\n📋 Updated columns:');
    const [updatedColumns] = await connection.query('DESCRIBE campaign_milestones');
    updatedColumns.forEach(col => console.log(`   - ${col.Field}`));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n👋 Connection closed');
    }
  }
}

addVideoUrlColumn();
