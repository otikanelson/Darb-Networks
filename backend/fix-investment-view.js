require('dotenv').config();
const mysql = require('mysql2/promise');

async function fixView() {
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

  const connection = await mysql.createConnection(config);
  
  try {
    console.log('Fixing investment_summary view...');
    
    // Drop existing view
    await connection.execute('DROP VIEW IF EXISTS investment_summary');
    
    // Create view with fixed column names
    const sql = `CREATE VIEW investment_summary AS
      SELECT 
        i.*,
        c.title as campaign_title,
        c.category as campaign_category,
        u.fullName as investor_name,
        u.email as investor_user_email,
        founder.fullName as founder_name,
        founder.email as founder_email
      FROM investments i
      LEFT JOIN campaigns c ON i.campaign_id = c.id
      LEFT JOIN users u ON i.investor_id = u.id
      LEFT JOIN users founder ON c.founder_id = founder.id`;
    
    await connection.execute(sql);
    console.log('✓ investment_summary view created successfully');
    
  } catch (error) {
    console.error('✗ Error:', error.message);
  } finally {
    await connection.end();
  }
}

fixView();
