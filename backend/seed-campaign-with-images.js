require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const db = require("./models");

async function seedCampaignWithImages() {
  try {
    console.log('🌱 ===== SEEDING CAMPAIGN WITH IMAGES =====\n');

    // Find the user
    const [user] = await db.sequelize.query(
      'SELECT id, email, fullName, userType FROM users WHERE email = ?',
      {
        replacements: ['somtootika@gmail.com'],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    if (!user) {
      console.error('❌ User not found with email: somtootika@gmail.com');
      console.log('💡 Make sure the user exists in the database');
      process.exit(1);
    }

    console.log('✅ Found user:', user.fullName, '(ID:', user.id, ')');

    if (user.userType !== 'founder') {
      console.error('❌ User is not a founder');
      process.exit(1);
    }

    // Create a campaign
    console.log('\n📝 Creating campaign...');
    const [result] = await db.sequelize.query(
      `INSERT INTO campaigns 
       (title, description, category, location, target_amount, minimum_investment, 
        problem_statement, solution, business_plan, market_analysis,
        main_image_url, video_url, founder_id, status, submitted_at, approved_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      {
        replacements: [
          'EcoTech Solar Solutions',
          'Revolutionary solar panel technology that increases efficiency by 40% while reducing costs. Join us in making clean energy accessible to everyone.',
          'Energy & Green Tech',
          'Lagos, Nigeria',
          5000000,
          50000,
          'Traditional solar panels are expensive and inefficient, making clean energy inaccessible to most Nigerian households and businesses.',
          'Our patented nano-coating technology increases solar panel efficiency by 40% while reducing manufacturing costs by 30%.',
          'We plan to manufacture locally, create jobs, and make solar energy affordable for the Nigerian market.',
          'The Nigerian solar market is projected to grow 25% annually. We target the residential and SME sectors.',
          'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&h=800&fit=crop&q=80',
          'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          user.id,
          'approved',
        ],
        type: db.sequelize.QueryTypes.INSERT
      }
    );

    const campaignId = result;
    console.log('✅ Campaign created with ID:', campaignId);

    // Add gallery images
    console.log('\n📸 Adding gallery images...');
    const galleryImages = [
      {
        url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop&q=80',
        caption: 'Solar panel installation'
      },
      {
        url: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&h=600&fit=crop&q=80',
        caption: 'Our manufacturing facility'
      },
      {
        url: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=800&h=600&fit=crop&q=80',
        caption: 'Team at work'
      },
      {
        url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=600&fit=crop&q=80',
        caption: 'Solar farm project'
      },
      {
        url: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&h=600&fit=crop&q=80',
        caption: 'Residential installation'
      }
    ];

    for (let i = 0; i < galleryImages.length; i++) {
      const img = galleryImages[i];
      await db.sequelize.query(
        `INSERT INTO campaign_images (campaign_id, image_url, image_type, caption, filename, order_index)
         VALUES (?, ?, 'gallery', ?, ?, ?)`,
        {
          replacements: [campaignId, img.url, img.caption, `gallery-${i}.jpg`, i],
          type: db.sequelize.QueryTypes.INSERT
        }
      );
      console.log(`  ✅ Added image ${i + 1}/${galleryImages.length}: ${img.caption}`);
    }

    console.log('\n✅ Campaign seeded successfully!');
    console.log('📊 Summary:');
    console.log('   - Campaign ID:', campaignId);
    console.log('   - Title: EcoTech Solar Solutions');
    console.log('   - Gallery Images:', galleryImages.length);
    console.log('   - Status: approved');
    console.log('\n🌐 View at: http://localhost:5173/campaign/' + campaignId);

    process.exit(0);

  } catch (error) {
    console.error('\n❌ ===== SEEDING FAILED =====');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the seed
seedCampaignWithImages();
