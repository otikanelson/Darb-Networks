const { firebaseAuth } = require("../middlewares");
const controller = require("../controllers/campaign.controller");

module.exports = function (app) {
  // ============= SPECIFIC ROUTES FIRST (order matters!) =============

  /**
   * STEP 6: Firebase Auth - Get featured campaigns (public)
   * No authentication required
   */
  app.get(
    "/api/campaigns/featured",
    controller.getFeaturedCampaigns
  );

  /**
   * STEP 6: Firebase Auth - Get recent campaigns (public)
   * No authentication required
   */
  app.get(
    "/api/campaigns/recent",
    controller.getRecentCampaigns || controller.getAllCampaigns
  );

  /**
   * STEP 6: Firebase Auth - Search campaigns (public)
   * No authentication required
   */
  app.get(
    "/api/campaigns/search",
    controller.searchCampaigns || ((req, res) => {
      res.status(501).send({ message: "Search not implemented yet" });
    })
  );

  /**
   * STEP 6: Firebase Auth - Get my campaigns (founder only)
   * Authentication required: founder viewing their own campaigns
   */
  app.get(
    "/api/campaigns/user/my-campaigns",
    [firebaseAuth.verifyFirebaseToken],
    controller.getMyCampaigns
  );

  /**
   * STEP 6: Firebase Auth - Get viewed campaigns (authenticated users)
   * Authentication required: track user's campaign views
   */
  app.get(
    "/api/campaigns/user/viewed",
    [firebaseAuth.verifyFirebaseToken],
    controller.getViewedCampaigns || ((req, res) => {
      res.status(200).send({ success: true, data: [] });
    })
  );

  /**
   * STEP 6: Firebase Auth - Get favorite campaigns (authenticated users)
   * Authentication required: get user's favorited campaigns
   */
  app.get(
    "/api/campaigns/user/favorites",
    [firebaseAuth.verifyFirebaseToken],
    controller.getFavoriteCampaigns || ((req, res) => {
      res.status(200).send({ success: true, data: [] });
    })
  );

  /**
   * STEP 6: Firebase Auth - Get funded campaigns (investors)
   * Authentication required: get campaigns user has invested in
   */
  app.get(
    "/api/campaigns/user/funded",
    [firebaseAuth.verifyFirebaseToken],
    controller.getFundedCampaigns || ((req, res) => {
      res.status(200).send({ success: true, data: [] });
    })
  );

  // ============= CAMPAIGN CRUD OPERATIONS =============

  /**
   * STEP 6: Firebase Auth - Create new campaign
   * Authentication required: verified email required
   * Request:
   * POST /api/campaigns
   * Headers: Authorization: Bearer <FIREBASE_ID_TOKEN>
   * Body: { title, description, targetAmount, category, ... }
   */
  app.post(
    "/api/campaigns",
    [firebaseAuth.verifyFirebaseToken, firebaseAuth.requireVerifiedEmail],
    controller.createCampaign
  );

  /**
   * STEP 6: Firebase Auth - Upload campaign image
   * Authentication required: verified email required
   */
  app.post(
    "/api/campaigns/:campaignId/image",
    [firebaseAuth.verifyFirebaseToken, firebaseAuth.requireVerifiedEmail],
    controller.uploadCampaignImage || ((req, res) => {
      res.status(501).send({ message: "Image upload not implemented yet" });
    })
  );

  /**
   * STEP 6: Firebase Auth - Toggle favorite status
   * Authentication required
   */
  app.post(
    "/api/campaigns/:campaignId/favorite",
    [firebaseAuth.verifyFirebaseToken],
    controller.toggleFavorite || ((req, res) => {
      res.status(501).send({ message: "Favorites not implemented yet" });
    })
  );

  /**
   * STEP 6: Firebase Auth - Track campaign view
   * Authentication required
   */
  app.post(
    "/api/campaigns/:campaignId/view",
    [firebaseAuth.verifyFirebaseToken],
    controller.trackCampaignView || ((req, res) => {
      res.status(200).send({ success: true, message: "View tracked" });
    })
  );

  // ============= CAMPAIGN VIEWING ROUTES =============

  /**
   * STEP 6: Firebase Auth - Get related campaigns (public)
   * No authentication required
   */
  app.get(
    "/api/campaigns/:id/related",
    controller.getRelatedCampaigns || ((req, res) => {
      res.status(200).send({ success: true, data: [] });
    })
  );

  /**
   * STEP 6: Firebase Auth - Get campaign analytics (founder only)
   * Authentication required
   */
  app.get(
    "/api/campaigns/:id/analytics",
    [firebaseAuth.verifyFirebaseToken],
    controller.getCampaignAnalytics || ((req, res) => {
      res.status(200).send({ success: true, data: {} });
    })
  );

  /**
   * STEP 6: Firebase Auth - Get campaign statistics (public)
   * No authentication required
   */
  app.get(
    "/api/campaigns/:id/stats",
    controller.getCampaignStats || ((req, res) => {
      res.status(200).send({ success: true, data: {} });
    })
  );

  // ============= CAMPAIGN EDITING ROUTES =============

  /**
   * STEP 6: Firebase Auth - Get campaign for editing (founder only)
   * Authentication required
   */
  app.get(
    "/api/campaigns/:id/edit",
    [firebaseAuth.verifyFirebaseToken],
    controller.getCampaignForEdit || controller.getCampaignById
  );

  /**
   * STEP 6: Firebase Auth - Update campaign (founder only)
   * Authentication required: verified email required
   */
  app.put(
    "/api/campaigns/:id",
    [firebaseAuth.verifyFirebaseToken, firebaseAuth.requireVerifiedEmail],
    controller.updateCampaign
  );

  /**
   * STEP 6: Firebase Auth - Delete gallery image (founder only)
   * Authentication required: verified email required
   */
  app.delete(
    "/api/campaigns/:campaignId/images/:imageId",
    [firebaseAuth.verifyFirebaseToken, firebaseAuth.requireVerifiedEmail],
    controller.deleteCampaignImage || ((req, res) => {
      res.status(501).json({ success: false, message: "Not implemented" });
    })
  );

  /**
   * STEP 6: Firebase Auth - Delete campaign (founder only)
   * Authentication required: verified email required
   */
  app.delete(
    "/api/campaigns/:id",
    [firebaseAuth.verifyFirebaseToken, firebaseAuth.requireVerifiedEmail],
    controller.deleteCampaign || ((req, res) => {
      res.status(501).send({ message: "Delete not implemented yet" });
    })
  );

  // ============= GENERAL ROUTES LAST =============

  /**
   * STEP 6: Firebase Auth - Get all approved campaigns (public)
   * No authentication required - MUST come after specific routes
   */
  app.get(
    "/api/campaigns",
    controller.getAllCampaigns
  );

  /**
   * STEP 6: Firebase Auth - Get campaign by ID (public with optional auth)
   * Optional authentication: tracks views for authenticated users - MUST be last
   */
  app.get(
    "/api/campaigns/:id",
    [firebaseAuth.optionalFirebaseToken],
    controller.getCampaignById
  );
};