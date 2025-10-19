// src/components/ui/InvestmentModal.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  DollarSign,
  CreditCard,
  Shield,
  AlertCircle,
  CheckCircle,
  Loader,
  Info
} from 'lucide-react';

const InvestmentModal = ({ 
  isOpen, 
  onClose, 
  campaign, 
  onInvestmentSuccess 
}) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [investorMessage, setInvestorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('input'); // 'input', 'confirm', 'processing', 'success'

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const validateAmount = () => {
    const numAmount = parseFloat(amount);
    const minInvestment = campaign?.minimum_investment || 0;
    
    if (!amount || isNaN(numAmount)) {
      return 'Please enter a valid amount';
    }
    
    if (numAmount < minInvestment) {
      return `Minimum investment is ${formatCurrency(minInvestment)}`;
    }
    
    if (numAmount > 10000000) {
      return 'Maximum investment is ₦10,000,000';
    }
    
    return null;
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setAmount(value);
      setError('');
    }
  };

  const handleNext = () => {
    const validationError = validateAmount();
    if (validationError) {
      setError(validationError);
      return;
    }
    setStep('confirm');
  };

  const handleInvest = async () => {
    try {
      setLoading(true);
      setError('');
      setStep('processing');

      const token = localStorage.getItem('authToken');
      
      const investmentData = {
        campaignId: campaign.id,
        amount: parseFloat(amount),
        investorMessage: investorMessage.trim() || null
      };

      console.log('🚀 Creating investment:', investmentData);

      const response = await fetch('http://localhost:5000/api/investments/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(investmentData)
      });

      const result = await response.json();
      console.log('💰 Investment creation response:', result);

      if (response.ok && result.success) {
        // Redirect to Paystack payment page
        if (result.data.payment?.authorization_url) {
          window.location.href = result.data.payment.authorization_url;
        } else {
          throw new Error('Payment URL not received');
        }
      } else {
        throw new Error(result.message || 'Failed to create investment');
      }

    } catch (error) {
      console.error('❌ Investment error:', error);
      setError(error.message);
      setStep('confirm');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setAmount('');
    setInvestorMessage('');
    setError('');
    setStep('input');
    setLoading(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen || !campaign) return null;

  const numAmount = parseFloat(amount) || 0;
  const platformFee = numAmount * 0.025; // 2.5% platform fee
  const paymentFee = numAmount * 0.015; // 1.5% payment processing fee
  const totalAmount = numAmount + platformFee + paymentFee;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {step === 'input' && 'Invest in Campaign'}
              {step === 'confirm' && 'Confirm Investment'}
              {step === 'processing' && 'Processing Investment'}
              {step === 'success' && 'Investment Successful'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Progress Indicator */}
          <div className="flex items-center mt-4 space-x-2">
            <div className={`h-2 flex-1 rounded-full ${
              ['input', 'confirm', 'processing', 'success'].includes(step) ? 'bg-green-500' : 'bg-gray-200'
            }`} />
            <div className={`h-2 flex-1 rounded-full ${
              ['confirm', 'processing', 'success'].includes(step) ? 'bg-green-500' : 'bg-gray-200'
            }`} />
            <div className={`h-2 flex-1 rounded-full ${
              ['processing', 'success'].includes(step) ? 'bg-green-500' : 'bg-gray-200'
            }`} />
            <div className={`h-2 flex-1 rounded-full ${
              step === 'success' ? 'bg-green-500' : 'bg-gray-200'
            }`} />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Campaign Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">{campaign.title}</h3>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Target: {formatCurrency(campaign.target_amount)}</span>
              <span>Raised: {formatCurrency(campaign.current_amount)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>Min Investment: {formatCurrency(campaign.minimum_investment)}</span>
              <span>Progress: {Math.round((campaign.current_amount / campaign.target_amount) * 100)}%</span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Step: Input */}
          {step === 'input' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Investment Amount (NGN) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={amount}
                    onChange={handleAmountChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter amount"
                  />
                </div>
                {amount && !isNaN(parseFloat(amount)) && (
                  <p className="mt-1 text-sm text-gray-600">
                    {formatCurrency(parseFloat(amount))}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message to Creator (Optional)
                </label>
                <textarea
                  value={investorMessage}
                  onChange={(e) => setInvestorMessage(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Share your thoughts or encouragement with the campaign creator..."
                />
              </div>

              <div className="bg-purple-100 border border-purple-400 rounded-lg p-4">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-purple-800">
                    <p className="font-medium mb-1">Investment Terms</p>
                    <ul className="space-y-1">
                      <li>• Your investment helps fund this campaign</li>
                      <li>• Returns depend on campaign success</li>
                      <li>• All payments are processed securely via Paystack</li>
                      <li>• You'll receive email updates on campaign progress</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={handleNext}
                disabled={!amount || validateAmount()}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {/* Step: Confirm */}
          {step === 'confirm' && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Investment Summary</h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Investment Amount</span>
                    <span className="font-medium">{formatCurrency(numAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform Fee (2.5%)</span>
                    <span className="font-medium">{formatCurrency(platformFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Processing (1.5%)</span>
                    <span className="font-medium">{formatCurrency(paymentFee)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total Amount</span>
                      <span>{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {investorMessage && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Your Message</h4>
                  <p className="text-sm text-gray-700">{investorMessage}</p>
                </div>
              )}

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-green-600 mr-2" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium">Secure Payment</p>
                    <p>Your payment will be processed securely by Paystack</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep('input')}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleInvest}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Proceed to Payment
                </button>
              </div>
            </div>
          )}

          {/* Step: Processing */}
          {step === 'processing' && (
            <div className="text-center py-8">
              <Loader className="h-12 w-12 text-green-600 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Processing Investment
              </h3>
              <p className="text-gray-600">
                Setting up your investment and redirecting to payment...
              </p>
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                  <p className="text-sm text-yellow-800">
                    Please do not close this window while we process your request.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Investment Successful!
              </h3>
              <p className="text-gray-600 mb-6">
                Your investment of {formatCurrency(numAmount)} has been processed successfully.
              </p>
              <button
                onClick={() => {
                  handleClose();
                  if (onInvestmentSuccess) onInvestmentSuccess();
                }}
                className="bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestmentModal;