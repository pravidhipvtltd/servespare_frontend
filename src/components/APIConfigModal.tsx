import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, MessageSquare, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

interface APIConfigModalProps {
  show: boolean;
  onClose: () => void;
  emailError?: string;
  smsError?: string;
}

export const APIConfigModal: React.FC<APIConfigModalProps> = ({ 
  show, 
  onClose,
  emailError,
  smsError 
}) => {
  const [activeTab, setActiveTab] = useState<'instructions' | 'test'>('instructions');

  if (!show) return null;

  const hasEmailError = !!emailError;
  const hasSMSError = !!smsError;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">API Configuration Status</h2>
                <p className="text-indigo-100">Review and fix API credential issues</p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Status Summary */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <StatusCard
                icon={<Mail size={24} />}
                title="Email (Resend)"
                status={hasEmailError ? 'error' : 'success'}
                message={hasEmailError ? 'Test Mode - Limited' : 'Working'}
              />
              <StatusCard
                icon={<MessageSquare size={24} />}
                title="SMS (Twilio)"
                status={hasSMSError ? 'error' : 'success'}
                message={hasSMSError ? 'Auth Failed' : 'Working'}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('instructions')}
                className={`flex-1 py-4 font-medium transition-colors ${
                  activeTab === 'instructions'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                📋 Fix Instructions
              </button>
              <button
                onClick={() => setActiveTab('test')}
                className={`flex-1 py-4 font-medium transition-colors ${
                  activeTab === 'test'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                🧪 Testing Mode
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {activeTab === 'instructions' ? (
              <InstructionsTab emailError={emailError} smsError={smsError} />
            ) : (
              <TestingTab />
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              💡 The system works with email-only. SMS is optional.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              Got it
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const StatusCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  status: 'success' | 'error';
  message: string;
}> = ({ icon, title, status, message }) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
    <div className="flex items-center space-x-3 mb-2">
      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1">
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-indigo-100">{message}</div>
      </div>
      {status === 'success' ? (
        <CheckCircle className="text-green-300" size={24} />
      ) : (
        <AlertCircle className="text-yellow-300" size={24} />
      )}
    </div>
  </div>
);

const InstructionsTab: React.FC<{ emailError?: string; smsError?: string }> = ({ 
  emailError, 
  smsError 
}) => (
  <div className="space-y-6">
    {/* Email Error */}
    {emailError && (
      <ErrorSection
        title="📧 Resend Email - Test Mode Restriction"
        error={emailError}
        color="blue"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Current Limitation:</h4>
            <p className="text-sm text-blue-800">
              In test mode, Resend only allows sending emails to your verified email address:
              <strong> riden.prabidhitech@gmail.com</strong>
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">✅ Solution Options:</h4>
            <div className="space-y-3">
              <SolutionCard
                number="1"
                title="Use Your Verified Email (Quick Testing)"
                description="Register using riden.prabidhitech@gmail.com to receive OTP immediately"
                badge="Instant"
              />
              <SolutionCard
                number="2"
                title="Verify Your Domain (Production Ready)"
                description="Add and verify your domain at resend.com/domains, then update the 'from' address"
                badge="Recommended"
                link="https://resend.com/domains"
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">📝 To Verify Domain:</h4>
            <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
              <li>Go to <a href="https://resend.com/domains" target="_blank" rel="noopener" className="text-indigo-600 hover:underline">resend.com/domains</a></li>
              <li>Click "Add Domain" and enter your domain (e.g., yourbusiness.com)</li>
              <li>Add the DNS records shown to your domain provider</li>
              <li>Wait for verification (usually 5-15 minutes)</li>
              <li>Contact support to update the 'from' address to: noreply@yourdomain.com</li>
            </ol>
          </div>
        </div>
      </ErrorSection>
    )}

    {/* SMS Error */}
    {smsError && (
      <ErrorSection
        title="📱 Twilio SMS - Authentication Error"
        error={smsError}
        color="purple"
      >
        <div className="space-y-4">
          <div className="bg-purple-50 border-l-4 border-purple-400 p-4">
            <h4 className="font-semibold text-purple-900 mb-2">Problem Detected:</h4>
            <p className="text-sm text-purple-800">
              Your Twilio Account SID or Auth Token is incorrect (Error 20003)
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">🔧 How to Fix:</h4>
            <div className="space-y-3">
              <div className="bg-white border-2 border-purple-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900 mb-1">Get Your Credentials</h5>
                    <p className="text-sm text-gray-600 mb-2">
                      Go to <a href="https://console.twilio.com" target="_blank" rel="noopener" className="text-indigo-600 hover:underline inline-flex items-center">
                        console.twilio.com <ExternalLink size={14} className="ml-1" />
                      </a>
                    </p>
                    <div className="bg-gray-50 rounded p-3 space-y-2 text-sm">
                      <div>
                        <strong>Account SID:</strong> Starts with <code className="bg-white px-2 py-1 rounded">AC...</code> (34 chars)
                      </div>
                      <div>
                        <strong>Auth Token:</strong> Click "View" to reveal (32 chars)
                      </div>
                      <div>
                        <strong>Phone Number:</strong> Format: <code className="bg-white px-2 py-1 rounded">+1234567890</code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-purple-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900 mb-1">Update Environment Variables</h5>
                    <p className="text-sm text-gray-600 mb-2">
                      Contact your system administrator or update these in Supabase Dashboard:
                    </p>
                    <div className="bg-gray-50 rounded p-3 space-y-1 text-sm font-mono">
                      <div>TWILIO_ACCOUNT_SID=AC...</div>
                      <div>TWILIO_AUTH_TOKEN=...</div>
                      <div>TWILIO_PHONE_NUMBER=+...</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-purple-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900 mb-1">Verify Phone Numbers (Trial Mode)</h5>
                    <p className="text-sm text-gray-600">
                      If using a trial account, verify recipient numbers at <a href="https://console.twilio.com/us1/develop/phone-numbers/manage/verified" target="_blank" rel="noopener" className="text-indigo-600 hover:underline">Twilio Console</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Important Notes:</h4>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>Use LIVE credentials, NOT test credentials</li>
              <li>Ensure no extra spaces before/after values</li>
              <li>Account SID must start with "AC"</li>
              <li>Phone number must include country code with +</li>
            </ul>
          </div>
        </div>
      </ErrorSection>
    )}

    {/* No Errors */}
    {!emailError && !smsError && (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-green-600" size={40} />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">All Systems Operational! 🎉</h3>
        <p className="text-gray-600">
          Both email and SMS delivery are working correctly.
        </p>
      </div>
    )}
  </div>
);

const TestingTab: React.FC = () => (
  <div className="space-y-6">
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">🧪 Testing Mode Active</h3>
      <p className="text-gray-700 mb-4">
        Your system is configured to work in testing mode when API credentials are not fully set up.
      </p>
      
      <div className="space-y-3">
        <TestFeature
          title="OTP Display in Browser"
          description="When email/SMS fails, OTP is shown in an alert for testing"
          status="active"
        />
        <TestFeature
          title="Console Logging"
          description="All OTP codes are logged to browser console"
          status="active"
        />
        <TestFeature
          title="Full Verification Flow"
          description="Complete registration and verification works even without APIs"
          status="active"
        />
        <TestFeature
          title="Graceful Degradation"
          description="System works with partial API setup (email-only or SMS-only)"
          status="active"
        />
      </div>
    </div>

    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="font-semibold text-blue-900 mb-2">📱 How to Test Registration:</h4>
      <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
        <li>Fill out the registration form with any valid data</li>
        <li>For email, use <strong>riden.prabidhitech@gmail.com</strong> (or any if domain verified)</li>
        <li>For phone, use any 10-digit Nepali number (e.g., 9812345678)</li>
        <li>Click "Create Account"</li>
        <li>Check the alert popup for the OTP code (if APIs failed)</li>
        <li>Or check your email/phone (if APIs working)</li>
        <li>Enter the OTP in the verification screen</li>
        <li>Complete registration successfully ✅</li>
      </ol>
    </div>

    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <h4 className="font-semibold text-green-900 mb-2">✅ Production Checklist:</h4>
      <div className="space-y-2 text-sm text-green-800">
        <CheckItem text="Configure Resend API key" />
        <CheckItem text="Verify domain at resend.com (for production emails)" />
        <CheckItem text="Configure Twilio credentials (optional - for SMS)" />
        <CheckItem text="Test with real email addresses" />
        <CheckItem text="Test phone number verification (if using SMS)" />
        <CheckItem text="Remove testing mode alerts before deployment" />
      </div>
    </div>
  </div>
);

const ErrorSection: React.FC<{
  title: string;
  error: string;
  color: 'blue' | 'purple';
  children: React.ReactNode;
}> = ({ title, error, color, children }) => (
  <div className={`border-2 ${color === 'blue' ? 'border-blue-200' : 'border-purple-200'} rounded-xl overflow-hidden`}>
    <div className={`${color === 'blue' ? 'bg-blue-100' : 'bg-purple-100'} p-4 border-b ${color === 'blue' ? 'border-blue-200' : 'border-purple-200'}`}>
      <h3 className="font-bold text-gray-900">{title}</h3>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

const SolutionCard: React.FC<{
  number: string;
  title: string;
  description: string;
  badge: string;
  link?: string;
}> = ({ number, title, description, badge, link }) => (
  <div className="bg-white border-2 border-blue-200 rounded-lg p-4 hover:border-blue-400 transition-colors">
    <div className="flex items-start space-x-3">
      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
        {number}
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <h5 className="font-semibold text-gray-900">{title}</h5>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            badge === 'Instant' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {badge}
          </span>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-indigo-600 hover:underline inline-flex items-center mt-1"
          >
            Open Link <ExternalLink size={12} className="ml-1" />
          </a>
        )}
      </div>
    </div>
  </div>
);

const TestFeature: React.FC<{
  title: string;
  description: string;
  status: 'active' | 'inactive';
}> = ({ title, description, status }) => (
  <div className="flex items-start space-x-3 bg-white rounded-lg p-4">
    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
      status === 'active' ? 'bg-green-500' : 'bg-gray-300'
    }`} />
    <div className="flex-1">
      <h5 className="font-semibold text-gray-900">{title}</h5>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
    }`}>
      {status === 'active' ? 'Active' : 'Inactive'}
    </span>
  </div>
);

const CheckItem: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-center space-x-2">
    <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
    <span>{text}</span>
  </div>
);
