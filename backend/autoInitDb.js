const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

/**
 * Automatically initialize database schema on first run
 * This runs the schema.sql file if tables don't exist
 */
async function autoInitializeDatabase() {
  // Skip in development if you want to control initialization manually
  // Uncomment the next line to disable auto-init in development
  // if (process.env.NODE_ENV === 'development') return { success: true, message: 'Skipped in development' };
  
  let connection;
  
  try {
    console.log('🔍 Checking if database needs initialization...');
    
    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Check if tables exist
    const [tables] = await connection.execute(
      `SELECT COUNT(*) as table_count 
       FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = ?`,
      [process.env.DB_NAME]
    );

    const tableCount = tables[0].table_count;

    if (tableCount > 0) {
      console.log(`✅ Database already initialized (${tableCount} tables found)`);
      return { success: true, message: `Database has ${tableCount} tables`, initialized: false };
    }

    // Tables don't exist, initialize schema
    console.log('📦 Initializing database schema...');
    
    const schemaPath = path.join(__dirname, 'schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      console.warn('⚠️  schema.sql not found - skipping auto-initialization');
      return { success: true, message: 'Schema file not found', initialized: false };
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Close connection and reconnect with multipleStatements enabled
    await connection.end();
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true,
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Execute schema
    await connection.query(schema);
    
    console.log('✅ Database schema initialized successfully!');
    
    // Verify tables were created
    const [newTables] = await connection.execute(
      `SELECT COUNT(*) as table_count 
       FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = ?`,
      [process.env.DB_NAME]
    );

    console.log(`✅ Created ${newTables[0].table_count} tables`);
    
    return { 
      success: true, 
      message: `Database initialized with ${newTables[0].table_count} tables`,
      initialized: true,
      tableCount: newTables[0].table_count
    };

  } catch (error) {
    console.error('❌ Auto-initialization failed:', error.message);
    // Don't throw error - let server start anyway
    return { 
      success: false, 
      message: error.message,
      error: error.code 
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

module.exports = autoInitializeDatabase;