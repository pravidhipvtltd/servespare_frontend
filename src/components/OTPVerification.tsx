import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, ArrowLeft, CheckCircle, X, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface OTPVerificationProps {
  email: string;
  phone: string;
  onVerified: () => void;
  onBack: () => void;
  apiErrors?: { email?: string; sms?: string };
  onOpenAPIConfig?: () => void;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({ 
  email, 
  phone, 
  onVerified, 
  onBack,
  apiErrors,
  onOpenAPIConfig
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setError('OTP has expired. Please request a new one.');
    }
  }, [timeLeft]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCooldown]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle OTP input change
  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(null);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits are entered
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      verifyOTP(newOtp.join(''));
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Only process if it's 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
      
      // Auto-verify
      verifyOTP(pastedData);
    }
  };

  // Verify OTP
  const verifyOTP = async (otpCode: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9e3b22f5/verify-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            email,
            phone,
            otp: otpCode
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Invalid OTP');
      }

      // Success!
      setSuccess(true);
      
      // Wait a bit to show success animation, then proceed
      setTimeout(() => {
        onVerified();
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP');
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (!canResend || resendCooldown > 0) return;

    setIsLoading(true);
    setError(null);
    setCanResend(false);
    setResendCooldown(60); // 60 second cooldown

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9e3b22f5/send-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ email, phone })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to resend OTP');
      }

      // Reset timer and OTP
      setTimeLeft(600);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();

    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
      setCanResend(true);
      setResendCooldown(0);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{ 
            backgroundImage: 'radial-gradient(circle, #6366f1 2px, transparent 2px)',
            backgroundSize: '30px 30px'
          }} />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="absolute -top-2 -left-2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>

          {/* Header */}
          <div className="text-center mb-8 mt-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              {success ? (
                <CheckCircle className="text-white" size={40} />
              ) : (
                <Mail className="text-white" size={40} />
              )}
            </motion.div>
            
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {success ? 'Verified!' : 'Verify Your Account'}
            </h2>
            
            {!success && (
              <p className="text-gray-600 text-sm">
                We've sent a 6-digit code to:
              </p>
            )}
          </div>

          {!success && (
            <>
              {/* Contact Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <Mail size={16} className="text-indigo-600" />
                  <span className="text-gray-700 font-medium">{email}</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <Phone size={16} className="text-indigo-600" />
                  <span className="text-gray-700 font-medium">{phone}</span>
                </div>
                
                {/* API Configuration Notice */}
                {(apiErrors?.email || apiErrors?.sms) && onOpenAPIConfig && (
                  <div className="pt-3 border-t border-gray-200 mt-3">
                    <button
                      onClick={onOpenAPIConfig}
                      className="w-full px-4 py-2 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-lg text-sm text-yellow-800 font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <span>⚠️ API Configuration</span>
                    </button>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      {apiErrors?.email && apiErrors?.sms 
                        ? 'Both email & SMS have issues'
                        : apiErrors?.email 
                          ? 'Email delivery has an issue'
                          : 'SMS delivery has an issue'
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4 flex items-start space-x-2"
                >
                  <X size={18} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* OTP Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                  Enter 6-Digit Code
                </label>
                <div 
                  className="flex justify-center space-x-2"
                  onPaste={handlePaste}
                >
                  {otp.map((digit, index) => (
                    <motion.input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      disabled={isLoading || success}
                      whileFocus={{ scale: 1.1 }}
                      className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl transition-all focus:outline-none ${
                        digit 
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-600' 
                          : 'border-gray-200 hover:border-gray-300'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                  ))}
                </div>
              </div>

              {/* Timer */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full">
                  <div className={`w-2 h-2 rounded-full ${
                    timeLeft < 60 ? 'bg-red-500 animate-pulse' : 'bg-green-500'
                  }`} />
                  <span className={`text-sm font-medium ${
                    timeLeft < 60 ? 'text-red-600' : 'text-gray-700'
                  }`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>

              {/* Resend Button */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Didn't receive the code?
                </p>
                <button
                  onClick={handleResend}
                  disabled={!canResend || resendCooldown > 0 || isLoading}
                  className={`inline-flex items-center space-x-2 px-6 py-2.5 rounded-full font-medium transition-all ${
                    canResend && resendCooldown === 0 && !isLoading
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                  <span>
                    {resendCooldown > 0 
                      ? `Resend in ${resendCooldown}s` 
                      : 'Resend OTP'
                    }
                  </span>
                </button>
              </div>

              {/* Loading Indicator */}
              {isLoading && (
                <div className="text-center mt-4">
                  <div className="inline-block w-6 h-6 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-600 mt-2">Verifying...</p>
                </div>
              )}
            </>
          )}

          {/* Success State */}
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
                className="text-6xl mb-4"
              >
                ✅
              </motion.div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">
                Verification Successful!
              </h3>
              <p className="text-gray-600">
                Completing your registration...
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};