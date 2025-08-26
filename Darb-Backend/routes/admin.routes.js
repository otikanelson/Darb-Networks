const { authJwt } = require("../middlewares");
const { verifyAdmin } = require("../middlewares/adminAuth");
const controller = require("../controllers/admin.controller");

module.exports = function(app) {
  // CORS headers
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept, Authorization"
    );
    next();
  });

  // All admin routes require authentication AND admin role
  const adminMiddleware = [authJwt.verifyToken, verifyAdmin];

  // Dashboard stats
  app.get(
    "/api/admin/dashboard-stats",
    adminMiddleware,
    controller.getDashboardStats || ((req, res) => {
      res.status(200).send({
        success: true,
        data: {
          totalUsers: 0,
          totalCampaigns: 0,
          totalInvestments: 0,
          pendingApprovals: 0
        }
      });
    })
  );

  // Campaign management
  app.get(
    "/api/admin/campaigns",
    adminMiddleware,
    controller.getAllCampaignsForReview || ((req, res) => {
      res.status(200).send({ success: true, data: [] });
    })
  );

  app.get(
    "/api/admin/campaigns/:id",
    adminMiddleware,
    controller.getCampaignForReview || ((req, res) => {
      res.status(404).send({ success: false, message: "Campaign not found" });
    })
  );

  app.put(
    "/api/admin/campaigns/:id/approve",
    adminMiddleware,
    controller.approveCampaign || ((req, res) => {
      res.status(501).send({ message: "Approval functionality not implemented" });
    })
  );

  app.put(
    "/api/admin/campaigns/:id/reject",
    adminMiddleware,
    controller.rejectCampaign || ((req, res) => {
      res.status(501).send({ message: "Rejection functionality not implemented" });
    })
  );

  app.put(
    "/api/admin/campaigns/:id/featured",
    adminMiddleware,
    controller.toggleFeaturedStatus || ((req, res) => {
      res.status(501).send({ message: "Featured toggle not implemented" });
    })
  );

  // User management
  app.get(
    "/api/admin/users",
    adminMiddleware,
    controller.getAllUsers || ((req, res) => {
      res.status(200).send({ success: true, data: [] });
    })
  );

  // User details
  app.get(
    "/api/admin/users/:id",
    adminMiddleware,
    controller.getUserById || ((req, res) => {
      res.status(404).send({ success: false, message: "User not found" });
    })
  );

  // Update user status (activate/deactivate)
  app.put(
    "/api/admin/users/:id/status",
    adminMiddleware,
    controller.updateUserStatus || ((req, res) => {
      res.status(501).send({ message: "User status update not implemented" });
    })
  );

  // System analytics
  app.get(
    "/api/admin/analytics",
    adminMiddleware,
    controller.getSystemAnalytics || ((req, res) => {
      res.status(200).send({
        success: true,
        data: {
          userGrowth: [],
          campaignMetrics: {},
          revenueData: []
        }
      });
    })
  );
};