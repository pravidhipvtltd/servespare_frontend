import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import { handlePaymentCallback } from '../utils/paymentGateway';

interface PaymentCallbackHandlerProps {
  onSuccess: (paymentData: any) => void;
  onFailure: (error: string) => void;
  onBack: () => void;
}

export const PaymentCallbackHandler: React.FC<PaymentCallbackHandlerProps> = ({ 
  onSuccess, 
  onFailure, 
  onBack 
}) => {
  const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');
  const [message, setMessage] = useState('Verifying payment...');
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      // Get URL parameters
      const params = new URLSearchParams(window.location.search);
      
      // Determine gateway from URL or params
      let gateway: 'esewa' | 'fonepay' = 'esewa';
      
      if (params.has('refId')) {
        gateway = 'esewa';
      } else if (params.has('PRN')) {
        gateway = 'fonepay';
      }
      
      console.log('🔍 Verifying payment with gateway:', gateway);
      console.log('📋 Payment params:', Object.fromEntries(params.entries()));
      
      // Verify payment
      const result = await handlePaymentCallback(gateway, params);
      
      if (result.success) {
        setStatus('success');
        setMessage('Payment verified successfully! Your registration will be processed.');
        setPaymentData(result.data);
        
        // Save payment info to localStorage for registration completion
        localStorage.setItem('pending_payment_verification', JSON.stringify({
          ...result.data,
          gateway,
          timestamp: new Date().toISOString()
        }));
        
        // Notify parent component
        setTimeout(() => {
          onSuccess(result.data);
        }, 2000);
      } else {
        setStatus('failed');
        setMessage(result.message || 'Payment verification failed');
        setTimeout(() => {
          onFailure(result.message || 'Payment verification failed');
        }, 3000);
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      setStatus('failed');
      setMessage(error.message || 'An error occurred during payment verification');
      setTimeout(() => {
        onFailure(error.message || 'Payment verification failed');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center">
          {status === 'processing' && (
            <>
              <div className="flex justify-center mb-6">
                <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Payment</h2>
              <p className="text-gray-600">{message}</p>
              <div className="mt-6 flex justify-center">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex justify-center mb-6">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              
              {paymentData && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-semibold text-green-800 mb-2">Payment Details</h3>
                  <div className="space-y-2 text-sm text-green-700">
                    <div className="flex justify-between">
                      <span>Transaction ID:</span>
                      <span className="font-mono">{paymentData.transactionId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reference ID:</span>
                      <span className="font-mono">{paymentData.refId || paymentData.transactionCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-semibold">NPR {paymentData.amount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span>{new Date(paymentData.verifiedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <p className="text-sm text-gray-500">
                Redirecting you to complete your registration...
              </p>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="flex justify-center mb-6">
                <XCircle className="w-16 h-16 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-700">
                  Your payment could not be verified. Please try again or contact support if the amount was deducted from your account.
                </p>
              </div>
              
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors mx-auto"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Registration
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
