import React, { useState, useEffect } from 'react';
import { 
  X, 
  DollarSign, 
  CreditCard, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Loader,
  Info,
  Heart,
  TrendingUp,
  Users,
  Target
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';


const InvestmentModal = ({ 
  isOpen, 
  onClose, 
  campaign,
  onInvestmentSuccess 
}) => {
  // Auth and state
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState('amount'); // 'amount', 'confirm', 'processing', 'success', 'error'
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [investmentData, setInvestmentData] = useState(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('amount');
      setAmount('');
      setMessage('');
      setError('');
      setInvestmentData(null);
    }
  }, [isOpen]);

  // Validate investment amount
  const validateAmount = () => {
    const numAmount = parseFloat(amount);
    
    if (!amount || isNaN(numAmount)) {
      setError('Please enter a valid amount');
      return false;
    }
    
    const minInvestment = campaign.minimum_investment || campaign.minimumInvestment || 0;
    
    if (numAmount < minInvestment) {
      setError(`Minimum investment is ₦${minInvestment.toLocaleString()}`);
      return false;
    }
    
    if (numAmount > 10000000) { // 10M max for safety
      setError('Maximum investment amount is ₦10,000,000');
      return false;
    }
    
    setError('');
    return true;
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  // Calculate investment percentage
  const calculateInvestmentPercentage = () => {
    const targetAmount = campaign.target_amount || campaign.targetAmount || 0;
    if (!amount || !targetAmount) return 0;
    return ((parseFloat(amount) / targetAmount) * 100).toFixed(2);
  };

  // Handle amount input
  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setAmount(value);
    setError('');
  };

  // Set predefined amounts
  const setPresetAmount = (presetAmount) => {
    setAmount(presetAmount.toString());
    setError('');
  };

  // Proceed to confirmation
  const proceedToConfirm = () => {
    if (!isAuthenticated()) {
      setError('Please log in to invest');
      return;
    }

    if (validateAmount()) {
      setStep('confirm');
    }
  };

  // Create investment and redirect to Paystack
  const createInvestment = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/investments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          campaignId: campaign.id,
          amount: parseFloat(amount),
          investorMessage: message
        })
      });

      const result = await response.json();

      if (result.success) {
        setInvestmentData(result.data);
        setStep('processing');
        
        // Redirect to Paystack
        if (result.data.payment?.authorization_url) {
          window.location.href = result.data.payment.authorization_url;
        } else {
          setError('Payment URL not received');
          setStep('error');
        }
      } else {
        setError(result.message || 'Failed to create investment');
        setStep('error');
      }

    } catch (error) {
      console.error('Investment creation error:', error);
      setError('Network error. Please check your connection and try again.');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  // Render different steps
  const renderContent = () => {
    switch (step) {
      case 'amount':
        return (
          <div className="p-6">
            {/* Campaign Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">{campaign.title}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Target:</span>
                  <span className="ml-2 font-medium">{formatCurrency(campaign.target_amount || campaign.targetAmount)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Minimum:</span>
                  <span className="ml-2 font-medium">{formatCurrency(campaign.minimum_investment || campaign.minimumInvestment)}</span>
                </div>
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Amount (NGN)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                  placeholder="Enter amount"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">NGN</span>
                </div>
              </div>
              
              {amount && (
                <div className="mt-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>You'll own {calculateInvestmentPercentage()}% of this campaign</span>
                    <span className="font-medium">{formatCurrency(amount)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Preset Amounts */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Quick Select
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  campaign.minimum_investment || campaign.minimumInvestment || 10000,
                  (campaign.minimum_investment || campaign.minimumInvestment || 10000) * 2,
                  (campaign.minimum_investment || campaign.minimumInvestment || 10000) * 5
                ].map((presetAmount, index) => (
                  <button
                    key={index}
                    onClick={() => setPresetAmount(presetAmount)}
                    className="p-3 border border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center"
                  >
                    <div className="font-medium text-gray-900">
                      {formatCurrency(presetAmount)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {(((presetAmount) / (campaign.target_amount || campaign.targetAmount || 1)) * 100).toFixed(1)}%
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Message */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message to Founder (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Share your thoughts or encouragement..."
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1">
                {message.length}/500 characters
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Investment Benefits */}
            <div className="mb-6 bg-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-800 mb-2 flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Why Invest?
              </h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li className="flex items-center">
                  <TrendingUp className="h-3 w-3 mr-2" />
                  Potential returns on successful projects
                </li>
                <li className="flex items-center">
                  <Heart className="h-3 w-3 mr-2" />
                  Support innovative entrepreneurs
                </li>
                <li className="flex items-center">
                  <Users className="h-3 w-3 mr-2" />
                  Join a community of investors
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={proceedToConfirm}
                disabled={!amount}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        );

      case 'confirm':
        return (
          <div className="p-6">
            {/* Investment Summary */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatCurrency(amount)}
                </div>
                <div className="text-gray-600">
                  Investment in "{campaign.title}"
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/50">
                <div className="text-center">
                  <div className="text-sm text-gray-600">Campaign Ownership</div>
                  <div className="font-semibold text-gray-900">
                    {calculateInvestmentPercentage()}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Target Amount</div>
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(campaign.target_amount || campaign.targetAmount)}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Payment Method</h3>
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Paystack Secure Payment</div>
                    <div className="text-sm text-gray-600">Card, Bank Transfer, USSD & More</div>
                  </div>
                  <Shield className="h-5 w-5 text-green-600 ml-auto" />
                </div>
              </div>
            </div>

            {/* Terms and Security */}
            <div className="mb-6 space-y-3">
              <div className="flex items-start text-sm text-gray-600">
                <Shield className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Your payment is secured by Paystack's industry-leading encryption</span>
              </div>
              <div className="flex items-start text-sm text-gray-600">
                <Info className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>You'll receive email confirmation and can track your investment progress</span>
              </div>
              <div className="flex items-start text-sm text-gray-600">
                <Target className="h-4 w-4 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Funds are released to founders only when campaign milestones are met</span>
              </div>
            </div>

            {/* Message Preview */}
            {message && (
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">Your Message:</div>
                <div className="text-sm text-gray-600 italic">"{message}"</div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setStep('amount')}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={createInvestment}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Proceed to Payment
                  </>
                )}
              </button>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="p-6 text-center">
            <div className="mb-6">
              <Loader className="h-16 w-16 animate-spin text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Investment</h2>
              <p className="text-gray-600">
                Redirecting you to secure payment...
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                If you're not redirected automatically, 
                <button 
                  onClick={() => window.location.href = investmentData?.payment?.authorization_url}
                  className="underline ml-1 hover:text-blue-900"
                >
                  click here
                </button>
              </p>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="p-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Investment Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your investment of {formatCurrency(amount)} has been confirmed.
            </p>
            
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800">
                You'll receive email confirmation and updates on campaign progress.
              </p>
            </div>

            <button
              onClick={() => {
                onClose();
                if (onInvestmentSuccess) onInvestmentSuccess();
              }}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Continue
            </button>
          </div>
        );

      case 'error':
        return (
          <div className="p-6 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Investment Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setStep('amount')}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal - Fixed height with proper scrolling */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto">
        {/* Fixed header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {step === 'amount' && 'Invest in this Campaign'}
            {step === 'confirm' && 'Confirm Investment'}
            {step === 'processing' && 'Processing Investment'}
            {step === 'success' && 'Investment Successful!'}
            {step === 'error' && 'Investment Failed'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="max-h-[80vh] overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default InvestmentModal;