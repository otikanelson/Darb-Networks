// src/services/investmentService.js
// Frontend service for investment API calls
import ApiService from './apiService';

const API_BASE = '/api/investments';

/**
 * Investment Service for Frontend
 * Handles all investment-related API calls
 */

class InvestmentService {
  
  // ================= CORE INVESTMENT OPERATIONS =================

  /**
   * Create a new investment
   * @param {Object} investmentData - { campaignId, amount, investorMessage }
   * @returns {Promise} Investment creation result with Paystack URL
   */
  static async createInvestment(investmentData) {
    try {
      console.log('🚀 Creating investment:', investmentData);
      
      const response = await ApiService.post(`${API_BASE}/create`, investmentData);
      
      console.log('✅ Investment created:', response);
      return response;
      
    } catch (error) {
      console.error('❌ Error creating investment:', error);
      throw error;
    }
  }

  /**
   * Verify payment status
   * @param {string} paymentReference - Payment reference from Paystack
   * @returns {Promise} Payment verification result
   */
  static async verifyPayment(paymentReference) {
    try {
      console.log('🔍 Verifying payment:', paymentReference);
      
      const response = await ApiService.get(`${API_BASE}/verify/${paymentReference}`);
      
      console.log('✅ Payment verified:', response);
      return response;
      
    } catch (error) {
      console.error('❌ Error verifying payment:', error);
      throw error;
    }
  }

  /**
   * Get payment status
   * @param {string} paymentReference - Payment reference
   * @returns {Promise} Current payment status
   */
  static async getPaymentStatus(paymentReference) {
    try {
      console.log('📊 Getting payment status:', paymentReference);
      
      const response = await ApiService.get(`${API_BASE}/status/${paymentReference}`);
      
      return response;
      
    } catch (error) {
      console.error('❌ Error getting payment status:', error);
      throw error;
    }
  }

  // ================= INVESTMENT HISTORY =================

  /**
   * Get user's investment history
   * @param {Object} options - { status, page, limit }
   * @returns {Promise} User's investments
   */
  static async getMyInvestments(options = {}) {
    try {
      console.log('📈 Getting my investments:', options);
      
      const params = new URLSearchParams();
      if (options.status) params.append('status', options.status);
      if (options.page) params.append('page', options.page);
      if (options.limit) params.append('limit', options.limit);
      
      const url = `${API_BASE}/my-investments${params.toString() ? '?' + params.toString() : ''}`;
      const response = await ApiService.get(url);
      
      return response;
      
    } catch (error) {
      console.error('❌ Error getting my investments:', error);
      throw error;
    }
  }

  /**
   * Get campaign investors (for founders)
   * @param {number} campaignId - Campaign ID
   * @returns {Promise} Campaign investors list
   */
  static async getCampaignInvestors(campaignId) {
    try {
      console.log('👥 Getting campaign investors:', campaignId);
      
      const response = await ApiService.get(`${API_BASE}/campaign/${campaignId}/investors`);
      
      return response;
      
    } catch (error) {
      console.error('❌ Error getting campaign investors:', error);
      throw error;
    }
  }

  /**
   * Get investment analytics for a campaign
   * @param {number} campaignId - Campaign ID
   * @returns {Promise} Investment analytics
   */
  static async getCampaignAnalytics(campaignId) {
    try {
      console.log('📊 Getting campaign analytics:', campaignId);
      
      const response = await ApiService.get(`${API_BASE}/campaign/${campaignId}/analytics`);
      
      return response;
      
    } catch (error) {
      console.error('❌ Error getting campaign analytics:', error);
      throw error;
    }
  }

  // ================= REPAYMENT OPERATIONS =================

  /**
   * Create repayment batch (for founders)
   * @param {number} campaignId - Campaign ID
   * @param {Object} repaymentData - { repaymentAmount, repaymentType, interestRate, founderMessage }
   * @returns {Promise} Repayment batch creation result
   */
  static async createRepaymentBatch(campaignId, repaymentData) {
    try {
      console.log('💰 Creating repayment batch:', { campaignId, repaymentData });
      
      const response = await ApiService.post(
        `${API_BASE}/campaign/${campaignId}/repayments`, 
        repaymentData
      );
      
      console.log('✅ Repayment batch created:', response);
      return response;
      
    } catch (error) {
      console.error('❌ Error creating repayment batch:', error);
      throw error;
    }
  }

  /**
   * Get repayment history for a campaign
   * @param {number} campaignId - Campaign ID
   * @returns {Promise} Repayment history
   */
  static async getRepaymentHistory(campaignId) {
    try {
      console.log('📜 Getting repayment history:', campaignId);
      
      const response = await ApiService.get(`${API_BASE}/campaign/${campaignId}/repayments`);
      
      return response;
      
    } catch (error) {
      console.error('❌ Error getting repayment history:', error);
      throw error;
    }
  }

  // ================= NOTIFICATIONS =================

  /**
   * Get investment notifications
   * @param {Object} options - { page, limit, unreadOnly }
   * @returns {Promise} Investment notifications
   */
  static async getNotifications(options = {}) {
    try {
      console.log('🔔 Getting investment notifications:', options);
      
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page);
      if (options.limit) params.append('limit', options.limit);
      if (options.unreadOnly) params.append('unreadOnly', options.unreadOnly);
      
      const url = `${API_BASE}/notifications${params.toString() ? '?' + params.toString() : ''}`;
      const response = await ApiService.get(url);
      
      return response;
      
    } catch (error) {
      console.error('❌ Error getting notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   * @param {number} notificationId - Notification ID
   * @returns {Promise} Update result
   */
  static async markNotificationAsRead(notificationId) {
    try {
      console.log('✅ Marking notification as read:', notificationId);
      
      const response = await ApiService.put(`${API_BASE}/notifications/${notificationId}/read`);
      
      return response;
      
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      throw error;
    }
  }

  // ================= TESTING/DEVELOPMENT =================

  /**
   * Simulate payment (development only)
   * @param {string} paymentReference - Payment reference
   * @returns {Promise} Simulation result
   */
  static async simulatePayment(paymentReference) {
    try {
      console.log('🧪 Simulating payment:', paymentReference);
      
      const response = await ApiService.post(`${API_BASE}/test/simulate-payment`, {
        paymentReference
      });
      
      console.log('✅ Payment simulated:', response);
      return response;
      
    } catch (error) {
      console.error('❌ Error simulating payment:', error);
      throw error;
    }
  }

  // ================= UTILITY FUNCTIONS =================

  /**
   * Format currency for display
   * @param {number} amount - Amount in Naira
   * @returns {string} Formatted currency string
   */
  static formatCurrency(amount) {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  }

  /**
   * Calculate investment percentage
   * @param {number} investmentAmount - Investment amount
   * @param {number} targetAmount - Campaign target amount
   * @returns {number} Percentage (0-100)
   */
  static calculateInvestmentPercentage(investmentAmount, targetAmount) {
    if (!targetAmount || targetAmount === 0) return 0;
    return ((investmentAmount / targetAmount) * 100);
  }

  /**
   * Validate investment amount
   * @param {number} amount - Investment amount
   * @param {number} minimumInvestment - Minimum required investment
   * @param {number} maximumInvestment - Maximum allowed investment (optional)
   * @returns {Object} { isValid, error }
   */
  static validateInvestmentAmount(amount, minimumInvestment, maximumInvestment = 10000000) {
    const numAmount = parseFloat(amount);
    
    if (!amount || isNaN(numAmount)) {
      return { isValid: false, error: 'Please enter a valid amount' };
    }
    
    if (numAmount < minimumInvestment) {
      return { 
        isValid: false, 
        error: `Minimum investment is ${this.formatCurrency(minimumInvestment)}` 
      };
    }
    
    if (numAmount > maximumInvestment) {
      return { 
        isValid: false, 
        error: `Maximum investment is ${this.formatCurrency(maximumInvestment)}` 
      };
    }
    
    return { isValid: true, error: null };
  }

  /**
   * Get investment status display info
   * @param {string} status - Payment status
   * @returns {Object} { label, color, icon }
   */
  static getInvestmentStatusInfo(status) {
    const statusMap = {
      'pending': { 
        label: 'Processing', 
        color: 'yellow', 
        icon: 'Clock',
        description: 'Payment is being processed'
      },
      'completed': { 
        label: 'Confirmed', 
        color: 'green', 
        icon: 'CheckCircle',
        description: 'Investment confirmed successfully'
      },
      'failed': { 
        label: 'Failed', 
        color: 'red', 
        icon: 'XCircle',
        description: 'Payment could not be processed'
      },
      'abandoned': { 
        label: 'Cancelled', 
        color: 'gray', 
        icon: 'XCircle',
        description: 'Payment was cancelled by user'
      }
    };
    
    return statusMap[status] || { 
      label: 'Unknown', 
      color: 'gray', 
      icon: 'AlertCircle',
      description: 'Status unknown'
    };
  }

  /**
   * Check if investment can be refunded
   * @param {Object} investment - Investment object
   * @returns {boolean} Whether investment can be refunded
   */
  static canRefundInvestment(investment) {
    // Add business logic for refund eligibility
    if (investment.payment_status !== 'completed') return false;
    
    // Check if within refund window (e.g., 24 hours)
    const investmentDate = new Date(investment.confirmed_at);
    const now = new Date();
    const hoursDiff = (now - investmentDate) / (1000 * 60 * 60);
    
    return hoursDiff <= 24; // 24-hour refund window
  }

  /**
   * Calculate potential returns
   * @param {number} investmentAmount - Investment amount
   * @param {number} expectedReturn - Expected return percentage
   * @returns {Object} { returnAmount, totalAmount }
   */
  static calculatePotentialReturns(investmentAmount, expectedReturn = 0) {
    const returnAmount = (investmentAmount * expectedReturn) / 100;
    const totalAmount = investmentAmount + returnAmount;
    
    return {
      returnAmount,
      totalAmount,
      formatted: {
        returnAmount: this.formatCurrency(returnAmount),
        totalAmount: this.formatCurrency(totalAmount)
      }
    };
  }

  // ================= ERROR HANDLING =================

  /**
   * Handle API errors with user-friendly messages
   * @param {Error} error - API error
   * @returns {string} User-friendly error message
   */
  static handleInvestmentError(error) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message;
      
      switch (status) {
        case 400:
          return message || 'Invalid investment data provided';
        case 401:
          return 'Please log in to make investments';
        case 403:
          return 'You are not authorized to perform this action';
        case 404:
          return 'Campaign not found or no longer available for investment';
        case 429:
          return 'Too many requests. Please wait and try again';
        case 500:
          return 'Server error. Please try again later';
        default:
          return message || 'An unexpected error occurred';
      }
    }
    
    if (error.code === 'NETWORK_ERROR') {
      return 'Network error. Please check your internet connection';
    }
    
    return error.message || 'An error occurred while processing your investment';
  }
}

export default InvestmentService;