// services/paymentService.js
// Complete Paystack integration for investment system

const axios = require('axios');
const crypto = require('crypto');
const db = require("../models");

/**
 * PAYSTACK PAYMENT SERVICE
 * Handles all payment operations with Paystack including:
 * - Payment initialization
 * - Payment verification
 * - Webhook processing
 * - Investment confirmation
 */

class PaystackService {
  constructor() {
    this.baseURL = 'https://api.paystack.co';
    this.secretKey = process.env.PAYSTACK_SECRET_KEY;
    this.publicKey = process.env.PAYSTACK_PUBLIC_KEY;
    
    if (!this.secretKey) {
      console.warn('⚠️ PAYSTACK_SECRET_KEY not found in environment variables');
    }
  }

  /**
   * Get headers for Paystack API requests
   */
  getHeaders() {
    return {
      'Authorization': `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    };
  }

  /**
   * Initialize payment with Paystack
   * Creates a payment session and returns authorization URL
   */
  async initializePayment(paymentData) {
    try {
      console.log('🚀 Initializing Paystack payment:', paymentData.reference);

      const data = {
        email: paymentData.email,
        amount: Math.round(paymentData.amount * 100), // Convert to kobo
        reference: paymentData.reference,
        callback_url: paymentData.callback_url,
        metadata: {
          custom_fields: [
            {
              display_name: "Investment Type",
              variable_name: "investment_type",
              value: "Campaign Investment"
            },
            {
              display_name: "Campaign ID",
              variable_name: "campaign_id",
              value: paymentData.campaignId.toString()
            },
            {
              display_name: "Investor ID",
              variable_name: "investor_id", 
              value: paymentData.investorId.toString()
            },
            {
              display_name: "Investment ID",
              variable_name: "investment_id",
              value: paymentData.investmentId.toString()
            }
          ],
          campaign_title: paymentData.campaignTitle,
          investor_name: paymentData.investorName
        },
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer']
      };

      const response = await axios.post(
        `${this.baseURL}/transaction/initialize`,
        data,
        { headers: this.getHeaders() }
      );

      if (response.data.status) {
        console.log('✅ Paystack payment initialized successfully');
        
        // Store initialization data
        await this.storePaymentInitialization(paymentData.reference, response.data.data);
        
        return {
          success: true,
          data: {
            authorization_url: response.data.data.authorization_url,
            access_code: response.data.data.access_code,
            reference: response.data.data.reference
          }
        };
      } else {
        throw new Error(response.data.message || 'Payment initialization failed');
      }

    } catch (error) {
      console.error('❌ Paystack initialization error:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Verify payment with Paystack
   * Checks if payment was successful
   */
  async verifyPayment(reference) {
    try {
      console.log('🔍 Verifying Paystack payment:', reference);

      const response = await axios.get(
        `${this.baseURL}/transaction/verify/${reference}`,
        { headers: this.getHeaders() }
      );

      if (response.data.status && response.data.data.status === 'success') {
        console.log('✅ Payment verified successfully:', reference);
        
        const paymentData = response.data.data;
        
        // Store verification data
        await this.storePaymentVerification(reference, paymentData);
        
        return {
          success: true,
          data: {
            reference: paymentData.reference,
            amount: paymentData.amount / 100, // Convert from kobo
            currency: paymentData.currency,
            channel: paymentData.channel,
            gateway_response: paymentData.gateway_response,
            paid_at: paymentData.paid_at,
            customer: paymentData.customer,
            metadata: paymentData.metadata
          }
        };
      } else {
        console.log('❌ Payment verification failed:', response.data.message);
        
        return {
          success: false,
          error: response.data.message || 'Payment verification failed',
          status: response.data.data?.status
        };
      }

    } catch (error) {
      console.error('❌ Paystack verification error:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Process webhook from Paystack
   * Handles real-time payment notifications
   */
  async processWebhook(payload, signature) {
    try {
      // Verify webhook signature
      if (!this.verifyWebhookSignature(payload, signature)) {
        console.error('❌ Invalid webhook signature');
        return { success: false, error: 'Invalid signature' };
      }

      const event = JSON.parse(payload);
      console.log('📡 Processing Paystack webhook:', event.event);

      // Store webhook for audit trail
      await this.storeWebhook(event);

      switch (event.event) {
        case 'charge.success':
          return await this.handleChargeSuccess(event.data);
        
        case 'charge.failed':
          return await this.handleChargeFailed(event.data);
        
        case 'transfer.success':
          return await this.handleTransferSuccess(event.data);
        
        case 'transfer.failed':
          return await this.handleTransferFailed(event.data);
        
        default:
          console.log('ℹ️ Unhandled webhook event:', event.event);
          return { success: true, message: 'Event noted' };
      }

    } catch (error) {
      console.error('❌ Webhook processing error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify webhook signature for security
   */
  verifyWebhookSignature(payload, signature) {
    const expectedSignature = crypto
      .createHmac('sha512', this.secretKey)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Handle successful charge webhook
   */
  async handleChargeSuccess(data) {
    try {
      console.log('💳 Processing successful charge:', data.reference);

      // Get investment details
      const [investment] = await db.sequelize.query(
        `SELECT i.*, c.title as campaign_title, c.founder_id 
         FROM investments i 
         JOIN campaigns c ON i.campaign_id = c.id 
         WHERE i.payment_reference = ?`,
        {
          replacements: [data.reference],
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      if (!investment) {
        console.error('❌ Investment not found for reference:', data.reference);
        return { success: false, error: 'Investment not found' };
      }

      if (investment.payment_status === 'completed') {
        console.log('ℹ️ Investment already confirmed:', data.reference);
        return { success: true, message: 'Already processed' };
      }

      // Update investment status
      await db.sequelize.query(
        `UPDATE investments 
         SET payment_status = 'completed',
             confirmed_at = NOW(),
             payment_gateway_id = ?,
             payment_method = 'paystack',
             payment_gateway_response = ?
         WHERE payment_reference = ?`,
        {
          replacements: [
            data.id,
            JSON.stringify(data),
            data.reference
          ],
          type: db.sequelize.QueryTypes.UPDATE
        }
      );

      // Update campaign totals
      await db.sequelize.query(
        'CALL AfterInvestmentOperation(?)',
        {
          replacements: [investment.campaign_id],
          type: db.sequelize.QueryTypes.RAW
        }
      );

      // Create notifications
      await this.createPaymentNotifications(investment, data);

      console.log('✅ Investment confirmed via webhook:', data.reference);

      return { 
        success: true, 
        message: 'Investment confirmed',
        data: { 
          investmentId: investment.id,
          amount: data.amount / 100
        }
      };

    } catch (error) {
      console.error('❌ Error handling charge success:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle failed charge webhook
   */
  async handleChargeFailed(data) {
    try {
      console.log('❌ Processing failed charge:', data.reference);

      await db.sequelize.query(
        `UPDATE investments 
         SET payment_status = 'failed',
             payment_gateway_response = ?
         WHERE payment_reference = ?`,
        {
          replacements: [JSON.stringify(data), data.reference],
          type: db.sequelize.QueryTypes.UPDATE
        }
      );

      // Get investment for notifications
      const [investment] = await db.sequelize.query(
        `SELECT i.*, u.fullName as investor_name 
         FROM investments i 
         JOIN users u ON i.investor_id = u.id 
         WHERE i.payment_reference = ?`,
        {
          replacements: [data.reference],
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      if (investment) {
        // Notify investor of failed payment
        await db.sequelize.query(
          `INSERT INTO investment_notifications (
            investment_id, user_id, type, title, message
          ) VALUES (?, ?, 'payment_failed', ?, ?)`,
          {
            replacements: [
              investment.id,
              investment.investor_id,
              'Payment Failed',
              `Your payment of ₦${(data.amount / 100).toLocaleString()} could not be processed. Please try again.`
            ],
            type: db.sequelize.QueryTypes.INSERT
          }
        );
      }

      return { success: true, message: 'Failure recorded' };

    } catch (error) {
      console.error('❌ Error handling charge failure:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle successful transfer (for repayments)
   */
  async handleTransferSuccess(data) {
    try {
      console.log('💰 Processing successful transfer:', data.reference);

      // Update repayment status if this is a repayment transfer
      await db.sequelize.query(
        `UPDATE investor_repayments 
         SET payment_status = 'completed',
             processed_at = NOW(),
             payment_gateway_response = ?
         WHERE payment_reference = ?`,
        {
          replacements: [JSON.stringify(data), data.reference],
          type: db.sequelize.QueryTypes.UPDATE
        }
      );

      return { success: true, message: 'Transfer confirmed' };

    } catch (error) {
      console.error('❌ Error handling transfer success:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle failed transfer
   */
  async handleTransferFailed(data) {
    try {
      console.log('❌ Processing failed transfer:', data.reference);

      await db.sequelize.query(
        `UPDATE investor_repayments 
         SET payment_status = 'failed',
             payment_gateway_response = ?
         WHERE payment_reference = ?`,
        {
          replacements: [JSON.stringify(data), data.reference],
          type: db.sequelize.QueryTypes.UPDATE
        }
      );

      return { success: true, message: 'Failure recorded' };

    } catch (error) {
      console.error('❌ Error handling transfer failure:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Store payment initialization data
   */
  async storePaymentInitialization(reference, data) {
    try {
      await db.sequelize.query(
        `INSERT INTO payment_webhooks (
          payment_reference, gateway, event_type, payload
        ) VALUES (?, 'paystack', 'initialization', ?)`,
        {
          replacements: [reference, JSON.stringify(data)],
          type: db.sequelize.QueryTypes.INSERT
        }
      );
    } catch (error) {
      console.error('Error storing payment initialization:', error);
    }
  }

  /**
   * Store payment verification data
   */
  async storePaymentVerification(reference, data) {
    try {
      await db.sequelize.query(
        `INSERT INTO payment_webhooks (
          payment_reference, gateway, event_type, payload
        ) VALUES (?, 'paystack', 'verification', ?)`,
        {
          replacements: [reference, JSON.stringify(data)],
          type: db.sequelize.QueryTypes.INSERT
        }
      );
    } catch (error) {
      console.error('Error storing payment verification:', error);
    }
  }

  /**
   * Store webhook data for audit trail
   */
  async storeWebhook(event) {
    try {
      await db.sequelize.query(
        `INSERT INTO payment_webhooks (
          payment_reference, gateway, event_type, payload
        ) VALUES (?, 'paystack', ?, ?)`,
        {
          replacements: [
            event.data.reference || 'unknown',
            event.event,
            JSON.stringify(event)
          ],
          type: db.sequelize.QueryTypes.INSERT
        }
      );
    } catch (error) {
      console.error('Error storing webhook:', error);
    }
  }

  /**
   * Create payment success notifications
   */
  async createPaymentNotifications(investment, paymentData) {
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
            'Investment Confirmed!',
            `Your investment of ₦${(paymentData.amount / 100).toLocaleString()} in "${investment.campaign_title}" has been confirmed.`
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
            'New Investment Received!',
            `Someone invested ₦${(paymentData.amount / 100).toLocaleString()} in your campaign "${investment.campaign_title}"`
          ],
          type: db.sequelize.QueryTypes.INSERT
        }
      );

    } catch (error) {
      console.error('Error creating notifications:', error);
    }
  }

  /**
   * Initialize payment for repayments (transfers)
   * For when founders want to repay investors
   */
  async initializeRepaymentTransfer(repaymentData) {
    try {
      console.log('💰 Initializing repayment transfer');

      // This would be implemented when we add repayment transfers
      // For now, we'll handle repayments manually or through batch transfers
      
      return {
        success: true,
        message: 'Repayment transfer feature coming soon'
      };

    } catch (error) {
      console.error('❌ Repayment transfer error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get payment history from Paystack (for reconciliation)
   */
  async getPaymentHistory(options = {}) {
    try {
      const { page = 1, perPage = 50, from, to } = options;
      
      let url = `${this.baseURL}/transaction?page=${page}&perPage=${perPage}`;
      
      if (from) url += `&from=${from}`;
      if (to) url += `&to=${to}`;

      const response = await axios.get(url, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        data: response.data.data
      };

    } catch (error) {
      console.error('❌ Error getting payment history:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
module.exports = new PaystackService();