import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, CheckCircle, XCircle, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getFromStorage, saveToStorage } from '../utils/mockData';

export const PaymentUpgrade: React.FC = () => {
  const { currentUser } = useAuth();
  const [upgradeIntent, setUpgradeIntent] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'esewa' | 'fonepay'>('esewa');
  const [processing, setProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load upgrade intent from session storage
    const intent = sessionStorage.getItem('upgrade_intent');
    if (intent) {
      setUpgradeIntent(JSON.parse(intent));
    } else {
      // Redirect back if no intent found
      window.location.href = '/';
    }
  }, []);

  const handlePayment = async () => {
    if (!upgradeIntent) return;

    setProcessing(true);
    setError('');

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In production, you would integrate with actual eSewa/FonePay API here
      const paymentSuccess = Math.random() > 0.1; // 90% success rate for demo

      if (paymentSuccess) {
        // Update package
        updatePackage(upgradeIntent.to);
        
        // Record transaction
        recordTransaction();

        // Clear upgrade intent
        sessionStorage.removeItem('upgrade_intent');

        setPaymentComplete(true);

        // Redirect after 3 seconds
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      } else {
        throw new Error('Payment failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Payment processing failed');
      setProcessing(false);
    }
  };

  const updatePackage = (newPackage: string) => {
    // Update user's package
    const users = getFromStorage('users', []);
    const updatedUsers = users.map((u: any) => {
      if (u.id === currentUser?.id) {
        return { ...u, package: newPackage };
      }
      return u;
    });
    saveToStorage('users', updatedUsers);

    // Update subscription
    const subscriptions = getFromStorage('subscriptions', []);
    const updatedSubscriptions = subscriptions.map((s: any) => {
      if (s.workspaceId === currentUser?.workspaceId) {
        return {
          ...s,
          package: newPackage,
          price: upgradeIntent.price,
          updatedAt: new Date().toISOString(),
          lastUpgradeDate: new Date().toISOString()
        };
      }
      return s;
    });
    saveToStorage('subscriptions', updatedSubscriptions);
  };

  const recordTransaction = () => {
    const transactions = getFromStorage('transactions', []);
    const newTransaction = {
      id: `txn_${Date.now()}`,
      type: 'subscription_upgrade',
      from: upgradeIntent.from,
      to: upgradeIntent.to,
      amount: upgradeIntent.price,
      paymentMethod,
      status: 'completed',
      workspaceId: currentUser?.workspaceId,
      userId: currentUser?.id,
      createdAt: new Date().toISOString()
    };
    transactions.push(newTransaction);
    saveToStorage('transactions', transactions);
  };

  const goBack = () => {
    sessionStorage.removeItem('upgrade_intent');
    window.location.href = '/';
  };

  if (!upgradeIntent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4 text-indigo-600" size={48} />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600" size={48} />
          </div>
          <h2 className="text-gray-900 mb-3">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your package has been upgraded successfully. Redirecting to dashboard...
          </p>
          <div className="flex justify-center">
            <Loader className="animate-spin text-indigo-600" size={32} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={goBack}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-gray-900">Complete Your Upgrade</h1>
          <p className="text-gray-600">Secure payment processing for your subscription upgrade</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
              <h3 className="text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Plan:</span>
                  <span className="font-medium text-gray-900 capitalize">{upgradeIntent.from}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">New Plan:</span>
                  <span className="font-medium text-indigo-600 capitalize">{upgradeIntent.to}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">Total Amount:</span>
                    <span className="font-bold text-xl text-indigo-600">
                      NPR {upgradeIntent.price.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">per month</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                <p className="font-medium mb-1">✓ Instant Activation</p>
                <p className="font-medium mb-1">✓ Secure Payment</p>
                <p className="font-medium">✓ 30-Day Money Back Guarantee</p>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-gray-900 mb-6">Payment Method</h3>

              {/* Payment Method Selection */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setPaymentMethod('esewa')}
                  className={`border-2 rounded-xl p-4 transition-all ${
                    paymentMethod === 'esewa'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">💰</div>
                    <div className="font-medium text-gray-900">eSewa</div>
                    <div className="text-xs text-gray-500">Digital Wallet</div>
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod('fonepay')}
                  className={`border-2 rounded-xl p-4 transition-all ${
                    paymentMethod === 'fonepay'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">📱</div>
                    <div className="font-medium text-gray-900">FonePay</div>
                    <div className="text-xs text-gray-500">Mobile Payment</div>
                  </div>
                </button>
              </div>

              {/* Payment Details */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h4 className="font-medium text-gray-900 mb-4">
                  {paymentMethod === 'esewa' ? 'eSewa' : 'FonePay'} Payment Details
                </h4>
                
                {paymentMethod === 'esewa' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        eSewa ID / Mobile Number
                      </label>
                      <input
                        type="text"
                        placeholder="98XXXXXXXX or eSewa ID"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transaction PIN
                      </label>
                      <input
                        type="password"
                        placeholder="Enter your eSewa PIN"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+977-XXXXXXXXXX"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        FonePay PIN
                      </label>
                      <input
                        type="password"
                        placeholder="Enter your FonePay PIN"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center text-red-800">
                    <XCircle size={20} className="mr-2" />
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}

              {/* Pay Button */}
              <button
                onClick={handlePayment}
                disabled={processing}
                className={`w-full py-4 rounded-xl text-white font-medium flex items-center justify-center ${
                  processing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                }`}
              >
                {processing ? (
                  <>
                    <Loader className="animate-spin mr-2" size={20} />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} className="mr-2" />
                    Pay NPR {upgradeIntent.price.toLocaleString()}
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By completing this payment, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>

            {/* Security Notice */}
            <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start">
                <CheckCircle className="text-green-600 mr-3 flex-shrink-0" size={20} />
                <div className="text-sm text-green-800">
                  <p className="font-medium mb-1">Secure & Encrypted Payment</p>
                  <p>Your payment information is encrypted and secure. We never store your payment credentials.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
