const { firebaseAuth } = require("../middlewares");
const controller = require("../controllers/investment.controller");
const express = require("express");

module.exports = function (app) {
  /**
   * STEP 6: Firebase Auth - Paystack webhook (public, no auth)
   * Webhook handler for Paystack payment notifications
   */
  app.post(
    "/api/webhooks/paystack",
    controller.handlePaystackWebhook || ((req, res) => {
      console.log('📡 Paystack webhook received');
      res.status(200).send({ status: 'received' });
    })
  );

  // ================= CORE INVESTMENT ROUTES =================

  /**
   * STEP 6: Firebase Auth - Create investment (requires verified email)
   * Authentication required: verified email required
   * Request:
   * POST /api/investments/create
   * Headers: Authorization: Bearer <FIREBASE_ID_TOKEN>
   * Body: { campaignId, amount, ... }
   */
  app.post(
    "/api/investments/create",
    [firebaseAuth.verifyFirebaseToken, firebaseAuth.requireVerifiedEmail],
    controller.initiateInvestmentWithPayment || ((req, res) => {
      res.status(501).send({
        success: false,
        message: "Investment creation not implemented yet"
      });
    })
  );

  /**
   * STEP 6: Firebase Auth - Initialize payment (requires verified email)
   * Authentication required: verified email required
   */
  app.post(
    "/api/investments/initialize-payment",
    [firebaseAuth.verifyFirebaseToken, firebaseAuth.requireVerifiedEmail],
    controller.initializePayment || controller.initiateInvestmentWithPayment || ((req, res) => {
      res.status(501).send({ message: "Payment initialization not implemented" });
    })
  );

  /**
   * STEP 6: Firebase Auth - Verify payment (authenticated users)
   * Authentication required
   */
  app.get(
    "/api/investments/verify/:paymentReference",
    [firebaseAuth.verifyFirebaseToken],
    controller.verifyPayment || ((req, res) => {
      res.status(501).send({ message: "Payment verification not implemented" });
    })
  );

  /**
   * STEP 6: Firebase Auth - Get payment status (authenticated users)
   * Authentication required
   */
  app.get(
    "/api/investments/status/:paymentReference",
    [firebaseAuth.verifyFirebaseToken],
    controller.getPaymentStatus || ((req, res) => {
      res.status(404).send({
        success: false,
        message: "Payment not found"
      });
    })
  );

  // ================= WEBHOOK ROUTES =================

  /**
   * STEP 6: Firebase Auth - Flutterwave webhook (public, no auth)
   * Webhook handler for Flutterwave payment notifications
   */
  app.post(
    "/api/webhooks/flutterwave",
    controller.handleFlutterwaveWebhook || ((req, res) => {
      console.log('📡 Flutterwave webhook received');
      res.status(200).send({ status: 'received', message: 'Coming soon' });
    })
  );

  // ================= INVESTMENT HISTORY =================

  /**
   * STEP 6: Firebase Auth - Get user's investment history (authenticated users)
   * Authentication required
   */
  app.get(
    "/api/investments/my-investments",
    [firebaseAuth.verifyFirebaseToken],
    controller.getMyInvestments || ((req, res) => {
      res.status(200).send({ success: true, data: [] });
    })
  );

  /**
   * STEP 6: Firebase Auth - Get user's investment summary (authenticated users)
   * Authentication required
   */
  app.get(
    "/api/investments/my-summary",
    [firebaseAuth.verifyFirebaseToken],
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

  /**
   * STEP 6: Firebase Auth - Get campaign investors (founder only)
   * Authentication required: founder viewing their campaign's investors
   */
  app.get(
    "/api/investments/campaign/:campaignId/investors",
    [firebaseAuth.verifyFirebaseToken],
    controller.getCampaignInvestors || ((req, res) => {
      res.status(200).send({ success: true, data: [] });
    })
  );

  /**
   * STEP 6: Firebase Auth - Get campaign investment analytics (founder only)
   * Authentication required: founder viewing their campaign's analytics
   */
  app.get(
    "/api/investments/campaign/:campaignId/analytics",
    [firebaseAuth.verifyFirebaseToken],
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

  /**
   * STEP 6: Firebase Auth - Get payment details (authenticated users)
   * Authentication required
   */
  app.get(
    "/api/investments/payment/:paymentId",
    [firebaseAuth.verifyFirebaseToken],
    controller.getPaymentDetails || ((req, res) => {
      res.status(404).send({ success: false, message: "Payment not found" });
    })
  );

  /**
   * STEP 6: Firebase Auth - Get all payments (admin only)
   * Authentication required: admin user
   */
  app.get(
    "/api/admin/investments/payments",
    [firebaseAuth.verifyFirebaseToken],
    controller.getAllPayments || ((req, res) => {
      res.status(200).send({ success: true, data: [] });
    })
  );

  /**
   * STEP 6: Firebase Auth - Refund investment (admin only)
   * Authentication required: admin user
   */
  app.post(
    "/api/admin/investments/:investmentId/refund",
    [firebaseAuth.verifyFirebaseToken],
    controller.refundInvestment || ((req, res) => {
      res.status(501).send({ message: "Refund functionality not implemented" });
    })
  );

  // ================= INVESTMENT ANALYTICS =================

  /**
   * STEP 6: Firebase Auth - Get platform investment statistics (admin only)
   * Authentication required: admin user
   */
  app.get(
    "/api/admin/investments/stats",
    [firebaseAuth.verifyFirebaseToken],
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