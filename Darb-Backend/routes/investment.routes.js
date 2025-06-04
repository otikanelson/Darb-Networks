// routes/investment.routes.js
// Fixed version that matches the available controller functions

const { authJwt, adminAuth } = require("../middlewares");
const controller = require("../controllers/investment.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept, Authorization"
    );
    next();
  });

  // ================= CORE INVESTMENT ROUTES =================
  
  /**
   * POST /api/investments/create
   * Create investment with Paystack payment initialization
   */
  app.post(
    "/api/investments/create",
    [authJwt.verifyToken],
    controller.initiateInvestmentWithPayment
  );

  /**
   * GET /api/investments/verify/:paymentReference
   * Verify payment with Paystack
   */
  app.get(
    "/api/investments/verify/:paymentReference",
    [authJwt.verifyToken],
    controller.verifyPayment
  );

  /**
   * GET /api/investments/status/:paymentReference
   * Get payment status
   */
  app.get(
    "/api/investments/status/:paymentReference",
    [authJwt.verifyToken],
    controller.getPaymentStatus
  );

  // ================= WEBHOOK ROUTES =================

  /**
   * POST /api/webhooks/paystack
   * Paystack webhook handler
   */
  app.post(
    "/api/webhooks/paystack",
    controller.handlePaystackWebhook
  );

  /**
   * POST /api/webhooks/flutterwave
   * Flutterwave webhook (future)
   */
  app.post(
    "/api/webhooks/flutterwave",
    (req, res) => {
      console.log('📡 Flutterwave webhook received');
      res.status(200).send({ status: 'received', message: 'Coming soon' });
    }
  );

  // ================= INVESTMENT HISTORY =================

  /**
   * GET /api/investments/my-investments
   * Get user's investment history
   */
  app.get(
    "/api/investments/my-investments",
    [authJwt.verifyToken],
    controller.getMyInvestments
  );

  /**
   * GET /api/investments/campaign/:campaignId/investors
   * Get campaign investors (founder view)
   */
  app.get(
    "/api/investments/campaign/:campaignId/investors",
    [authJwt.verifyToken],
    controller.getCampaignInvestors
  );

  /**
   * GET /api/investments/campaign/:campaignId/analytics
   * Get investment analytics
   */
  app.get(
    "/api/investments/campaign/:campaignId/analytics",
    [authJwt.verifyToken],
    controller.getCampaignInvestmentAnalytics
  );

  // ================= REPAYMENT ROUTES =================

  /**
   * POST /api/investments/campaign/:campaignId/repayments
   * Create repayment batch
   */
  app.post(
    "/api/investments/campaign/:campaignId/repayments",
    [authJwt.verifyToken],
    controller.createRepaymentBatch
  );

  /**
   * GET /api/investments/campaign/:campaignId/repayments
   * Get repayment history
   */
  app.get(
    "/api/investments/campaign/:campaignId/repayments",
    [authJwt.verifyToken],
    controller.getRepaymentHistory
  );

  // ================= NOTIFICATIONS =================

  /**
   * GET /api/investments/notifications
   * Get investment notifications
   */
  app.get(
    "/api/investments/notifications",
    [authJwt.verifyToken],
    controller.getInvestmentNotifications
  );

  /**
   * PUT /api/investments/notifications/:id/read
   * Mark notification as read
   */
  app.put(
    "/api/investments/notifications/:id/read",
    [authJwt.verifyToken],
    async (req, res) => {
      try {
        const { id } = req.params;
        const userId = req.userId;

        await require("../models").sequelize.query(
          `UPDATE investment_notifications 
           SET is_read = TRUE, read_at = NOW() 
           WHERE id = ? AND user_id = ?`,
          {
            replacements: [id, userId],
            type: require("../models").sequelize.QueryTypes.UPDATE
          }
        );

        res.status(200).send({
          success: true,
          message: 'Notification marked as read'
        });

      } catch (error) {
        console.error('❌ Error marking notification as read:', error);
        res.status(500).send({
          success: false,
          message: 'Error updating notification'
        });
      }
    }
  );

  // ================= ADMIN ROUTES =================

  /**
   * GET /api/admin/investments/stats
   * Platform investment statistics
   */
  app.get(
    "/api/admin/investments/stats",
    [authJwt.verifyToken, adminAuth.verifyAdmin],
    async (req, res) => {
      try {
        const [stats] = await require("../models").sequelize.query(
          `SELECT 
            COUNT(*) as total_investments,
            SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END) as total_invested,
            COUNT(DISTINCT investor_id) as unique_investors,
            COUNT(DISTINCT campaign_id) as campaigns_with_investments,
            AVG(CASE WHEN payment_status = 'completed' THEN amount ELSE NULL END) as average_investment,
            COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_payments,
            COUNT(CASE WHEN payment_status = 'failed' THEN 1 END) as failed_payments
           FROM investments`,
          { type: require("../models").sequelize.QueryTypes.SELECT }
        );

        res.status(200).send({
          success: true,
          data: stats
        });
      } catch (error) {
        console.error('❌ Error getting admin investment stats:', error);
        res.status(500).send({
          success: false,
          message: 'Error fetching investment statistics'
        });
      }
    }
  );

  /**
   * GET /api/admin/investments/recent
   * Recent investments
   */
  app.get(
    "/api/admin/investments/recent",
    [authJwt.verifyToken, adminAuth.verifyAdmin],
    async (req, res) => {
      try {
        const { limit = 20 } = req.query;

        const recentInvestments = await require("../models").sequelize.query(
          `SELECT 
            i.id,
            i.amount,
            i.payment_status,
            i.payment_method,
            i.payment_reference,
            i.confirmed_at,
            i.investment_date,
            c.title as campaign_title,
            inv.fullName as investor_name,
            founder.fullName as founder_name
           FROM investments i
           JOIN campaigns c ON i.campaign_id = c.id
           JOIN users inv ON i.investor_id = inv.id
           JOIN users founder ON c.founder_id = founder.id
           ORDER BY i.investment_date DESC
           LIMIT ?`,
          {
            replacements: [parseInt(limit)],
            type: require("../models").sequelize.QueryTypes.SELECT
          }
        );

        res.status(200).send({
          success: true,
          data: recentInvestments
        });
      } catch (error) {
        console.error('❌ Error getting recent investments:', error);
        res.status(500).send({
          success: false,
          message: 'Error fetching recent investments'
        });
      }
    }
  );

  /**
   * POST /api/admin/investments/sync-totals
   * Sync investment totals
   */
  app.post(
    "/api/admin/investments/sync-totals",
    [authJwt.verifyToken, adminAuth.verifyAdmin],
    async (req, res) => {
      try {
        // Try to call stored procedure, fallback to manual update
        try {
          await require("../models").sequelize.query(
            'CALL SyncAllTotals()',
            { type: require("../models").sequelize.QueryTypes.RAW }
          );
        } catch (procError) {
          console.log('Stored procedure not available, using manual sync');
          await require("../models").sequelize.query(
            `UPDATE campaigns 
             SET 
               total_investments = (
                 SELECT COALESCE(SUM(amount), 0) 
                 FROM investments 
                 WHERE campaign_id = campaigns.id AND payment_status = 'completed'
               ),
               current_amount = (
                 SELECT COALESCE(SUM(amount), 0) 
                 FROM investments 
                 WHERE campaign_id = campaigns.id AND payment_status = 'completed'
               ),
               investor_count = (
                 SELECT COUNT(DISTINCT investor_id) 
                 FROM investments 
                 WHERE campaign_id = campaigns.id AND payment_status = 'completed'
               )`,
            { type: require("../models").sequelize.QueryTypes.UPDATE }
          );
        }

        res.status(200).send({
          success: true,
          message: 'Investment totals synchronized successfully'
        });
      } catch (error) {
        console.error('❌ Error syncing totals:', error);
        res.status(500).send({
          success: false,
          message: 'Error synchronizing totals'
        });
      }
    }
  );

  // ================= TESTING ROUTES (Development Only) =================

  if (process.env.NODE_ENV === 'development') {
    /**
     * POST /api/investments/test/simulate-payment
     * Simulate successful payment for testing
     */
    app.post(
      "/api/investments/test/simulate-payment",
      [authJwt.verifyToken],
      async (req, res) => {
        try {
          const { paymentReference } = req.body;
          
          if (!paymentReference) {
            return res.status(400).send({
              success: false,
              message: 'Payment reference is required'
            });
          }

          // Simulate successful payment
          await require("../models").sequelize.query(
            `UPDATE investments 
             SET payment_status = 'completed', 
                 confirmed_at = NOW(),
                 payment_gateway_id = 'TEST_PAYMENT_ID',
                 payment_method = 'paystack'
             WHERE payment_reference = ?`,
            {
              replacements: [paymentReference],
              type: require("../models").sequelize.QueryTypes.UPDATE
            }
          );

          // Get investment details for campaign update
          const [investment] = await require("../models").sequelize.query(
            'SELECT campaign_id FROM investments WHERE payment_reference = ?',
            {
              replacements: [paymentReference],
              type: require("../models").sequelize.QueryTypes.SELECT
            }
          );

          if (investment) {
            // Try to update campaign totals
            try {
              await require("../models").sequelize.query(
                'CALL UpdateCampaignInvestmentTotals(?)',
                {
                  replacements: [investment.campaign_id],
                  type: require("../models").sequelize.QueryTypes.RAW
                }
              );
            } catch (procError) {
              console.log('Stored procedure not available for campaign update');
            }
          }

          res.status(200).send({
            success: true,
            message: 'Payment simulated successfully',
            data: { paymentReference }
          });

        } catch (error) {
          console.error('❌ Error simulating payment:', error);
          res.status(500).send({
            success: false,
            message: 'Error simulating payment'
          });
        }
      }
    );
  }

  // ================= API DOCUMENTATION =================

  /**
   * GET /api/investments/docs
   * API documentation
   */
  app.get("/api/investments/docs", (req, res) => {
    const docs = {
      title: "Investment API with Paystack Integration",
      version: "2.0.0",
      description: "Investment system with payment processing",
      
      endpoints: {
        core: {
          "POST /api/investments/create": "Create investment + Paystack payment",
          "GET /api/investments/verify/:reference": "Verify payment status",
          "GET /api/investments/status/:reference": "Get payment status",
          "GET /api/investments/my-investments": "User investment history"
        },
        
        campaign_management: {
          "GET /api/investments/campaign/:id/investors": "Campaign investors",
          "GET /api/investments/campaign/:id/analytics": "Investment analytics",
          "POST /api/investments/campaign/:id/repayments": "Create repayments",
          "GET /api/investments/campaign/:id/repayments": "Repayment history"
        },

        webhooks: {
          "POST /api/webhooks/paystack": "Paystack webhook handler"
        },

        admin: {
          "GET /api/admin/investments/stats": "Platform statistics",
          "GET /api/admin/investments/recent": "Recent investments",
          "POST /api/admin/investments/sync-totals": "Sync totals"
        }
      },

      test_endpoints: {
        "POST /api/investments/test/simulate-payment": "Simulate payment (dev only)"
      }
    };

    res.status(200).send({
      success: true,
      data: docs
    });
  });
};