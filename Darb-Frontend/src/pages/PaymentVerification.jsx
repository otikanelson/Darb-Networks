
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Loader, 
  ArrowRight, 
  AlertCircle,
  RefreshCw,
  Home,
  Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

/**
 * PAYMENT VERIFICATION PAGE
 * Handles payment verification after Paystack redirect
 */

const PaymentVerification = () => {
  const { paymentReference } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'failed', 'error'
  const [investmentData, setInvestmentData] = useState(null);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    if (paymentReference) {
      verifyPayment();
    } else {
      setStatus('error');
      setError('No payment reference provided');
    }
  }, [paymentReference, isAuthenticated]);

  const verifyPayment = async () => {
    try {
      setStatus('verifying');
      setError('');

      console.log('🔍 Verifying payment:', paymentReference);

      const response = await fetch(`/api/investments/verify/${paymentReference}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setInvestmentData(result.data);
        console.log('✅ Payment verified successfully');
      } else {
        setStatus('failed');
        setError(result.message || 'Payment verification failed');
        console.log('❌ Payment verification failed:', result.message);
      }

    } catch (error) {
      console.error('❌ Verification error:', error);
      setStatus('error');
      setError('Network error occurred. Please check your connection.');
    }
  };

  const retryVerification = () => {
    if (retryCount < 3) {
      setRetryCount(retryCount + 1);
      setTimeout(() => verifyPayment(), 1000); // Wait 1 second before retry
    } else {
      setError('Maximum retry attempts reached. Please contact support.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="text-center py-16">
            <Loader className="h-16 w-16 animate-spin text-blue-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Verifying Your Payment
            </h1>
            <p className="text-gray-600 mb-4">
              Please wait while we confirm your payment with Paystack...
            </p>
            <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-blue-800">
                This usually takes a few seconds. Please don't close this page.
              </p>
            </div>
            
            {retryCount > 0 && (
              <div className="mt-4 text-sm text-gray-500">
                Verification attempt {retryCount + 1}/4
              </div>
            )}
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-16">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Payment Successful! 🎉
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Your investment has been confirmed
            </p>

            {/* Investment Details Card */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 max-w-lg mx-auto mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatCurrency(investmentData?.amount)}
                </div>
                <div className="text-gray-600 mb-4">
                  Investment Amount
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/50">
                  <div>
                    <div className="text-sm text-gray-600">Campaign</div>
                    <div className="font-medium text-gray-900 text-sm">
                      Campaign #{investmentData?.campaignId}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Status</div>
                    <div className="font-medium text-green-600 text-sm">
                      Confirmed
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-lg mx-auto mb-8">
              <div className="text-green-800">
                <h3 className="font-semibold mb-2">What happens next?</h3>
                <ul className="text-sm space-y-1 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    You'll receive email confirmation shortly
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    Track your investment in "My Investments"
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    Get updates on campaign progress
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    Potential returns when campaign succeeds
                  </li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <button
                onClick={retryVerification}
                disabled={retryCount >= 3}
                className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {retryCount >= 3 ? 'Max Retries Reached' : 'Retry Verification'}
              </button>
              
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Dashboard
              </button>
            </div>

            {/* Contact Support */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Still having issues?{' '}
                <a 
                  href="mailto:support@darbnetwork.com" 
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center py-16">
            <AlertCircle className="h-20 w-20 text-orange-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Verification Error
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              We encountered an error while verifying your payment
            </p>

            {/* Error Details */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 max-w-lg mx-auto mb-8">
              <div className="text-orange-800">
                <h3 className="font-semibold mb-2">Error Details</h3>
                <p className="text-sm mb-4">{error}</p>
                
                <div className="text-left">
                  <h4 className="font-medium mb-2">What you can do:</h4>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center">
                      <RefreshCw className="h-4 w-4 mr-2 flex-shrink-0" />
                      Check your internet connection and retry
                    </li>
                    <li className="flex items-center">
                      <Eye className="h-4 w-4 mr-2 flex-shrink-0" />
                      Check "My Investments" to see if payment went through
                    </li>
                    <li className="flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                      Contact support if the issue persists
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <button
                onClick={retryVerification}
                disabled={retryCount >= 3}
                className="flex items-center justify-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </button>
              
              <button
                onClick={() => navigate('/my-campaigns')}
                className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Eye className="h-4 w-4 mr-2" />
                Check My Investments
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-16">
            <Loader className="h-16 w-16 animate-spin text-gray-400 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900">Loading...</h1>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {renderContent()}
        
        {/* Payment Reference Info */}
        {paymentReference && (
          <div className="mt-12 text-center">
            <div className="bg-white rounded-lg p-4 max-w-md mx-auto border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Payment Reference</h3>
              <div className="font-mono text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded border">
                {paymentReference}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Save this reference for your records
              </p>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default PaymentVerification;