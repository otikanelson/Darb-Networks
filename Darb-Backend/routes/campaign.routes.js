const { authJwt, adminAuth } = require("../middlewares");
const controller = require("../controllers/campaign.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept, Authorization"
    );
    next();
  });

  // ============= SPECIFIC ROUTES FIRST (order matters!) =============
  
  // Get featured campaigns (must come before /api/campaigns/:id)
  app.get(
    "/api/campaigns/featured",
    controller.getFeaturedCampaigns
  );

  // Get my campaigns (founder's own campaigns - drafts, submitted, approved, rejected)
  app.get(
    "/api/campaigns/user/my-campaigns",
    [authJwt.verifyToken],
    controller.getMyCampaigns
  );

  app.get("/api/campaigns/:id", controller.getCampaignById);

  // Get viewed campaigns (campaigns the user has viewed)
  app.get(
    "/api/campaigns/user/viewed",
    [authJwt.verifyToken],
    controller.getViewedCampaigns
  );

  // Get favorite campaigns (campaigns the user has favorited)
  app.get(
    "/api/campaigns/user/favorites",
    [authJwt.verifyToken],
    controller.getFavoriteCampaigns
  );

  // Get funded campaigns (for investors - campaigns they've invested in)
  app.get(
    "/api/campaigns/user/funded",
    [authJwt.verifyToken],
    controller.getFundedCampaigns
  );

  // ============= CAMPAIGN VIEWING ROUTES =============
  
  // Get related campaigns (same category, exclude current)
  app.get(
    "/api/campaigns/:id/related",
    controller.getRelatedCampaigns
  );

  // Get campaign analytics (founder only)
  app.get(
    "/api/campaigns/:id/analytics",
    [authJwt.verifyToken],
    controller.getCampaignAnalytics
  );

  // ============= CAMPAIGN CRUD OPERATIONS =============
  
  // Create new campaign
  app.post(
    "/api/campaigns",
    [authJwt.verifyToken],
    controller.createCampaign
  );

  // Upload campaign image
  app.post(
    "/api/campaigns/:campaignId/image",
    [authJwt.verifyToken],
    controller.uploadCampaignImage
  );

  // Toggle favorite status for a campaign
  app.post(
    "/api/campaigns/:campaignId/favorite",
    [authJwt.verifyToken],
    controller.toggleFavorite
  );

  // Track campaign view (when user views a campaign)
  app.post(
    "/api/campaigns/:campaignId/view",
    [authJwt.verifyToken],
    controller.trackCampaignView
  );

  // Get campaign statistics
  app.get(
    "/api/campaigns/:id/stats",
    controller.getCampaignStats
  );

  // ============= CAMPAIGN EDITING ROUTES =============
  
  // Get campaign for editing (founder only, restricted access)
  app.get(
    "/api/campaigns/:id/edit",
    [authJwt.verifyToken],
    controller.getCampaignForEdit
  );

  // Update campaign (founder only, draft campaigns only)
  app.put(
    "/api/campaigns/:id",
    [authJwt.verifyToken],
    controller.updateCampaign
  );

  // Delete campaign (founder only, draft campaigns only)
  app.delete(
    "/api/campaigns/:id",
    [authJwt.verifyToken],
    controller.deleteCampaign
  );

  // ============= ADMIN ROUTES =============
  
  // Admin route to recalculate all stats
  app.post(
    "/api/admin/campaigns/recalculate-stats",
    [authJwt.verifyToken, adminAuth.verifyAdmin],
    controller.recalculateAllStats
  );

  // ============= GENERAL ROUTES LAST =============
  
  // Get all approved campaigns (public) - MUST come after specific routes
  app.get(
    "/api/campaigns",
    controller.getAllCampaigns
  );

  // Get campaign by ID (public, but tracks views) - MUST be last
  app.get(
    "/api/campaigns/:id",
    controller.getCampaignById
  );
};