require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupTiDB() {
  console.log('=== TiDB Database Setup ===\n');
  
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
    connectTimeout: 60000,
    multipleStatements: true
  };

  let connection;

  try {
    console.log('Connecting to TiDB...');
    connection = await mysql.createConnection(config);
    console.log('✓ Connected successfully!\n');

    // Read the schema file
    console.log('Reading schema file...');
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    let schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Replace database name references with the current database
    schema = schema.replace(/darb_network_db/g, process.env.DB_NAME || 'darb_network');
    schema = schema.replace(new RegExp(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'darb_network'}[\\s\\S]*?;`, 'i'), '');
    schema = schema.replace(new RegExp(`USE ${process.env.DB_NAME || 'darb_network'};`, 'i'), '');
    
    console.log('✓ Schema file loaded\n');

    // Split schema into individual statements
    console.log('Executing schema...');
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^\/\*/));

    let successCount = 0;
    let skipCount = 0;
    
    for (const statement of statements) {
      try {
        // Skip comments and empty statements
        if (statement.startsWith('--') || statement.length < 5) {
          continue;
        }

        // Skip view creation for now (will handle separately)
        if (statement.toUpperCase().includes('CREATE OR REPLACE VIEW') || 
            statement.toUpperCase().includes('CREATE VIEW')) {
          skipCount++;
          continue;
        }

        await connection.execute(statement);
        successCount++;
        
        // Log progress for major operations
        if (statement.toUpperCase().includes('CREATE TABLE')) {
          const match = statement.match(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(\w+)/i);
          if (match) {
            console.log(`  ✓ Created table: ${match[1]}`);
          }
        }
      } catch (error) {
        // Ignore errors for DROP TABLE IF EXISTS
        if (statement.toUpperCase().includes('DROP TABLE IF EXISTS')) {
          continue;
        }
        console.error(`  ✗ Error executing statement: ${error.message}`);
        console.error(`  Statement preview: ${statement.substring(0, 100)}...`);
      }
    }

    console.log(`\n✓ Schema executed: ${successCount} statements successful, ${skipCount} views skipped\n`);

    // Apply migration
    console.log('Applying migrations...');
    const migrationPath = path.join(__dirname, 'database', 'migrations', 'add-documents-and-update-category.sql');
    
    try {
      const migration = fs.readFileSync(migrationPath, 'utf8');
      const migrationStatements = migration
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of migrationStatements) {
        if (statement.length < 5) continue;
        try {
          await connection.execute(statement);
        } catch (error) {
          // Column might already exist
          if (!error.message.includes('Duplicate column')) {
            console.log(`  Note: ${error.message}`);
          }
        }
      }
      console.log('✓ Migrations applied\n');
    } catch (error) {
      console.log('  Note: Migration file not critical, continuing...\n');
    }

    // Verify tables
    console.log('Verifying database structure...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`✓ Found ${tables.length} tables:\n`);
    
    const tableList = tables.map(t => Object.values(t)[0]);
    const expectedTables = [
      'users', 'campaigns', 'campaign_milestones', 'campaign_images',
      'campaign_views', 'campaign_favorites', 'investments', 'repayments',
      'notifications', 'payment_webhooks', 'password_resets',
      'email_verifications', 'audit_logs', 'system_settings'
    ];
    
    expectedTables.forEach(table => {
      if (tableList.includes(table)) {
        console.log(`  ✓ ${table}`);
      } else {
        console.log(`  ✗ ${table} (missing)`);
      }
    });

    // Check if we need to create views manually
    console.log('\nCreating database views...');
    
    // Create views one by one
    const views = [
      {
        name: 'campaign_details',
        sql: `CREATE OR REPLACE VIEW campaign_details AS
          SELECT 
            c.*,
            u.fullName as founder_name,
            u.email as founder_email,
            u.companyName as founder_company,
            u.profileImageUrl as founder_avatar,
            u.bio as founder_bio,
            u.website as founder_website,
            u.isVerified as founder_verified,
            admin.fullName as reviewed_by_name,
            admin.email as reviewed_by_email,
            CASE 
              WHEN c.target_amount > 0 THEN ROUND((c.current_amount / c.target_amount) * 100, 2)
              ELSE 0 
            END as progress_percentage,
            CASE 
              WHEN c.end_date IS NOT NULL AND c.end_date > NOW() THEN DATEDIFF(c.end_date, NOW())
              ELSE 0 
            END as days_remaining,
            CASE 
              WHEN c.start_date IS NOT NULL AND c.end_date IS NOT NULL THEN DATEDIFF(c.end_date, c.start_date)
              ELSE c.duration_days 
            END as total_duration_days
          FROM campaigns c
          LEFT JOIN users u ON c.founder_id = u.id
          LEFT JOIN users admin ON c.reviewed_by = admin.id`
      },
      {
        name: 'investment_summary',
        sql: `CREATE OR REPLACE VIEW investment_summary AS
          SELECT 
            i.*,
            c.title as campaign_title,
            c.category as campaign_category,
            u.fullName as investor_name,
            u.email as investor_email,
            founder.fullName as founder_name,
            founder.email as founder_email
          FROM investments i
          LEFT JOIN campaigns c ON i.campaign_id = c.id
          LEFT JOIN users u ON i.investor_id = u.id
          LEFT JOIN users founder ON c.founder_id = founder.id`
      },
      {
        name: 'user_statistics',
        sql: `CREATE OR REPLACE VIEW user_statistics AS
          SELECT 
            u.id,
            u.fullName,
            u.email,
            u.userType,
            u.createdAt,
            CASE WHEN u.userType = 'founder' THEN
              (SELECT COUNT(*) FROM campaigns WHERE founder_id = u.id)
              ELSE 0
            END as total_campaigns,
            CASE WHEN u.userType = 'founder' THEN
              (SELECT COUNT(*) FROM campaigns WHERE founder_id = u.id AND status = 'approved')
              ELSE 0
            END as approved_campaigns,
            CASE WHEN u.userType = 'founder' THEN
              (SELECT COALESCE(SUM(current_amount), 0) FROM campaigns WHERE founder_id = u.id)
              ELSE 0
            END as total_raised,
            CASE WHEN u.userType = 'investor' THEN
              (SELECT COUNT(*) FROM investments WHERE investor_id = u.id AND payment_status = 'completed')
              ELSE 0
            END as total_investments,
            CASE WHEN u.userType = 'investor' THEN
              (SELECT COALESCE(SUM(amount), 0) FROM investments WHERE investor_id = u.id AND payment_status = 'completed')
              ELSE 0
            END as total_invested,
            (SELECT COUNT(*) FROM campaign_favorites WHERE user_id = u.id) as favorite_campaigns,
            (SELECT COUNT(*) FROM campaign_views WHERE user_id = u.id) as campaign_views
          FROM users u`
      }
    ];

    for (const view of views) {
      try {
        // Drop view if exists
        await connection.execute(`DROP VIEW IF EXISTS ${view.name}`);
        // Create view
        await connection.execute(view.sql);
        console.log(`  ✓ Created view: ${view.name}`);
      } catch (error) {
        console.log(`  ✗ Failed to create view ${view.name}: ${error.message}`);
      }
    }

    console.log('\n=== Setup Complete! ===');
    console.log('\nYour TiDB database is ready to use.');
    console.log('You can now start your application with: npm start\n');

  } catch (error) {
    console.error('\n✗ Setup failed!');
    console.error('Error:', error.message);
    if (error.code) {
      console.error('Error Code:', error.code);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupTiDB();
