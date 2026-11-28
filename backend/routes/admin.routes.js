const { firebaseAuth } = require("../middlewares");
const controller = require("../controllers/admin.controller");

module.exports = function (app) {
  /**
   * Admin - Reset database (development/testing only)
   * DELETE /api/admin/reset-database
   * Headers: Authorization: Bearer <ADMIN_TOKEN>
   * 
   * WARNING: This endpoint clears the entire database and recreates it with:
   * - 1 admin user
   * - 2 sample campaigns
   */
  app.delete(
    "/api/admin/reset-database",
    async (req, res) => {
      try {
        // Safety check - only allow in development or with special header
        if (process.env.NODE_ENV === 'production' && !req.headers['x-reset-token']) {
          return res.status(403).send({
            success: false,
            message: "Database reset not allowed in production without authorization"
          });
        }

        // Check for special reset token
        const resetToken = req.headers['x-reset-token'];
        if (process.env.NODE_ENV === 'production' && resetToken !== process.env.ADMIN_RESET_TOKEN) {
          return res.status(401).send({
            success: false,
            message: "Invalid reset token"
          });
        }

        console.log('🔄 Starting database reset...');
        const db = require("../models");

        // 1. Force sync (drop and recreate tables)
        console.log('⏳ Dropping all tables...');
        await db.sequelize.sync({ force: true });
        console.log('✅ Tables recreated');

        // 2. Create admin user
        console.log('⏳ Creating admin user...');
        const adminUser = await db.user.create({
          firebase_uid: 'admin-uid-12345',
          email: 'admin@darb.com',
          fullName: 'Admin User',
          userType: 'admin',
          companyName: 'Darb Networks',
          phoneNumber: '+2348012345678',
          address: 'Lagos, Nigeria',
          isActive: true,
          isVerified: true,
          isEmailVerified: true
        });
        console.log('✅ Admin user created');

        // 3. Create 2 sample campaigns
        console.log('⏳ Creating sample campaigns...');

        const campaign1 = await db.campaign.create({
          title: 'EcoCharge - Solar Energy Solution',
          description: 'Revolutionary solar charging stations for Nigeria. We are building a network of eco-friendly charging infrastructure across major cities.',
          fullDescription: 'EcoCharge is developing innovative solar-powered electric vehicle charging stations. Our mission is to provide sustainable energy solutions while creating employment opportunities in rural and urban areas. We are seeking ₦50 million to expand our network to 20 cities.',
          category: 'Energy',
          fundingGoal: 50000000,
          amountRaised: 15000000,
          minimumInvestment: 500000,
          riskLevel: 'medium',
          investorCount: 8,
          status: 'active',
          isFeatured: true,
          country: 'Nigeria',
          documents: JSON.stringify([
            { name: 'Business Plan', url: '/documents/ecocharge-plan.pdf', type: 'pdf' },
            { name: 'Financial Projections', url: '/documents/ecocharge-financials.xlsx', type: 'xlsx' }
          ]),
          thumbnailUrl: 'https://via.placeholder.com/400x250?text=EcoCharge',
          createdAt: new Date(),
          updatedAt: new Date()
        });

        const campaign2 = await db.campaign.create({
          title: 'FarmTech - Smart Agricultural Platform',
          description: 'Digital platform connecting farmers directly to buyers using AI and IoT sensors. Eliminate middlemen and increase farmer profits by 40%.',
          fullDescription: 'FarmTech is revolutionizing Nigerian agriculture through technology. Our platform uses IoT sensors to monitor crop health and AI to predict market prices. Farmers get real-time data and direct market access. We are raising ₦30 million to expand to 500 farms across Nigeria.',
          category: 'Agriculture',
          fundingGoal: 30000000,
          amountRaised: 8500000,
          minimumInvestment: 250000,
          riskLevel: 'low',
          investorCount: 12,
          status: 'active',
          isFeatured: true,
          country: 'Nigeria',
          documents: JSON.stringify([
            { name: 'Pitch Deck', url: '/documents/farmtech-pitch.pdf', type: 'pdf' },
            { name: 'Technology Overview', url: '/documents/farmtech-tech.pdf', type: 'pdf' }
          ]),
          thumbnailUrl: 'https://via.placeholder.com/400x250?text=FarmTech',
          createdAt: new Date(),
          updatedAt: new Date()
        });

        console.log('✅ Campaigns created');

        res.status(200).send({
          success: true,
          message: 'Database reset complete',
          data: {
            adminUser: {
              email: adminUser.email,
              fullName: adminUser.fullName,
              userType: adminUser.userType
            },
            campaigns: [
              { id: campaign1.id, title: campaign1.title, fundingGoal: campaign1.fundingGoal },
              { id: campaign2.id, title: campaign2.title, fundingGoal: campaign2.fundingGoal }
            ]
          }
        });

      } catch (error) {
        console.error('❌ Error during reset:', error.message);
        res.status(500).send({
          success: false,
          message: "Database reset failed",
          error: error.message
        });
      }
    }
  );
};
