import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { OTPVerification } from './OTPVerification';

interface EmailOTPLoginProps {
  onBack: () => void;
  onSuccess: (email: string) => void;
}

export const EmailOTPLogin: React.FC<EmailOTPLoginProps> = ({ onBack, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOTP, setShowOTP] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9e3b22f5/send-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ email })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send OTP');
      }

      // Show success message with test mode notice if applicable
      const verifiedEmail = 'riden.prabidhitech@gmail.com';
      const isTestMode = email.toLowerCase() !== verifiedEmail.toLowerCase();
      
      if (result.emailSent) {
        if (isTestMode) {
          alert(
            `📧 TEST MODE - OTP Sent!\n\n` +
            `Testing email: ${email}\n` +
            `Sent to: ${verifiedEmail}\n\n` +
            `🔐 Your OTP Code: ${result.otp}\n\n` +
            `✅ The email will also contain this code.\n\n` +
            `ℹ️ To send emails to any address:\n` +
            `Verify a domain at resend.com/domains`
          );
        } else {
          alert(
            `✅ OTP Sent Successfully!\n\n` +
            `Check your email: ${email}\n\n` +
            `The code will expire in 10 minutes.`
          );
        }
      } else {
        // Email failed, show OTP directly
        alert(
          `⚠️ Email delivery unavailable\n\n` +
          `🔐 Your OTP Code: ${result.otp}\n\n` +
          `Use this code to verify your email.\n` +
          `Valid for 10 minutes.`
        );
      }

      setShowOTP(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerified = () => {
    // Check if user exists in database
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = users.find((u: any) => u.email === email);

    if (existingUser) {
      // User exists, log them in
      localStorage.setItem('currentUser', JSON.stringify(existingUser));
      console.log('✅ Existing user logged in via Email OTP:', existingUser.email);
      
      // Call the onSuccess callback to inform parent
      onSuccess(email);
      
      // Force a hard reload to ensure proper routing
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } else {
      // New user, create minimal account and trigger profile completion
      const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newUser = {
        id: newUserId,
        email: email,
        name: email.split('@')[0], // Temporary name from email
        role: 'admin' as const,
        isActive: true,
        profileComplete: false, // Flag for incomplete profile
        createdAt: new Date().toISOString(),
        language: 'en' as const,
        permissions: []
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      localStorage.setItem('needsProfileCompletion', 'true');
      
      console.log('✅ New user created via Email OTP:', newUser.email);
      
      // Call the onSuccess callback to inform parent
      onSuccess(email);
      
      // Force a hard reload to ensure proper routing
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };

  if (showOTP) {
    return (
      <OTPVerification
        email={email}
        onVerified={handleOTPVerified}
        onBack={() => setShowOTP(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8"
      >
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
            <Mail className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Continue with Email
          </h2>
          <p className="text-gray-600">
            We'll send you a one-time password to verify your email
          </p>
        </div>

        <form onSubmit={handleSendOTP} className="space-y-5">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
            >
              {error}
            </motion.div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="text-gray-400" size={20} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                placeholder="john@example.com"
                required
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            type="submit"
            disabled={isLoading}
            className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:shadow-lg transition-all ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Sending OTP...</span>
              </>
            ) : (
              <>
                <span>Send OTP</span>
                <ArrowRight size={20} />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            By continuing, you agree to our{' '}
            <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Privacy Policy
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};