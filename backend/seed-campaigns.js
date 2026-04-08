const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function seedCampaigns() {
  let connection;
  
  try {
    console.log('🌱 Starting campaign seed process...');
    
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true,
      ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
      } : false
    });

    console.log('✅ Connected to database');

    // Read the enhanced SQL file
    const sqlFilePath = path.join(__dirname, 'database', 'seed-campaigns-enhanced.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('📄 SQL file loaded');

    // Execute the entire SQL file as one batch (supports MySQL variables)
    try {
      await connection.query(sqlContent);
      console.log('✅ All SQL statements executed successfully');
    } catch (error) {
      console.error('❌ Error executing SQL:', error.message);
      throw error;
    }

    // Fetch and display the seeded campaigns
    console.log('\n📊 Campaign Seed Summary:');
    console.log('═══════════════════════════════════════════════════════════════');
    
    const [campaigns] = await connection.query(`
      SELECT 
        id,
        title,
        category,
        target_amount,
        current_amount,
        ROUND((current_amount / target_amount) * 100, 2) as progress_percentage,
        investor_count,
        status,
        is_featured
      FROM campaigns
      ORDER BY id DESC
      LIMIT 3
    `);

    campaigns.forEach(campaign => {
      console.log(`\n📌 ${campaign.title}`);
      console.log(`   Category: ${campaign.category}`);
      console.log(`   Target: ₦${campaign.target_amount.toLocaleString()}`);
      console.log(`   Raised: ₦${campaign.current_amount.toLocaleString()} (${campaign.progress_percentage}%)`);
      console.log(`   Investors: ${campaign.investor_count}`);
      console.log(`   Status: ${campaign.status}`);
      console.log(`   Featured: ${campaign.is_featured ? 'Yes' : 'No'}`);
    });

    // Get counts
    const [imageCount] = await connection.query('SELECT COUNT(*) as count FROM campaign_images');
    const [milestoneCount] = await connection.query('SELECT COUNT(*) as count FROM campaign_milestones');
    const [teamCount] = await connection.query('SELECT COUNT(*) as count FROM campaign_collaborators');
    const [investmentCount] = await connection.query('SELECT COUNT(*) as count FROM investments');

    console.log('\n📈 Additional Data:');
    console.log(`   Campaign Images: ${imageCount[0].count}`);
    console.log(`   Milestones: ${milestoneCount[0].count}`);
    console.log(`   Team Members: ${teamCount[0].count}`);
    console.log(`   Investments: ${investmentCount[0].count}`);

    console.log('\n✅ Campaign seeding completed successfully!');
    console.log('═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error seeding campaigns:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the seed function
seedCampaigns();
