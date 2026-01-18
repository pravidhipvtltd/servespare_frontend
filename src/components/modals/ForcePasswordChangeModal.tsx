import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Shield, Mail } from 'lucide-react';
import { validatePasswordStrength, hashPassword } from '../../utils/passwordUtils';

interface ForcePasswordChangeModalProps {
  adminAccount: any;
  onClose: () => void;
}

export const ForcePasswordChangeModal: React.FC<ForcePasswordChangeModalProps> = ({
  adminAccount,
  onClose
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [emailSentTo, setEmailSentTo] = useState('');
  const [emailStatus, setEmailStatus] = useState<'sending' | 'sent' | 'failed' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMessage('');
    setEmailStatus(null);

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setErrors(['Passwords do not match']);
      return;
    }

    // Validate password strength
    const validation = validatePasswordStrength(newPassword);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Hash the new password
      const hashedPassword = hashPassword(newPassword);
      
      // Update admin account with new password and mark first login as complete
      const adminAccounts = JSON.parse(localStorage.getItem('admin_accounts') || '[]');
      const updatedAdmins = adminAccounts.map((admin: any) => {
        if (admin.id === adminAccount.id) {
          return {
            ...admin,
            password: hashedPassword,
            isFirstLogin: false
          };
        }
        return admin;
      });
      
      localStorage.setItem('admin_accounts', JSON.stringify(updatedAdmins));
      
      // ALSO update the users array to ensure login works with new password
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map((user: any) => {
        if (user.id === adminAccount.id || user.email === adminAccount.email) {
          return {
            ...user,
            password: hashedPassword
          };
        }
        return user;
      });
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      // Clear the password change flags
      localStorage.removeItem('requirePasswordChange');
      localStorage.removeItem('passwordChangeAdminId');
      localStorage.removeItem('must_change_password'); // NEW: Clear backend flag
      
      setSuccessMessage('✅ Password changed successfully!');
      
      console.log('⏳ Waiting 2 seconds before redirect...');
      
      // Wait 5 seconds then close modal and redirect to login page to re-login
      setTimeout(() => {
        console.log('🚪 Redirecting to login page...');
        console.log('🔐 Clearing all session data...');
        
        // Clear ALL session and login related data
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('requirePasswordChange');
        localStorage.removeItem('passwordChangeAdminId');
        localStorage.removeItem('needsProfileCompletion');
        
        console.log('✅ Session cleared completely');
        console.log('🔄 Performing full page reload to login page...');
        
        onClose();
        
        // Force a complete page reload to login page
        window.location.replace('/');
      }, 2000); // Wait 2 seconds before redirect
      
    } catch (error) {
      console.error('Error changing password:', error);
      setErrors(['Failed to change password. Please try again.']);
      setIsSubmitting(false);
    }
  };

  const passwordValidation = validatePasswordStrength(newPassword);
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-3 rounded-lg">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Password Change Required</h2>
              <p className="text-orange-100 text-sm">First-time login security setup</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Welcome Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-blue-900 font-semibold mb-1">Welcome, {adminAccount?.name}!</p>
            <p className="text-sm text-blue-700">
              For security purposes, you must create a new password before accessing your account.
            </p>
          </div>

          {/* Account Info */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">Logged in as</p>
            <p className="font-semibold text-gray-900">{adminAccount?.email}</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-900">{successMessage}</p>
                    <p className="text-xs text-green-700 mt-1">
                      Redirecting to login page in 5 seconds... Please log in with your new password.
                    </p>
                  </div>
                </div>
              </div>

              {/* Email Status */}
              {emailStatus === 'sending' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-blue-600 animate-pulse" />
                    <p className="text-xs text-blue-700">Sending confirmation email...</p>
                  </div>
                </div>
              )}

              {emailStatus === 'sent' && emailSentTo && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-green-600" />
                    <div className="flex-1">
                      <p className="text-xs text-green-700">
                        📧 <strong>Confirmation email sent to:</strong> {emailSentTo}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {emailStatus === 'failed' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <p className="text-xs text-yellow-700">
                      Password changed but email notification failed. Please check your email settings.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={isSubmitting}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm New Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isSubmitting}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword && (
                <div className="mt-2 flex items-center space-x-2">
                  {passwordsMatch ? (
                    <div className="flex items-center text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span>Passwords match</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      <span>Passwords do not match</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-900 mb-3">Password Requirements:</p>
              <div className="space-y-2 text-sm">
                <PasswordRequirement
                  met={newPassword.length >= 8}
                  text="At least 8 characters long"
                />
                <PasswordRequirement
                  met={/[A-Z]/.test(newPassword)}
                  text="At least one uppercase letter"
                />
                <PasswordRequirement
                  met={/[a-z]/.test(newPassword)}
                  text="At least one lowercase letter"
                />
                <PasswordRequirement
                  met={/[0-9]/.test(newPassword)}
                  text="At least one number"
                />
                <PasswordRequirement
                  met={/[@#$%&*!]/.test(newPassword)}
                  text="At least one special character (@#$%&*!)"
                />
              </div>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-900 mb-1">Please fix the following:</p>
                    <ul className="text-sm text-red-700 space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !passwordValidation.isValid || !passwordsMatch}
              className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${
                isSubmitting || !passwordValidation.isValid || !passwordsMatch
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-lg'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Set New Password & Continue</span>
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs text-amber-800">
              🔒 <strong>Security Tip:</strong> Choose a strong, unique password that you do not use for other accounts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Password Requirement Component
const PasswordRequirement: React.FC<{ met: boolean; text: string }> = ({ met, text }) => (
  <div className="flex items-center space-x-2">
    {met ? (
      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
    ) : (
      <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
    )}
    <span className={met ? 'text-green-700' : 'text-gray-600'}>{text}</span>
  </div>
);