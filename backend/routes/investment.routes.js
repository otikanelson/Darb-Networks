const { authJwt, adminAuth } = require("../middlewares");
const controller = require("../controllers/investment.controller");

module.exports = function(app) {
  // CORS headers
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept, Authorization"
    );
    next();
  });

  // ================= CORE INVESTMENT ROUTES =================
  
  // Create investment with Paystack payment initialization
  app.post(
    "/api/investments/create",
    [authJwt.verifyToken],
    controller.initiateInvestmentWithPayment || ((req, res) => {
      res.status(501).send({ 
        success: false,
        message: "Investment creation not implemented yet" 
      });
    })
  );

  // Initialize payment (alternative endpoint)
  app.post(
    "/api/investments/initialize-payment",
    [authJwt.verifyToken],
    controller.initializePayment || controller.initiateInvestmentWithPayment || ((req, res) => {
      res.status(501).send({ message: "Payment initialization not implemented" });
    })
  );

  // Verify payment with Paystack
  app.get(
    "/api/investments/verify/:paymentReference",
    [authJwt.verifyToken],
    controller.verifyPayment || ((req, res) => {
      res.status(501).send({ message: "Payment verification not implemented" });
    })
  );

  // Get payment status
  app.get(
    "/api/investments/status/:paymentReference",
    [authJwt.verifyToken],
    controller.getPaymentStatus || ((req, res) => {
      res.status(404).send({ 
        success: false,
        message: "Payment not found" 
      });
    })
  );

  // ================= WEBHOOK ROUTES =================

  // Paystack webhook handler
  app.post(
    "/api/webhooks/paystack",
    controller.handlePaystackWebhook || ((req, res) => {
      console.log('📡 Paystack webhook received:', req.body);
      res.status(200).send({ status: 'received' });
    })
  );

  // Flutterwave webhook (future)
  app.post(
    "/api/webhooks/flutterwave",
    controller.handleFlutterwaveWebhook || ((req, res) => {
      console.log('📡 Flutterwave webhook received');
      res.status(200).send({ status: 'received', message: 'Coming soon' });
    })
  );

  // ================= INVESTMENT HISTORY =================

  // Get user's investment history
  app.get(
    "/api/investments/my-investments",
    [authJwt.verifyToken],
    controller.getMyInvestments || ((req, res) => {
      res.status(200).send({ success: true, data: [] });
    })
  );

  // Get user's investment summary
  app.get(
    "/api/investments/my-summary",
    [authJwt.verifyToken],
    controller.getInvestmentSummary || ((req, res) => {
      res.status(200).send({
        success: true,
        data: {
          totalInvested: 0,
          totalCampaigns: 0,
          activeInvestments: 0
        }
      });
    })
  );

  // Get campaign investors (founder view)
  app.get(
    "/api/investments/campaign/:campaignId/investors",
    [authJwt.verifyToken],
    controller.getCampaignInvestors || ((req, res) => {
      res.status(200).send({ success: true, data: [] });
    })
  );

  // Get investment analytics
  app.get(
    "/api/investments/campaign/:campaignId/analytics",
    [authJwt.verifyToken],
    controller.getCampaignInvestmentAnalytics || ((req, res) => {
      res.status(200).send({
        success: true,
        data: {
          totalRaised: 0,
          investorCount: 0,
          averageInvestment: 0
        }
      });
    })
  );

  // ================= PAYMENT MANAGEMENT =================

  // Get payment details
  app.get(
    "/api/investments/payment/:paymentId",
    [authJwt.verifyToken],
    controller.getPaymentDetails || ((req, res) => {
      res.status(404).send({ success: false, message: "Payment not found" });
    })
  );

  // Get all payments (admin only)
  app.get(
    "/api/admin/investments/payments",
    [authJwt.verifyToken, adminAuth.verifyAdmin || (() => {})],
    controller.getAllPayments || ((req, res) => {
      res.status(200).send({ success: true, data: [] });
    })
  );

  // Refund investment (admin only)
  app.post(
    "/api/admin/investments/:investmentId/refund",
    [authJwt.verifyToken, adminAuth.verifyAdmin || (() => {})],
    controller.refundInvestment || ((req, res) => {
      res.status(501).send({ message: "Refund functionality not implemented" });
    })
  );

  // ================= INVESTMENT ANALYTICS =================

  // Get platform investment statistics (admin only)
  app.get(
    "/api/admin/investments/stats",
    [authJwt.verifyToken, adminAuth.verifyAdmin || (() => {})],
    controller.getPlatformInvestmentStats || ((req, res) => {
      res.status(200).send({
        success: true,
        data: {
          totalInvestments: 0,
          totalAmount: 0,
          successRate: 0
        }
      });
    })
  );
};