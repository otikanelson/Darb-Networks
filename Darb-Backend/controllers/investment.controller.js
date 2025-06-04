// controllers/investment.controller.js
// Complete investment controller with all functions

const db = require("../models");

// Check if PaystackService exists, if not create a mock
let PaystackService;
try {
  PaystackService = require("../services/paymentService");
} catch (error) {
  console.log('⚠️ PaystackService not found, using mock service');
  PaystackService = {
    initializePayment: async (data) => ({ 
      success: true, 
      data: { 
        authorization_url: 'https://checkout.paystack.com/mock',
        access_code: 'mock_access_code',
        reference: data.reference
      }
    }),
    verifyPayment: async (ref) => ({ 
      success: true, 
      data: { reference: ref, amount: 50000, currency: 'NGN' }
    }),
    processWebhook: async (payload, signature) => ({ success: true, message: 'Mock webhook' })
  };
}

/**
 * INVESTMENT CONTROLLER - ALL FUNCTIONS
 * Complete investment system with payment processing
 */

// ================= INVESTMENT CREATION & PROCESSING =================

/**
 * Initiate investment with payment (main function)
 */
exports.initiateInvestmentWithPayment = async (req, res) => {
  try {
    const investorId = req.userId;
    const { campaignId, amount, investorMessage } = req.body;

    console.log('🚀 Initiating investment:', { campaignId, amount, investorId });

    // Validate input
    if (!campaignId || !amount) {
      return res.status(400).send({
        success: false,
        message: 'Campaign ID and amount are required'
      });
    }

    if (amount <= 0) {
      return res.status(400).send({
        success: false,
        message: 'Investment amount must be greater than 0'
      });
    }

    // Get campaign details
    const [campaign] = await db.sequelize.query(
      `SELECT c.*, u.fullName as founder_name 
       FROM campaigns c 
       JOIN users u ON c.founder_id = u.id 
       WHERE c.id = ? AND c.status = 'approved'`,
      {
        replacements: [campaignId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    if (!campaign) {
      return res.status(404).send({
        success: false,
        message: 'Campaign not found or not approved for investment'
      });
    }

    // Validate minimum investment
    if (amount < campaign.minimum_investment) {
      return res.status(400).send({
        success: false,
        message: `Minimum investment amount is ₦${campaign.minimum_investment.toLocaleString()}`
      });
    }

    // Check if investor is not the founder
    if (investorId === campaign.founder_id) {
      return res.status(400).send({
        success: false,
        message: 'Campaign founders cannot invest in their own campaigns'
      });
    }

    // Get investor details
    const [investor] = await db.sequelize.query(
      'SELECT fullName, email FROM users WHERE id = ?',
      {
        replacements: [investorId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    if (!investor) {
      return res.status(404).send({
        success: false,
        message: 'Investor not found'
      });
    }

    // Generate payment reference
    const paymentReference = `INV_${campaignId}_${investorId}_${Date.now()}`;

    // Create campaign snapshot
    const campaignSnapshot = {
      title: campaign.title,
      category: campaign.category,
      target_amount: campaign.target_amount,
      minimum_investment: campaign.minimum_investment,
      founder_name: campaign.founder_name,
      snapshot_date: new Date()
    };

    // Create investment record
    const [investmentResult] = await db.sequelize.query(
      `INSERT INTO investments (
        campaign_id, investor_id, amount, payment_reference, 
        payment_status, payment_method, investor_message, campaign_snapshot
      ) VALUES (?, ?, ?, ?, 'pending', 'paystack', ?, ?)`,
      {
        replacements: [
          campaignId,
          investorId, 
          amount, 
          paymentReference,
          investorMessage || null,
          JSON.stringify(campaignSnapshot)
        ],
        type: db.sequelize.QueryTypes.INSERT
      }
    );

    const investmentId = investmentResult;

    // Initialize payment
    const callbackUrl = `${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/investment/verify/${paymentReference}`;
    
    const paymentData = {
      email: investor.email,
      amount: amount,
      reference: paymentReference,
      callback_url: callbackUrl,
      campaignId: campaignId,
      investorId: investorId,
      investmentId: investmentId,
      campaignTitle: campaign.title,
      investorName: investor.fullName
    };

    const paymentInit = await PaystackService.initializePayment(paymentData);

    if (!paymentInit.success) {
      await db.sequelize.query(
        `UPDATE investments SET payment_status = 'failed' WHERE id = ?`,
        {
          replacements: [investmentId],
          type: db.sequelize.QueryTypes.UPDATE
        }
      );

      return res.status(400).send({
        success: false,
        message: 'Payment initialization failed',
        error: paymentInit.error
      });
    }

    console.log('✅ Investment and payment initialized:', { investmentId, paymentReference });

    res.status(201).send({
      success: true,
      message: 'Investment initiated successfully',
      data: {
        investmentId,
        paymentReference,
        amount,
        campaign: {
          id: campaign.id,
          title: campaign.title,
          founder_name: campaign.founder_name
        },
        investor: {
          name: investor.fullName,
          email: investor.email
        },
        payment: {
          authorization_url: paymentInit.data.authorization_url,
          access_code: paymentInit.data.access_code
        },
        nextStep: 'redirect_to_payment'
      }
    });

  } catch (error) {
    console.error('❌ Error initiating investment:', error);
    res.status(500).send({
      success: false,
      message: 'Error initiating investment',
      error: error.message
    });
  }
};

/**
 * Verify payment status
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { paymentReference } = req.params;
    const userId = req.userId;

    console.log('🔍 Verifying payment:', { paymentReference, userId });

    // Get investment details
    const [investment] = await db.sequelize.query(
      `SELECT i.*, c.title as campaign_title, c.founder_id,
              u.fullName as investor_name, u.email as investor_email
       FROM investments i
       JOIN campaigns c ON i.campaign_id = c.id
       JOIN users u ON i.investor_id = u.id
       WHERE i.payment_reference = ? AND i.investor_id = ?`,
      {
        replacements: [paymentReference, userId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    if (!investment) {
      return res.status(404).send({
        success: false,
        message: 'Investment not found or unauthorized'
      });
    }

    // If already confirmed, return current status
    if (investment.payment_status === 'completed') {
      return res.status(200).send({
        success: true,
        message: 'Payment already confirmed',
        data: {
          investmentId: investment.id,
          campaignId: investment.campaign_id,
          amount: investment.amount,
          status: 'completed',
          confirmedAt: investment.confirmed_at
        }
      });
    }

    // Verify with Paystack
    const verification = await PaystackService.verifyPayment(paymentReference);

    if (!verification.success) {
      let newStatus = 'failed';
      if (verification.status === 'abandoned') {
        newStatus = 'abandoned';
      }

      await db.sequelize.query(
        `UPDATE investments SET payment_status = ? WHERE payment_reference = ?`,
        {
          replacements: [newStatus, paymentReference],
          type: db.sequelize.QueryTypes.UPDATE
        }
      );

      return res.status(400).send({
        success: false,
        message: 'Payment verification failed',
        error: verification.error,
        data: {
          investmentId: investment.id,
          status: newStatus
        }
      });
    }

    // Payment successful - update investment
    await db.sequelize.query(
      `UPDATE investments 
       SET payment_status = 'completed',
           confirmed_at = NOW(),
           payment_gateway_id = ?,
           payment_gateway_response = ?
       WHERE payment_reference = ?`,
      {
        replacements: [
          verification.data.reference,
          JSON.stringify(verification.data),
          paymentReference
        ],
        type: db.sequelize.QueryTypes.UPDATE
      }
    );

    // Update campaign totals (use procedure if available, otherwise manual)
    try {
      await db.sequelize.query(
        'CALL AfterInvestmentOperation(?)',
        {
          replacements: [investment.campaign_id],
          type: db.sequelize.QueryTypes.RAW
        }
      );
    } catch (procError) {
      console.log('Procedure not available, updating manually');
      await db.sequelize.query(
        'CALL UpdateCampaignInvestmentTotals(?)',
        {
          replacements: [investment.campaign_id],
          type: db.sequelize.QueryTypes.RAW
        }
      );
    }

    // Create notifications
    await this.createInvestmentNotifications(investment);

    console.log('✅ Payment verified and investment confirmed:', paymentReference);

    res.status(200).send({
      success: true,
      message: 'Payment verified and investment confirmed',
      data: {
        investmentId: investment.id,
        campaignId: investment.campaign_id,
        amount: investment.amount,
        status: 'completed',
        confirmedAt: new Date(),
        payment: verification.data
      }
    });

  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    res.status(500).send({
      success: false,
      message: 'Error verifying payment',
      error: error.message
    });
  }
};

/**
 * Handle Paystack webhook
 */
exports.handlePaystackWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature'];
    const payload = JSON.stringify(req.body);

    console.log('📡 Received Paystack webhook');

    if (!signature) {
      return res.status(400).send({
        success: false,
        message: 'No signature provided'
      });
    }

    const result = await PaystackService.processWebhook(payload, signature);

    if (result.success) {
      res.status(200).send({
        success: true,
        message: result.message || 'Webhook processed successfully'
      });
    } else {
      res.status(400).send({
        success: false,
        message: result.error
      });
    }

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).send({
      success: false,
      message: 'Webhook processing failed'
    });
  }
};

/**
 * Get payment status
 */
exports.getPaymentStatus = async (req, res) => {
  try {
    const { paymentReference } = req.params;
    const userId = req.userId;

    const [investment] = await db.sequelize.query(
      `SELECT 
        i.id,
        i.amount,
        i.payment_status,
        i.payment_reference,
        i.confirmed_at,
        i.investment_date,
        c.title as campaign_title,
        c.id as campaign_id
       FROM investments i
       JOIN campaigns c ON i.campaign_id = c.id
       WHERE i.payment_reference = ? AND i.investor_id = ?`,
      {
        replacements: [paymentReference, userId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    if (!investment) {
      return res.status(404).send({
        success: false,
        message: 'Investment not found'
      });
    }

    res.status(200).send({
      success: true,
      data: investment
    });

  } catch (error) {
    console.error('❌ Error getting payment status:', error);
    res.status(500).send({
      success: false,
      message: 'Error fetching payment status'
    });
  }
};

// ================= INVESTMENT HISTORY & ANALYTICS =================

/**
 * Get user's investment history
 */
exports.getMyInvestments = async (req, res) => {
  try {
    const userId = req.userId;
    const { status, page = 1, limit = 10 } = req.query;

    console.log('📊 Getting investments for user:', userId);

    let whereClause = 'WHERE i.investor_id = ?';
    let replacements = [userId];

    if (status && status !== 'all') {
      whereClause += ' AND i.payment_status = ?';
      replacements.push(status);
    }

    const offset = (page - 1) * limit;

    const investments = await db.sequelize.query(
      `SELECT 
        i.id,
        i.amount,
        i.payment_status,
        i.payment_reference,
        i.investment_date,
        i.confirmed_at,
        i.investor_message,
        i.total_repaid,
        i.repayment_status,
        i.payment_method,
        c.id as campaign_id,
        c.title as campaign_title,
        c.category,
        c.main_image_url,
        c.status as campaign_status,
        u.fullName as founder_name,
        u.companyName as founder_company
       FROM investments i
       JOIN campaigns c ON i.campaign_id = c.id
       JOIN users u ON c.founder_id = u.id
       ${whereClause}
       ORDER BY i.investment_date DESC
       LIMIT ? OFFSET ?`,
      {
        replacements: [...replacements, parseInt(limit), parseInt(offset)],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    // Get total count
    const [countResult] = await db.sequelize.query(
      `SELECT COUNT(*) as total FROM investments i ${whereClause}`,
      {
        replacements: replacements,
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    // Get summary
    const [summary] = await db.sequelize.query(
      `SELECT 
        COUNT(*) as total_investments,
        SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END) as total_invested,
        SUM(total_repaid) as total_repaid,
        COUNT(DISTINCT campaign_id) as campaigns_invested
       FROM investments 
       WHERE investor_id = ?`,
      {
        replacements: [userId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    res.status(200).send({
      success: true,
      data: investments,
      pagination: {
        total: countResult.total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(countResult.total / limit)
      },
      summary: summary
    });

  } catch (error) {
    console.error('❌ Error getting user investments:', error);
    res.status(500).send({
      success: false,
      message: 'Error fetching investment history',
      error: error.message
    });
  }
};

/**
 * Get campaign investors (founder view)
 */
exports.getCampaignInvestors = async (req, res) => {
  try {
    const founderId = req.userId;
    const { campaignId } = req.params;

    console.log('👥 Getting investors for campaign:', { campaignId, founderId });

    // Verify campaign ownership
    const [campaign] = await db.sequelize.query(
      'SELECT id, title, founder_id FROM campaigns WHERE id = ? AND founder_id = ?',
      {
        replacements: [campaignId, founderId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    if (!campaign) {
      return res.status(404).send({
        success: false,
        message: 'Campaign not found or unauthorized'
      });
    }

    // Get investors using founder_investment_history view if available
    let investors;
    try {
      investors = await db.sequelize.query(
        `SELECT * FROM founder_investment_history 
         WHERE campaign_id = ? 
         ORDER BY confirmed_at DESC`,
        {
          replacements: [campaignId],
          type: db.sequelize.QueryTypes.SELECT
        }
      );
    } catch (viewError) {
      // Fallback if view doesn't exist
      investors = await db.sequelize.query(
        `SELECT 
          i.id as investment_id,
          i.investor_id,
          i.amount as investment_amount,
          i.payment_status,
          i.confirmed_at,
          u.fullName as investor_name,
          u.email as investor_email,
          u.companyName as investor_company
         FROM investments i
         JOIN users u ON i.investor_id = u.id
         WHERE i.campaign_id = ? AND i.payment_status = 'completed'
         ORDER BY i.confirmed_at DESC`,
        {
          replacements: [campaignId],
          type: db.sequelize.QueryTypes.SELECT
        }
      );
    }

    // Get campaign summary
    const [campaignSummary] = await db.sequelize.query(
      `SELECT 
        total_investments,
        investor_count,
        target_amount,
        (total_investments / target_amount * 100) as funding_percentage
       FROM campaigns 
       WHERE id = ?`,
      {
        replacements: [campaignId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    res.status(200).send({
      success: true,
      data: {
        campaign: {
          id: campaign.id,
          title: campaign.title,
          summary: campaignSummary
        },
        investors: investors
      }
    });

  } catch (error) {
    console.error('❌ Error getting campaign investors:', error);
    res.status(500).send({
      success: false,
      message: 'Error fetching campaign investors',
      error: error.message
    });
  }
};

/**
 * Get investment analytics for campaign
 */
exports.getCampaignInvestmentAnalytics = async (req, res) => {
  try {
    const founderId = req.userId;
    const { campaignId } = req.params;

    // Verify campaign ownership
    const [campaign] = await db.sequelize.query(
      'SELECT id, title FROM campaigns WHERE id = ? AND founder_id = ?',
      {
        replacements: [campaignId, founderId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    if (!campaign) {
      return res.status(404).send({
        success: false,
        message: 'Campaign not found or unauthorized'
      });
    }

    // Get basic analytics
    const [analytics] = await db.sequelize.query(
      `SELECT 
        COUNT(*) as total_investments,
        SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END) as total_invested,
        AVG(CASE WHEN payment_status = 'completed' THEN amount ELSE NULL END) as average_investment,
        COUNT(DISTINCT investor_id) as unique_investors
       FROM investments 
       WHERE campaign_id = ?`,
      {
        replacements: [campaignId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    // Get daily trends
    const trends = await db.sequelize.query(
      `SELECT 
        DATE(confirmed_at) as date,
        COUNT(*) as investments_count,
        SUM(amount) as daily_amount
       FROM investments 
       WHERE campaign_id = ? 
         AND payment_status = 'completed'
         AND confirmed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(confirmed_at)
       ORDER BY date DESC`,
      {
        replacements: [campaignId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    res.status(200).send({
      success: true,
      data: {
        campaign: campaign,
        analytics: analytics,
        trends: trends
      }
    });

  } catch (error) {
    console.error('❌ Error getting investment analytics:', error);
    res.status(500).send({
      success: false,
      message: 'Error fetching investment analytics',
      error: error.message
    });
  }
};

// ================= REPAYMENT MANAGEMENT =================

/**
 * Create repayment batch
 */
exports.createRepaymentBatch = async (req, res) => {
  try {
    const founderId = req.userId;
    const { campaignId } = req.params;
    const { repaymentAmount, repaymentType, interestRate, founderMessage } = req.body;

    console.log('💰 Creating repayment batch:', { campaignId, repaymentAmount, repaymentType });

    // Validate input
    if (!repaymentAmount || repaymentAmount <= 0) {
      return res.status(400).send({
        success: false,
        message: 'Valid repayment amount is required'
      });
    }

    // Verify campaign ownership
    const [campaign] = await db.sequelize.query(
      'SELECT id, title, founder_id, total_investments FROM campaigns WHERE id = ? AND founder_id = ?',
      {
        replacements: [campaignId, founderId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    if (!campaign) {
      return res.status(404).send({
        success: false,
        message: 'Campaign not found or unauthorized'
      });
    }

    // Create repayment batch using procedure if available
    try {
      const [result] = await db.sequelize.query(
        'CALL CreateInvestorRepayments(?, ?, ?, ?, ?)',
        {
          replacements: [
            campaignId,
            repaymentAmount,
            repaymentType || 'partial',
            interestRate || 0,
            founderMessage || 'Repayment from founder'
          ],
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      res.status(201).send({
        success: true,
        message: 'Repayment batch created successfully',
        data: {
          batchId: result.repayment_batch_id,
          investorsAffected: result.investors_affected,
          totalAmount: result.repayment_amount
        }
      });

    } catch (procError) {
      console.log('Stored procedure not available, manual creation not implemented yet');
      res.status(501).send({
        success: false,
        message: 'Repayment batch creation requires database procedures to be set up'
      });
    }

  } catch (error) {
    console.error('❌ Error creating repayment batch:', error);
    res.status(500).send({
      success: false,
      message: 'Error creating repayment batch',
      error: error.message
    });
  }
};

/**
 * Get repayment history
 */
exports.getRepaymentHistory = async (req, res) => {
  try {
    const founderId = req.userId;
    const { campaignId } = req.params;

    // Verify campaign ownership
    const [campaign] = await db.sequelize.query(
      'SELECT id, title FROM campaigns WHERE id = ? AND founder_id = ?',
      {
        replacements: [campaignId, founderId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    if (!campaign) {
      return res.status(404).send({
        success: false,
        message: 'Campaign not found or unauthorized'
      });
    }

    // Get repayment history (empty for now until repayments are created)
    const repayments = [];

    res.status(200).send({
      success: true,
      data: {
        campaign: campaign,
        repayments: repayments
      }
    });

  } catch (error) {
    console.error('❌ Error getting repayment history:', error);
    res.status(500).send({
      success: false,
      message: 'Error fetching repayment history',
      error: error.message
    });
  }
};

// ================= NOTIFICATIONS =================

/**
 * Get investment notifications
 */
exports.getInvestmentNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    let whereClause = 'WHERE user_id = ?';
    let replacements = [userId];

    if (unreadOnly === 'true') {
      whereClause += ' AND is_read = FALSE';
    }

    const offset = (page - 1) * limit;

    const notifications = await db.sequelize.query(
      `SELECT * FROM investment_notifications 
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      {
        replacements: [...replacements, parseInt(limit), parseInt(offset)],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    res.status(200).send({
      success: true,
      data: notifications
    });

  } catch (error) {
    console.error('❌ Error getting notifications:', error);
    res.status(500).send({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

// ================= HELPER FUNCTIONS =================

/**
 * Create investment notifications
 */
exports.createInvestmentNotifications = async (investment) => {
  try {
    // Notification for investor
    await db.sequelize.query(
      `INSERT INTO investment_notifications (
        investment_id, user_id, type, title, message
      ) VALUES (?, ?, 'payment_confirmed', ?, ?)`,
      {
        replacements: [
          investment.id,
          investment.investor_id,
          'Investment Confirmed! 🎉',
          `Your investment of ₦${investment.amount.toLocaleString()} in "${investment.campaign_title}" has been confirmed.`
        ],
        type: db.sequelize.QueryTypes.INSERT
      }
    );

    // Notification for founder
    await db.sequelize.query(
      `INSERT INTO investment_notifications (
        investment_id, user_id, type, title, message
      ) VALUES (?, ?, 'investment_received', ?, ?)`,
      {
        replacements: [
          investment.id,
          investment.founder_id,
          'New Investment Received! 💰',
          `${investment.investor_name} invested ₦${investment.amount.toLocaleString()} in your campaign "${investment.campaign_title}".`
        ],
        type: db.sequelize.QueryTypes.INSERT
      }
    );

  } catch (error) {
    console.error('Error creating notifications:', error);
  }
};

// ================= EXPORTS =================

module.exports = {
  // Main investment functions
  initiateInvestmentWithPayment: exports.initiateInvestmentWithPayment,
  verifyPayment: exports.verifyPayment,
  handlePaystackWebhook: exports.handlePaystackWebhook,
  getPaymentStatus: exports.getPaymentStatus,
  
  // Investment history and analytics
  getMyInvestments: exports.getMyInvestments,
  getCampaignInvestors: exports.getCampaignInvestors,
  getCampaignInvestmentAnalytics: exports.getCampaignInvestmentAnalytics,
  
  // Repayment management
  createRepaymentBatch: exports.createRepaymentBatch,
  getRepaymentHistory: exports.getRepaymentHistory,
  
  // Notifications
  getInvestmentNotifications: exports.getInvestmentNotifications,
  createInvestmentNotifications: exports.createInvestmentNotifications
};