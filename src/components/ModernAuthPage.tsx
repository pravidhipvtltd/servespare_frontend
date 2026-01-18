import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Settings,
  Package,
  TrendingUp,
  ArrowRight,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Building,
  MapPin,
  Wrench,
  Star,
  Zap,
  Shield,
  Globe,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getFromStorage, saveToStorage } from "../utils/mockData";
import {
  authTranslations,
  languageNames,
  languageFlags,
  AuthLanguage,
} from "../contexts/AuthLanguageTranslations";
import { BusinessRegistrationForm } from "./BusinessRegistrationForm";

interface ModernAuthPageProps {
  initialMode?: "login" | "register";
  onBack: () => void;
}

export const ModernAuthPage: React.FC<ModernAuthPageProps> = ({
  initialMode = "login",
  onBack,
}) => {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<AuthLanguage>("en");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordStep, setForgotPasswordStep] = useState<
    "email" | "code" | "newPassword"
  >("email");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [isFirstTimeLogin, setIsFirstTimeLogin] = useState(false);

  const { login } = useAuth();

  // Translation helper
  const t = (key: string) => authTranslations[language][key] || key;

  // Login State
  const [loginData, setLoginData] = useState({
    identifier: "",
    password: "",
  });

  // Forgot Password Handlers
  const handleSendResetCode = async () => {
    setError(null);
    setIsLoading(true);

    const API_URL = `${import.meta.env.VITE_API_BASE_URL}/otp/request/`;

    try {
      console.log("📧 [OTP] Requesting OTP for:", forgotPasswordEmail);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          identifier: forgotPasswordEmail,
        }),
      });

      console.log("📡 [OTP] Response status:", response.status);

      let result;
      try {
        const text = await response.text();
        console.log("📡 [OTP] Response text:", text);
        result = text ? JSON.parse(text) : {};
      } catch (jsonError) {
        console.error("❌ [OTP] Failed to parse JSON:", jsonError);
        setError(" Please try again.");
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        setError(
          result.message ||
            result.detail ||
            result.error ||
            "Failed to send OTP. Please check your email and try again."
        );
        setIsLoading(false);
        return;
      }

      console.log("✅ [OTP] OTP sent successfully");
      setForgotPasswordStep("code");
      setError(null);
    } catch (err: any) {
      console.error("❌ [OTP] Network error:", err);
      setError(
        "Cannot connect to server. Please check your internet connection."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError(null);
    setIsLoading(true);

    const API_URL = `${import.meta.env.VITE_API_BASE_URL}/otp/verify/`;

    try {
      console.log("🔐 [OTP] Verifying OTP:", resetCode);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          identifier: forgotPasswordEmail,
          otp: resetCode,
        }),
      });

      console.log("📡 [OTP Verify] Response status:", response.status);

      let result;
      try {
        const text = await response.text();
        console.log("📡 [OTP Verify] Response text:", text);
        result = text ? JSON.parse(text) : {};
      } catch (jsonError) {
        console.error("❌ [OTP Verify] Failed to parse JSON:", jsonError);
        setError("Server error. Please try again.");
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        setError(
          result.message ||
            result.detail ||
            result.error ||
            "Invalid or expired OTP. Please try again."
        );
        setIsLoading(false);
        return;
      }

      console.log("✅ [OTP] OTP verified successfully");

      // Extract token
      const token =
        result.token || result.access_token || result.access || result.key;
      if (token) {
        console.log("✅ [Verify OTP] Token found:", token);
        setResetToken(token);
        setForgotPasswordStep("newPassword");
        setError(null);
      } else {
        console.error("❌ [Verify OTP] No token found in response:", result);
        setError(
          "Verification successful but no token received. Please contact support."
        );
      }
    } catch (err: any) {
      console.error("❌ [OTP Verify] Network error:", err);
      setError(
        "Cannot connect to server. Please check your internet connection."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    const API_URL = `${
      import.meta.env.VITE_API_BASE_URL
    }/users/first_time_password_change/`;

    try {
      console.log("🔐 [Reset Password] Attempting password reset...");

      if (!resetToken) {
        setError("Missing reset token. Please try verifying OTP again.");
        setIsLoading(false);
        return;
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resetToken}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          new_password: newPassword,
          new_password_confirm: confirmPassword,
        }),
      });

      console.log("📡 [Reset Password] Response status:", response.status);

      let result;
      try {
        const text = await response.text();
        console.log("📡 [Reset Password] Response text:", text);
        result = text ? JSON.parse(text) : {};
      } catch (jsonError) {
        console.error("❌ [Reset Password] Failed to parse JSON:", jsonError);
        setError("Please try again.");
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        setError(
          result.message ||
            result.detail ||
            result.error ||
            "Failed to reset password. Please try again."
        );
        setIsLoading(false);
        return;
      }

      // Success
      setResetSuccess(true);
      console.log("✅ [Reset Password] Password reset successful");

      setTimeout(() => {
        setShowForgotPassword(false);
        setResetSuccess(false);
        setForgotPasswordStep("email");
        setForgotPasswordEmail("");
        setResetCode("");
        setNewPassword("");
        setConfirmPassword("");
        setResetToken("");
      }, 2000);
    } catch (err: any) {
      console.error("❌ [Reset Password] Network error:", err);
      setError(
        "Cannot connect to server. Please check your internet connection."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPassword(false);
    setForgotPasswordStep("email");
    setForgotPasswordEmail("");
    setResetCode("");
    setNewPassword("");
    setConfirmPassword("");
    setResetToken("");
    setError(null);
    setResetSuccess(false);
    setIsFirstTimeLogin(false);
  };

  // If register mode, show BusinessRegistrationForm
  if (mode === "register") {
    return (
      <BusinessRegistrationForm
        onBack={onBack}
        onSuccess={() => {
          setMode("login");
        }}
      />
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Use proxy in development to avoid CORS issues
    const API_URL = import.meta.env.DEV
      ? "/api/auth/login/"
      : `${import.meta.env.VITE_API_BASE_URL}/auth/login/`;

    try {
      console.log("🔐 [Login] Calling backend API:", API_URL);
      console.log("🔐 [Login] Username:", loginData.identifier);

      // Call backend API directly
      const response = await fetch(`${API_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true", // Bypass ngrok browser warning
        },
        body: JSON.stringify({
          username: loginData.identifier,
          password: loginData.password,
        }),
      });

      console.log("📡 [Login] Response status:", response.status);
      console.log("📡 [Login] Response ok:", response.ok);

      // Handle non-JSON responses
      let result;
      try {
        const text = await response.text();
        console.log("📡 [Login] Response text:", text);
        result = text ? JSON.parse(text) : {};
      } catch (jsonError) {
        console.error("❌ [Login] Failed to parse JSON:", jsonError);
        setError(`Unable to login, Please try again,`);
        return;
      }

      if (!response.ok) {
        if (response.status === 400 || response.status === 401) {
          setError(
            result.message ||
              result.detail ||
              "Username or password do not match."
          );
        } else if (response.status === 403) {
          setError(
            result.message ||
              result.detail ||
              "Access forbidden. Please check your Django CORS settings or contact administrator."
          );
          console.error(
            "❌ [Login] 403 Forbidden - Check Django CORS configuration"
          );
        } else {
          setError(
            result.message ||
              result.detail ||
              `Login failed (${response.status}). Please try again.`
          );
        }
        return;
      }

      // Check if user must change password (first time login)
      if (result.user?.must_change_password === true) {
        console.log(
          "🔒 [Login] First time login detected - user must change password"
        );
        setIsFirstTimeLogin(true);

        // Store user email for OTP flow
        const userEmail = result.user.email;
        if (userEmail) {
          setForgotPasswordEmail(userEmail);

          // Automatically request OTP for password change
          try {
            const otpResponse = await fetch(
              `${import.meta.env.VITE_API_BASE_URL}/otp/request/`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "ngrok-skip-browser-warning": "true",
                },
                body: JSON.stringify({
                  identifier: userEmail,
                }),
              }
            );

            if (otpResponse.ok) {
              console.log("✅ [Login] OTP sent for password change");
              setForgotPasswordStep("code");
              setShowForgotPassword(true);
            } else {
              // If OTP request fails, show email step
              setForgotPasswordStep("email");
              setShowForgotPassword(true);
              setError("Please verify your email to change your password.");
            }
          } catch (otpErr) {
            console.error("❌ [Login] Failed to request OTP:", otpErr);
            setForgotPasswordStep("email");
            setShowForgotPassword(true);
          }
        } else {
          setError(
            "First time login detected. Please use Forgot Password to set your new password."
          );
        }
        return;
      }

      if (result.must_reset) {
        console.log(
          "🔒 [Login] First time login detected - redirecting to password change"
        );
        const accessToken =
          result.tokens?.access || result.access || result.access_token;
        if (accessToken) {
          setResetToken(accessToken);
          setForgotPasswordStep("newPassword");
          setShowForgotPassword(true);
        } else {
          setError(
            "First time login detected, but unable to start password change flow."
          );
        }
        return;
      }

      // Validate response structure
      if (!result.tokens || !result.tokens.access) {
        console.error("❌ [Login] Invalid response structure:", result);
        setError(
          "Invalid response from server. Missing authentication tokens."
        );
        return;
      }

      // Check if user role is customer and deny access BEFORE storing anything
      const userFromResponse =
        typeof result.user === "string" ? JSON.parse(result.user) : result.user;
      const userRole = userFromResponse?.role || userFromResponse?.user_role;

      console.log("🔍 [Login] User role from API:", userRole);

      if (userRole === "customer") {
        setError("Username or password do not match.");
        setIsLoading(false);
        return;
      }

      // Store tokens
      localStorage.setItem("accessToken", result.tokens.access);
      localStorage.setItem("refreshToken", result.tokens.refresh);
      localStorage.setItem(
        "user",
        typeof result.user === "string"
          ? result.user
          : JSON.stringify(result.user)
      );

      console.log("✅ [Login] Tokens stored successfully");

      // Use AuthContext login to set user state and handle role-based routing
      const loginResult = await login(loginData.identifier, loginData.password);

      if (loginResult.success) {
        console.log("✅ [Login] AuthContext login successful, reloading...");
        // Reload to navigate to dashboard (role-based routing will happen automatically)
        window.location.reload();
      } else {
        setError(loginResult.message || "Login failed. Please try again.");
      }
    } catch (err: any) {
      console.error("❌ [Login] Network error:", err);
      if (
        err.message?.includes("Failed to fetch") ||
        err.message?.includes("CORS")
      ) {
        setError(
          "Cannot connect to server. Please check your internet connection and ensure the backend is running."
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
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
              <LoginForm
                key="login"
                loginData={loginData}
                setLoginData={setLoginData}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                isLoading={isLoading}
                error={error}
                handleLogin={handleLogin}
                switchToRegister={() => setMode("register")}
                language={language}
                setLanguage={setLanguage}
                t={t}
                setShowForgotPassword={setShowForgotPassword}
              />
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeForgotPasswordModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative">
                {/* Back Arrow */}
                <button
                  onClick={() => {
                    if (forgotPasswordStep === "code") {
                      setForgotPasswordStep("email");
                      setResetCode("");
                      setError(null);
                    } else if (forgotPasswordStep === "newPassword") {
                      setForgotPasswordStep("code");
                      setNewPassword("");
                      setConfirmPassword("");
                      setError(null);
                    } else {
                      closeForgotPasswordModal();
                    }
                  }}
                  className="absolute left-1 top-9 pt-1  text-white hover:text-indigo-100 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <h3 className="text-2xl font-bold">
                  {isFirstTimeLogin ? "Change Password" : "Reset Password"}
                </h3>
                <p className="text-indigo-100 text-sm mt-1">
                  {forgotPasswordStep === "email" &&
                    "Enter your email to receive a verification code"}
                  {forgotPasswordStep === "code" &&
                    "Enter the code sent to your email"}
                  {forgotPasswordStep === "newPassword" &&
                    (isFirstTimeLogin
                      ? "Create your new password to continue"
                      : "Create your new password")}
                </p>
              </div>

              <div className="p-6">
                {resetSuccess ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      {isFirstTimeLogin
                        ? "Password Changed Successfully!"
                        : "Password Reset Successfully!"}
                    </h4>
                    <p className="text-gray-600">
                      You can now login with your new password
                    </p>
                  </motion.div>
                ) : (
                  <>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4"
                      >
                        {error}
                      </motion.div>
                    )}

                    {/* Email Step */}
                    {forgotPasswordStep === "email" && (
                      <div className="space-y-4">
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
                              value={forgotPasswordEmail}
                              onChange={(e) =>
                                setForgotPasswordEmail(e.target.value)
                              }
                              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                              placeholder="admin@example.com"
                              required
                            />
                          </div>
                        </div>

                        <button
                          onClick={handleSendResetCode}
                          disabled={isLoading || !forgotPasswordEmail}
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? "Sending..." : "Send Reset Code"}
                        </button>
                      </div>
                    )}

                    {/* Code Verification Step */}
                    {forgotPasswordStep === "code" && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Verification Code
                          </label>
                          <input
                            type="text"
                            value={resetCode}
                            onChange={(e) => setResetCode(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-center text-2xl font-mono tracking-widest"
                            placeholder="000000"
                            maxLength={6}
                            required
                          />
                        </div>

                        <button
                          onClick={handleVerifyCode}
                          disabled={isLoading || resetCode.length < 6}
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? "Verifying..." : "Verify Code"}
                        </button>

                        <button
                          onClick={() => setForgotPasswordStep("email")}
                          className="w-full text-gray-600 hover:text-gray-900 text-sm"
                        >
                          ← Back to email
                        </button>
                      </div>
                    )}

                    {/* New Password Step */}
                    {forgotPasswordStep === "newPassword" && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Lock className="text-gray-400" size={20} />
                            </div>
                            <input
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                              placeholder="Enter new password"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Lock className="text-gray-400" size={20} />
                            </div>
                            <input
                              type="password"
                              value={confirmPassword}
                              onChange={(e) =>
                                setConfirmPassword(e.target.value)
                              }
                              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                              placeholder="Confirm new password"
                              required
                            />
                          </div>
                        </div>

                        <button
                          onClick={handleResetPassword}
                          disabled={
                            isLoading || !newPassword || !confirmPassword
                          }
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading
                            ? isFirstTimeLogin
                              ? "Changing..."
                              : "Resetting..."
                            : isFirstTimeLogin
                            ? "Change Password"
                            : "Reset Password"}
                        </button>
                      </div>
                    )}
                  </>
                )}

                <button
                  onClick={closeForgotPasswordModal}
                  className="w-full mt-4 text-gray-600 hover:text-gray-900 py-2 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Left Visual Component
const LeftVisual: React.FC<{ mode: "login" | "register" }> = ({ mode }) => {
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
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 2px, transparent 2px)",
            backgroundSize: "40px 40px",
          }}
        />
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
            repeatType: "reverse",
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

          <h1 className="text-5xl font-bold mb-4">Serve Spares</h1>
          <p className="text-2xl mb-8 opacity-90">Inventory System</p>

          <div className="space-y-4 mb-8">
            <FeatureItem
              icon={<Package />}
              text="Complete Inventory Management"
            />
            <FeatureItem
              icon={<TrendingUp />}
              text="Real-time Analytics & Reports"
            />
            <FeatureItem icon={<Shield />} text="Secure Multi-Role Access" />
            <FeatureItem icon={<Zap />} text="Bilingual Support (EN/NE)" />
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

const FeatureItem: React.FC<{ icon: React.ReactNode; text: string }> = ({
  icon,
  text,
}) => (
  <motion.div whileHover={{ x: 10 }} className="flex items-center space-x-3">
    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
      {icon}
    </div>
    <span className="text-lg">{text}</span>
  </motion.div>
);

const StatCard: React.FC<{ number: string; label: string }> = ({
  number,
  label,
}) => (
  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
    <div className="text-2xl font-bold">{number}</div>
    <div className="text-sm opacity-90">{label}</div>
  </div>
);

// Login Form Component
const LoginForm: React.FC<any> = ({
  loginData,
  setLoginData,
  showPassword,
  setShowPassword,
  isLoading,
  error,
  handleLogin,
  switchToRegister,
  language,
  setLanguage,
  t,
  setShowForgotPassword,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {t("auth.welcome")}
        </h2>
        <p className="text-gray-600">{t("auth.subtitle")}</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("auth.email.label")}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="text-gray-400" size={20} />
            </div>
            <input
              type="text"
              value={loginData.identifier}
              onChange={(e) =>
                setLoginData({ ...loginData, identifier: e.target.value })
              }
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
              placeholder={t("auth.email.placeholder")}
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("auth.password.label")}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="text-gray-400" size={20} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={loginData.password}
              onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
              className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
              placeholder={t("auth.password.placeholder")}
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

        {/* Forgot Password Link */}
        <div className="text-right">
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
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
            isLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{t("auth.login.loading")}</span>
            </>
          ) : (
            <>
              <span>{t("auth.login.button")}</span>
              <ArrowRight size={20} />
            </>
          )}
        </motion.button>

        {/* Sign Up Link */}
        <div className="text-center pt-4">
          <p className="text-gray-600">
            {t("auth.signup.prompt")}{" "}
            <button
              type="button"
              onClick={switchToRegister}
              className="text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              {t("auth.signup.link")}
            </button>
          </p>
        </div>
      </form>
    </motion.div>
  );
};

// Register Form Component
const RegisterForm: React.FC<any> = ({
  registerData,
  setRegisterData,
  showPassword,
  setShowPassword,
  isLoading,
  error,
  handleRegister,
  switchToLogin,
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
      <p className="text-gray-600">
        Join thousands of businesses using Serve Spares
      </p>
    </div>

    <form onSubmit={handleRegister} className="space-y-4">
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

      {/* Business Name */}
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
            onChange={(e) =>
              setRegisterData({ ...registerData, businessName: e.target.value })
            }
            className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-sm"
            placeholder="Your Auto Parts Shop"
            required
          />
        </div>
      </div>

      {/* Owner Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Owner Name
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="text-gray-400" size={18} />
          </div>
          <input
            type="text"
            value={registerData.ownerName}
            onChange={(e) =>
              setRegisterData({ ...registerData, ownerName: e.target.value })
            }
            className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-sm"
            placeholder="John Doe"
            required
          />
        </div>
      </div>

      {/* Email */}
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
            onChange={(e) =>
              setRegisterData({ ...registerData, email: e.target.value })
            }
            className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-sm"
            placeholder="john@example.com"
            required
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="text-gray-400" size={18} />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            value={registerData.password}
            onChange={(e) =>
              setRegisterData({ ...registerData, password: e.target.value })
            }
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

      {/* Register Button */}
      <motion.button
        whileHover={{ scale: isLoading ? 1 : 1.02 }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
        type="submit"
        disabled={isLoading}
        className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:shadow-lg transition-all mt-4 ${
          isLoading ? "opacity-70 cursor-not-allowed" : ""
        }`}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Creating Account...</span>
          </>
        ) : (
          <>
            <span>Create Account</span>
            <ArrowRight size={20} />
          </>
        )}
      </motion.button>

      {/* Login Link */}
      <div className="text-center pt-2">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
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
