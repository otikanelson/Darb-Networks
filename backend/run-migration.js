const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'darb_network_db',
  multipleStatements: true,
  connectTimeout: 60000, // 60 seconds
  ssl: process.env.DB_HOST && process.env.DB_HOST.includes('aivencloud.com') 
    ? { rejectUnauthorized: false } 
    : undefined
};

async function runMigration() {
  let connection;
  try {
    console.log('📦 Connecting to database...');
    console.log('Host:', dbConfig.host);
    console.log('Port:', dbConfig.port);
    console.log('Database:', dbConfig.database);
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Read migration file
    const migrationPath = path.join(__dirname, 'database', 'migrations', 'add-milestones-collaborators.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

    console.log(`🔄 Running ${statements.length} migration statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.toLowerCase().includes('use ')) {
        console.log(`⏭️  Skipping USE statement (already connected to ${dbConfig.database})`);
        continue;
      }
      
      try {
        console.log(`  ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
        await connection.query(statement);
        console.log(`  ✅ Success`);
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log(`  ⚠️  Already exists, skipping`);
        } else {
          console.error(`  ❌ Error:`, err.message);
        }
      }
    }

    console.log('✅ Migration completed successfully!');

    // Verify tables
    const [tables] = await connection.query("SHOW TABLES LIKE '%milestone%'");
    console.log('📋 Milestone tables:', tables);

    const [collabTables] = await connection.query("SHOW TABLES LIKE '%collaborator%'");
    console.log('📋 Collaborator tables:', collabTables);

    // Check if columns were added
    const [milestoneColumns] = await connection.query("DESCRIBE campaign_milestones");
    console.log('📋 Milestone columns:', milestoneColumns.map(c => c.Field).join(', '));

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.code === 'ETIMEDOUT') {
      console.error('\n💡 Connection timeout. Please check:');
      console.error('   1. Your internet connection');
      console.error('   2. Database host is accessible');
      console.error('   3. Firewall settings');
      console.error('   4. Database credentials in .env file');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('👋 Database connection closed');
    }
  }
}

runMigration();
