const { authJwt } = require("../middlewares");
const { verifyAdmin } = require("../middlewares/adminAuth");
const controller = require("../controllers/admin.controller");

module.exports = function(app) {
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
    controller.getDashboardStats
  );

  // Campaign management
  app.get(
    "/api/admin/campaigns",
    adminMiddleware,
    controller.getAllCampaignsForReview
  );

  app.get(
    "/api/admin/campaigns/:id",
    adminMiddleware,
    controller.getCampaignForReview
  );

  app.put(
    "/api/admin/campaigns/:id/approve",
    adminMiddleware,
    controller.approveCampaign
  );

  app.put(
    "/api/admin/campaigns/:id/reject",
    adminMiddleware,
    controller.rejectCampaign
  );

  app.put(
    "/api/admin/campaigns/:id/featured",
    adminMiddleware,
    controller.toggleFeaturedStatus
  );

  // User management
  app.get(
    "/api/admin/users",
    adminMiddleware,
    controller.getAllUsers
  );
};