const { authJwt, adminAuth } = require("../middlewares");
const controller = require("../controllers/campaign.controller");

module.exports = function(app) {
  // CORS headers
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept, Authorization"
    );
    next();
  });

  // ============= SPECIFIC ROUTES FIRST (order matters!) =============
  
  // Get featured campaigns (public)
  app.get(
    "/api/campaigns/featured",
    controller.getFeaturedCampaigns
  );

  // Get recent campaigns (public)
  app.get(
    "/api/campaigns/recent",
    controller.getRecentCampaigns || controller.getAllCampaigns
  );

  // Search campaigns (public)
  app.get(
    "/api/campaigns/search",
    controller.searchCampaigns || ((req, res) => {
      res.status(501).send({ message: "Search not implemented yet" });
    })
  );

  // Get my campaigns (founder's own campaigns - drafts, submitted, approved, rejected)
  app.get(
    "/api/campaigns/user/my-campaigns",
    [authJwt.verifyToken],
    controller.getMyCampaigns
  );

  // Get viewed campaigns (campaigns the user has viewed)
  app.get(
    "/api/campaigns/user/viewed",
    [authJwt.verifyToken],
    controller.getViewedCampaigns || ((req, res) => {
      res.status(200).send({ success: true, data: [] });
    })
  );

  // Get favorite campaigns (campaigns the user has favorited)
  app.get(
    "/api/campaigns/user/favorites",
    [authJwt.verifyToken],
    controller.getFavoriteCampaigns || ((req, res) => {
      res.status(200).send({ success: true, data: [] });
    })
  );

  // Get funded campaigns (for investors - campaigns they've invested in)
  app.get(
    "/api/campaigns/user/funded",
    [authJwt.verifyToken],
    controller.getFundedCampaigns || ((req, res) => {
      res.status(200).send({ success: true, data: [] });
    })
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
    controller.uploadCampaignImage || ((req, res) => {
      res.status(501).send({ message: "Image upload not implemented yet" });
    })
  );

  // Toggle favorite status for a campaign
  app.post(
    "/api/campaigns/:campaignId/favorite",
    [authJwt.verifyToken],
    controller.toggleFavorite || ((req, res) => {
      res.status(501).send({ message: "Favorites not implemented yet" });
    })
  );

  // Track campaign view (when user views a campaign)
  app.post(
    "/api/campaigns/:campaignId/view",
    [authJwt.verifyToken],
    controller.trackCampaignView || ((req, res) => {
      res.status(200).send({ success: true, message: "View tracked" });
    })
  );

  // ============= CAMPAIGN VIEWING ROUTES =============
  
  // Get related campaigns (same category, exclude current)
  app.get(
    "/api/campaigns/:id/related",
    controller.getRelatedCampaigns || ((req, res) => {
      res.status(200).send({ success: true, data: [] });
    })
  );

  // Get campaign analytics (founder only)
  app.get(
    "/api/campaigns/:id/analytics",
    [authJwt.verifyToken],
    controller.getCampaignAnalytics || ((req, res) => {
      res.status(200).send({ success: true, data: {} });
    })
  );

  // Get campaign statistics
  app.get(
    "/api/campaigns/:id/stats",
    controller.getCampaignStats || ((req, res) => {
      res.status(200).send({ success: true, data: {} });
    })
  );

  // Get campaign milestones
  app.get(
    "/api/campaigns/:id/milestones",
    controller.getCampaignMilestones
  );

  // Get campaign team/collaborators
  app.get(
    "/api/campaigns/:id/team",
    controller.getCampaignTeam
  );

  // ============= CAMPAIGN EDITING ROUTES =============
  
  // Get campaign for editing (founder only, restricted access)
  app.get(
    "/api/campaigns/:id/edit",
    [authJwt.verifyToken],
    controller.getCampaignForEdit || controller.getCampaignById
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
    controller.deleteCampaign || ((req, res) => {
      res.status(501).send({ message: "Delete not implemented yet" });
    })
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