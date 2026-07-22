require('dotenv').config();
const mysql = require('mysql2/promise');

async function quickTest() {
  console.log('=== Quick Database Test ===\n');
  
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
    // Check users
    const [users] = await connection.execute('SELECT id, email, fullName, userType FROM users');
    console.log(`Users (${users.length}):`);
    users.forEach(u => console.log(`  - ${u.fullName} (${u.email}) - ${u.userType}`));
    console.log('');

    // Check campaigns
    const [campaigns] = await connection.execute(
      'SELECT id, title, category, status, target_amount, is_featured FROM campaigns'
    );
    console.log(`Campaigns (${campaigns.length}):`);
    campaigns.forEach(c => {
      const featured = c.is_featured ? '⭐' : '';
      console.log(`  ${featured} ${c.title}`);
      console.log(`    Category: ${c.category}, Status: ${c.status}`);
      console.log(`    Target: ₦${c.target_amount.toLocaleString()}\n`);
    });

    // Test campaign_details view
    const [campaignDetails] = await connection.execute(
      'SELECT title, founder_name, progress_percentage, days_remaining FROM campaign_details LIMIT 3'
    );
    console.log('Campaign Details View (working):');
    campaignDetails.forEach(c => {
      console.log(`  - ${c.title} by ${c.founder_name}`);
      console.log(`    Progress: ${c.progress_percentage}%, Days left: ${c.days_remaining}`);
    });
    console.log('');

    console.log('✅ Everything is working! Your frontend should now display campaigns.\n');

  } catch (error) {
    console.error('✗ Error:', error.message);
  } finally {
    await connection.end();
  }
}

quickTest();
