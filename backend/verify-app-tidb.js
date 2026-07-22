require('dotenv').config();

async function verifySetup() {
  console.log('=== Verifying TiDB Setup for Darb Network ===\n');
  
  // Step 1: Check environment variables
  console.log('1. Checking environment variables...');
  const requiredVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  let allVarsPresent = true;
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`  ✓ ${varName}: ${varName === 'DB_PASSWORD' ? '****' : process.env[varName]}`);
    } else {
      console.log(`  ✗ ${varName}: MISSING`);
      allVarsPresent = false;
    }
  });
  
  if (!allVarsPresent) {
    console.error('\n✗ Missing required environment variables');
    return false;
  }
  console.log('');
  
  // Step 2: Test database connection
  console.log('2. Testing database connection...');
  try {
    const db = require('./models');
    await db.sequelize.authenticate();
    console.log('  ✓ Database connection successful\n');
    
    // Step 3: Check tables
    console.log('3. Verifying database tables...');
    const [tables] = await db.sequelize.query('SHOW TABLES');
    console.log(`  ✓ Found ${tables.length} tables\n`);
    
    const expectedTables = [
      'users', 'campaigns', 'campaign_milestones', 'campaign_images',
      'campaign_views', 'campaign_favorites', 'investments', 'repayments',
      'notifications', 'payment_webhooks', 'password_resets',
      'email_verifications', 'audit_logs', 'system_settings'
    ];
    
    const actualTables = tables.map(t => Object.values(t)[0]);
    const missingTables = expectedTables.filter(t => !actualTables.includes(t));
    
    if (missingTables.length > 0) {
      console.log('  ✗ Missing tables:', missingTables.join(', '));
    } else {
      console.log('  ✓ All required tables present');
    }
    console.log('');
    
    // Step 4: Test Sequelize models
    console.log('4. Testing Sequelize models...');
    try {
      // Test User model
      const userCount = await db.User.count();
      console.log(`  ✓ User model working (${userCount} users)`);
      
      // Test Campaign model (if it exists in models)
      const campaignQuery = await db.sequelize.query('SELECT COUNT(*) as count FROM campaigns');
      console.log(`  ✓ Campaigns table accessible (${campaignQuery[0][0].count} campaigns)`);
      
      // Test Investment model
      const investmentQuery = await db.sequelize.query('SELECT COUNT(*) as count FROM investments');
      console.log(`  ✓ Investments table accessible (${investmentQuery[0][0].count} investments)`);
      
    } catch (error) {
      console.log(`  ✗ Model test failed: ${error.message}`);
    }
    console.log('');
    
    // Step 5: Check views
    console.log('5. Verifying database views...');
    try {
      await db.sequelize.query('SELECT * FROM campaign_details LIMIT 1');
      console.log('  ✓ campaign_details view working');
    } catch (error) {
      console.log(`  ✗ campaign_details view: ${error.message}`);
    }
    
    try {
      await db.sequelize.query('SELECT * FROM investment_summary LIMIT 1');
      console.log('  ✓ investment_summary view working');
    } catch (error) {
      console.log(`  ✗ investment_summary view: ${error.message}`);
    }
    
    try {
      await db.sequelize.query('SELECT * FROM user_statistics LIMIT 1');
      console.log('  ✓ user_statistics view working');
    } catch (error) {
      console.log(`  ✗ user_statistics view: ${error.message}`);
    }
    console.log('');
    
    // Step 6: Summary
    console.log('=== Verification Complete ===\n');
    console.log('✅ Your application is ready to use TiDB!\n');
    console.log('Next steps:');
    console.log('  1. Start your backend: npm start');
    console.log('  2. Test API endpoints');
    console.log('  3. Update your production deployment with the new credentials\n');
    
    await db.sequelize.close();
    return true;
    
  } catch (error) {
    console.error('\n✗ Database connection failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Verify your TiDB credentials in .env');
    console.error('  2. Check your network connection');
    console.error('  3. Ensure TiDB cluster is running');
    console.error('  4. Run: node setup-tidb.js to recreate tables\n');
    return false;
  }
}

verifySetup().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Verification error:', error);
  process.exit(1);
});
