import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, Package, TrendingUp, ArrowRight, Mail, Lock, User, Phone, 
  Eye, EyeOff, Facebook, Chrome, Building, MapPin, Wrench, Star, Zap, Shield, FileText, Upload, X, Info
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { OTPVerification } from './OTPVerification';
import { APIConfigModal } from './APIConfigModal';

interface ModernAuthPageProps {
  initialMode?: 'login' | 'register';
  onBack: () => void;
}

export const ModernAuthPage: React.FC<ModernAuthPageProps> = ({ initialMode = 'login', onBack }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login } = useAuth();

  // Login State
  const [loginData, setLoginData] = useState({
    identifier: '',
    password: ''
  });

  // Register State
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    phone: '',
    businessName: '',
    location: '',
    panVatNumber: '',
    password: '',
    confirmPassword: ''
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState('');
  const [registrationPhone, setRegistrationPhone] = useState('');
  const [showAPIConfigModal, setShowAPIConfigModal] = useState(false);
  const [apiErrors, setApiErrors] = useState<{ email?: string; sms?: string }>({});

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
      if (allowedTypes.includes(file.type)) {
        setUploadedFile(file);
      } else {
        alert('Please upload a PNG, JPG, or PDF file');
      }
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await login(loginData.identifier, loginData.password);
      
      if (!result.success) {
        setError(result.message || 'Login failed');
      }
      // If successful, the AuthContext will automatically update and redirect
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Validate passwords match
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate phone number (should be 10 digits after +977)
    const phoneDigits = registerData.phone.replace(/\s/g, '');
    if (phoneDigits.length !== 10 || !/^\d{10}$/.test(phoneDigits)) {
      setError('Please enter a valid 10-digit Nepali phone number');
      setIsLoading(false);
      return;
    }

    try {
      const fullPhone = `+977${phoneDigits}`;
      
      // Send OTP to email and phone
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9e3b22f5/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          email: registerData.email,
          phone: fullPhone
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send OTP');
      }

      // Store registration data and show OTP verification
      setRegistrationEmail(registerData.email);
      setRegistrationPhone(fullPhone);
      setShowOtpVerification(true);

      // Store API errors for config modal
      const errors: { email?: string; sms?: string } = {};
      if (!result.emailSent && result.emailError) {
        errors.email = result.emailError;
      }
      if (!result.smsSent && result.smsError) {
        errors.sms = result.smsError;
      }
      setApiErrors(errors);

      // Show appropriate message based on delivery status
      if (result.otp) {
        // Both failed - show OTP in testing mode AND config modal
        console.log('🔐 TEST OTP:', result.otp);
        alert(`📱 TESTING MODE\n\n` +
              `Your OTP is: ${result.otp}\n\n` +
              `━━━━━━━━━━━━━━━━━━━━\n` +
              `${!result.emailSent ? '❌ Email: Failed to send\n' : '✅ Email: Sent successfully\n'}` +
              `${!result.smsSent ? '❌ SMS: Failed to send\n' : '✅ SMS: Sent successfully\n'}\n` +
              `${result.warning || ''}\n\n` +
              `Click "API Configuration" in the OTP screen to see detailed fix instructions.`
        );
      } else if (result.warning) {
        // One succeeded, one failed - show warning
        console.warn('⚠️ Partial delivery:', result.warning);
        // Don't show alert if only one method failed - they'll see it in the OTP screen
      }
      
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    console.log('Social login with:', provider);
    // Add social login logic here
  };

  // If OTP verification is active, show that instead
  if (showOtpVerification) {
    return (
      <OTPVerification
        email={registrationEmail}
        phone={registrationPhone}
        onVerified={() => {
          // After OTP is verified, complete registration
          // For now, just redirect to login
          alert('Registration successful! Please login with your credentials.');
          setShowOtpVerification(false);
          setMode('login');
        }}
        onBack={() => {
          setShowOtpVerification(false);
        }}
        apiErrors={apiErrors}
        onOpenAPIConfig={() => setShowAPIConfigModal(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      {/* API Config Modal */}
      <APIConfigModal
        show={showAPIConfigModal}
        onClose={() => setShowAPIConfigModal(false)}
        emailError={apiErrors.email}
        smsError={apiErrors.sms}
      />
      
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid md:grid-cols-2 min-h-[600px]">
          {/* Left Side - Animated Visual */}
          <LeftVisual mode={mode} />

          {/* Right Side - Form */}
          <div className="p-8 md:p-12 flex flex-col justify-center relative">
            {/* Back Button */}
            <button
              onClick={onBack}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>

            <AnimatePresence mode="wait">
              {mode === 'login' ? (
                <LoginForm
                  key="login"
                  loginData={loginData}
                  setLoginData={setLoginData}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  isLoading={isLoading}
                  error={error}
                  handleLogin={handleLogin}
                  handleSocialLogin={handleSocialLogin}
                  switchToRegister={() => setMode('register')}
                />
              ) : (
                <RegisterForm
                  key="register"
                  registerData={registerData}
                  setRegisterData={setRegisterData}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  showConfirmPassword={showConfirmPassword}
                  setShowConfirmPassword={setShowConfirmPassword}
                  uploadedFile={uploadedFile}
                  handleFileUpload={handleFileUpload}
                  removeFile={removeFile}
                  isLoading={isLoading}
                  error={error}
                  handleRegister={handleRegister}
                  handleSocialLogin={handleSocialLogin}
                  switchToLogin={() => setMode('login')}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

// Left Visual Component
const LeftVisual: React.FC<{ mode: 'login' | 'register' }> = ({ mode }) => {
  const floatingIcons = [
    { icon: <Settings size={40} />, delay: 0 },
    { icon: <Package size={35} />, delay: 0.2 },
    { icon: <Wrench size={38} />, delay: 0.4 },
    { icon: <Star size={32} />, delay: 0.6 },
    { icon: <Zap size={36} />, delay: 0.8 },
    { icon: <Shield size={34} />, delay: 1 },
    { icon: <TrendingUp size={35} />, delay: 1.2 },
  ];

  return (
    <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-12 flex flex-col justify-center overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{ 
          backgroundImage: 'radial-gradient(circle, white 2px, transparent 2px)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Floating Icons */}
      {floatingIcons.map((item, index) => (
        <motion.div
          key={index}
          className="absolute text-white opacity-20"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.2, 1],
            x: [0, Math.random() * 50 - 25, 0],
            y: [0, Math.random() * 50 - 25, 0],
          }}
          transition={{ 
            delay: item.delay,
            duration: 5,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          style={{
            left: `${Math.random() * 80 + 10}%`,
            top: `${Math.random() * 80 + 10}%`,
          }}
        >
          {item.icon}
        </motion.div>
      ))}

      {/* Main Content */}
      <div className="relative z-10 text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo */}
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-8"
          >
            <Settings size={48} className="text-white" />
          </motion.div>

          <h1 className="text-5xl font-bold mb-4">
            Serve Spares
          </h1>
          <p className="text-2xl mb-8 opacity-90">
            Inventory System
          </p>
          
          <div className="space-y-4 mb-8">
            <FeatureItem icon={<Package />} text="Complete Inventory Management" />
            <FeatureItem icon={<TrendingUp />} text="Real-time Analytics & Reports" />
            <FeatureItem icon={<Shield />} text="Secure Multi-Role Access" />
            <FeatureItem icon={<Zap />} text="8-Language Support" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard number="1000+" label="Users" />
            <StatCard number="99.9%" label="Uptime" />
            <StatCard number="24/7" label="Support" />
          </div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <motion.div
        className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
    </div>
  );
};

const FeatureItem: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <motion.div
    whileHover={{ x: 10 }}
    className="flex items-center space-x-3"
  >
    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
      {icon}
    </div>
    <span className="text-lg">{text}</span>
  </motion.div>
);

const StatCard: React.FC<{ number: string; label: string }> = ({ number, label }) => (
  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
    <div className="text-2xl font-bold">{number}</div>
    <div className="text-sm opacity-90">{label}</div>
  </div>
);

// Login Form Component
const LoginForm: React.FC<any> = ({ 
  loginData, setLoginData, showPassword, setShowPassword, 
  isLoading, error,
  handleLogin, handleSocialLogin, switchToRegister 
}) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
  >
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back!
          </h2>
          <p className="text-gray-600">Login to continue to your dashboard</p>
        </div>
        {/* Test Credentials Tooltip */}
        <div className="relative group">
          <button
            type="button"
            className="w-10 h-10 bg-indigo-100 hover:bg-indigo-200 rounded-full flex items-center justify-center transition-colors"
          >
            <Info size={20} className="text-indigo-600" />
          </button>
          <div className="absolute right-0 top-12 w-80 bg-gray-900 text-white text-xs rounded-xl p-4 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="font-semibold mb-3 text-sm text-indigo-300">🔑 Test Credentials:</div>
            <div className="space-y-2">
              <div className="bg-gray-800 p-2 rounded">
                <div className="text-indigo-400 font-medium">Super Admin:</div>
                <div>superadmin@autoparts.com / super123</div>
              </div>
              <div className="bg-gray-800 p-2 rounded">
                <div className="text-purple-400 font-medium">Chief Admin:</div>
                <div>admin.chief@servespares.com / ChiefAdmin@2024</div>
              </div>
              <div className="bg-gray-800 p-2 rounded">
                <div className="text-blue-400 font-medium">Admin:</div>
                <div>admin@autoparts.com / admin123</div>
              </div>
              <div className="bg-gray-800 p-2 rounded">
                <div className="text-green-400 font-medium">Inventory Manager:</div>
                <div>manager@autoparts.com / manager123</div>
              </div>
              <div className="bg-gray-800 p-2 rounded">
                <div className="text-yellow-400 font-medium">Cashier:</div>
                <div>cashier@autoparts.com / cashier123</div>
              </div>
              <div className="bg-gray-800 p-2 rounded">
                <div className="text-pink-400 font-medium">Finance:</div>
                <div>finance@autoparts.com / finance123</div>
              </div>
            </div>
            <div className="mt-2 text-gray-400 text-center">Hover to view credentials</div>
          </div>
        </div>
      </div>
    </div>

    <form onSubmit={handleLogin} className="space-y-5">
      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* Email/Phone/Username */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email, Phone or Username
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail className="text-gray-400" size={20} />
          </div>
          <input
            type="text"
            value={loginData.identifier}
            onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
            placeholder="Enter your email, phone or username"
            required
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className="text-gray-400" size={20} />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            value={loginData.password}
            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
            placeholder="Enter your password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {/* Forgot Password */}
      <div className="text-right">
        <button type="button" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
          Forgot Password?
        </button>
      </div>

      {/* Login Button */}
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
            <span>Logging in...</span>
          </>
        ) : (
          <>
            <span>Log In</span>
            <ArrowRight size={20} />
          </>
        )}
      </motion.button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">OR</span>
        </div>
      </div>

      {/* Social Login */}
      <div className="space-y-3">
        <SocialButton 
          icon={<Mail size={20} />} 
          text="Continue with Email" 
          onClick={() => handleSocialLogin('email')}
          color="bg-gray-600"
        />
        <SocialButton 
          icon={<Facebook size={20} />} 
          text="Continue with Facebook" 
          onClick={() => handleSocialLogin('facebook')}
          color="bg-blue-600"
        />
        <SocialButton 
          icon={<Chrome size={20} />} 
          text="Continue with Google" 
          onClick={() => handleSocialLogin('google')}
          color="bg-red-600"
        />
      </div>

      {/* Sign Up Link */}
      <div className="text-center pt-4">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={switchToRegister}
            className="text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            Sign Up
          </button>
        </p>
      </div>
    </form>
  </motion.div>
);

// Register Form Component
const RegisterForm: React.FC<any> = ({ 
  registerData, setRegisterData, showPassword, setShowPassword,
  showConfirmPassword, setShowConfirmPassword,
  uploadedFile, handleFileUpload, removeFile,
  isLoading, error,
  handleRegister, handleSocialLogin, switchToLogin 
}) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
  >
    <div className="mb-6">
      <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        Create Account
      </h2>
      <p className="text-gray-600">Join thousands of businesses using Serve Spares</p>
    </div>

    <form onSubmit={handleRegister} className="space-y-4">
      {/* Error Message */}
      {registerData && error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start space-x-2"
        >
          <X size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="text-gray-400" size={18} />
          </div>
          <input
            type="text"
            value={registerData.fullName}
            onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
            className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-sm"
            placeholder="John Doe"
            required
          />
        </div>
      </div>

      {/* Email & Phone */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="text-gray-400" size={18} />
            </div>
            <input
              type="email"
              value={registerData.email}
              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-sm"
              placeholder="john@example.com"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <div className="relative flex">
            {/* Locked +977 Prefix */}
            <div className="absolute inset-y-0 left-0 pl-3 pr-2 flex items-center pointer-events-none bg-gray-100 border-2 border-r-0 border-gray-200 rounded-l-xl z-10">
              <Phone className="text-gray-400 mr-1" size={18} />
              <span className="text-gray-700 font-medium">+977</span>
            </div>
            <input
              type="tel"
              value={registerData.phone}
              onChange={(e) => {
                // Only allow numbers
                const value = e.target.value.replace(/\D/g, '');
                // Limit to 10 digits
                if (value.length <= 10) {
                  setRegisterData({ ...registerData, phone: value });
                }
              }}
              className="w-full pl-24 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-sm"
              placeholder="9812345678"
              maxLength={10}
              pattern="[0-9]{10}"
              required
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">10-digit Nepali mobile number</p>
        </div>
      </div>

      {/* Business Name & Location */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building className="text-gray-400" size={18} />
            </div>
            <input
              type="text"
              value={registerData.businessName}
              onChange={(e) => setRegisterData({ ...registerData, businessName: e.target.value })}
              className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-sm"
              placeholder="Your Auto Parts Shop"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="text-gray-400" size={18} />
            </div>
            <input
              type="text"
              value={registerData.location}
              onChange={(e) => setRegisterData({ ...registerData, location: e.target.value })}
              className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-sm"
              placeholder="Kathmandu, Nepal"
              required
            />
          </div>
        </div>
      </div>

      {/* PAN/VAT Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          PAN/VAT Number
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FileText className="text-gray-400" size={18} />
          </div>
          <input
            type="text"
            value={registerData.panVatNumber}
            onChange={(e) => setRegisterData({ ...registerData, panVatNumber: e.target.value })}
            className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-sm"
            placeholder="123456789"
            required
          />
        </div>
      </div>

      {/* Document Upload for Verification */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Business Verification Document <span className="text-gray-500">(PNG, JPG, PDF)</span>
        </label>
        <div className="relative">
          <input
            type="file"
            onChange={handleFileUpload}
            accept=".png,.jpg,.jpeg,.pdf"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            required
          />
          <div
            className={`w-full py-3 px-4 border-2 ${
              uploadedFile ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-indigo-500'
            } rounded-xl flex items-center justify-between transition-all cursor-pointer`}
          >
            <div className="flex items-center space-x-3">
              <Upload size={20} className={uploadedFile ? 'text-green-600' : 'text-gray-400'} />
              <span className={`text-sm ${uploadedFile ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                {uploadedFile ? uploadedFile.name : 'Click to upload document'}
              </span>
            </div>
            {uploadedFile && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">Upload your business registration or PAN/VAT certificate</p>
      </div>

      {/* Password & Confirm Password */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="text-gray-400" size={18} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-sm"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="text-gray-400" size={18} />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={registerData.confirmPassword}
              onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
              className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-sm"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Register Button */}
      <motion.button
        whileHover={{ scale: isLoading ? 1 : 1.02 }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
        type="submit"
        disabled={isLoading}
        className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:shadow-lg transition-all mt-4 ${
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
            <span>Create Account</span>
            <ArrowRight size={20} />
          </>
        )}
      </motion.button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">OR</span>
        </div>
      </div>

      {/* Social Signup */}
      <div className="space-y-2">
        <SocialButton 
          icon={<Chrome size={18} />} 
          text="Sign up with Google" 
          onClick={() => handleSocialLogin('google')}
          color="bg-red-600"
          compact
        />
        <SocialButton 
          icon={<Facebook size={18} />} 
          text="Sign up with Facebook" 
          onClick={() => handleSocialLogin('facebook')}
          color="bg-blue-600"
          compact
        />
      </div>

      {/* Login Link */}
      <div className="text-center pt-2">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={switchToLogin}
            className="text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            Log In
          </button>
        </p>
      </div>
    </form>
  </motion.div>
);

// Social Button Component
const SocialButton: React.FC<{ 
  icon: React.ReactNode; 
  text: string; 
  onClick: () => void;
  color: string;
  compact?: boolean;
}> = ({ icon, text, onClick, color, compact = false }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    type="button"
    onClick={onClick}
    className={`w-full ${color} text-white ${compact ? 'py-2.5' : 'py-3'} rounded-xl font-medium flex items-center justify-center space-x-2 hover:shadow-lg transition-all`}
  >
    {icon}
    <span className={compact ? 'text-sm' : ''}>{text}</span>
  </motion.button>
);