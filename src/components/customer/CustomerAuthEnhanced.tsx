import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  ArrowLeft,
  Eye,
  EyeOff,
  ShoppingBag,
  Check,
  AlertCircle,
  Crown,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface CustomerAuthProps {
  onLogin: (customer: any) => void;
  onBackToEntry: () => void;
}

type AuthMode = "login" | "register";

export const CustomerAuthEnhanced: React.FC<CustomerAuthProps> = ({
  onLogin,
  onBackToEntry,
}) => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Login form
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Register form
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    username: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [registerErrors, setRegisterErrors] = useState({
    name: "",
    email: "",
    username: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // Real-time validation for registration fields
  const validateField = (field: string, value: string) => {
    let error = "";

    switch (field) {
      case "name":
        if (!value.trim()) error = "Full name is required";
        break;
      case "username":
        if (!value.trim()) error = "Username is required";
        break;
      case "email":
        if (!value.trim()) {
          error = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Invalid email format";
        }
        break;
      case "phone":
        if (!value.trim()) {
          error = "Phone number is required";
        } else if (!/^\+\d{10,15}$/.test(value)) {
          error = "Phone must start with + and contain 10-15 digits";
        }
        break;
      case "password":
        if (!value) {
          error = "Password is required";
        } else if (value.length < 6) {
          error = "Password must be at least 6 characters";
        }
        break;
      case "confirmPassword":
        if (value !== registerData.password) {
          error = "Passwords do not match";
        }
        break;
    }

    setRegisterErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");

    console.log("🔐 [Customer Login] Attempting login with:", loginUsername);

    try {
      const loginPayload = {
        username: loginUsername,
        password: loginPassword,
      };

      console.log("📤 [Customer Login] Sending payload:", loginPayload);

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/login/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginPayload),
        }
      );

      const data = await response.json();
      console.log("📥 [Customer Login] Response:", data);

      if (response.ok) {
        console.log("✅ [Customer Login] API login successful", data);

        // Check if user role is customer
        if (data.user.role !== "customer") {
          setLoginError(
            ` Username or Password donot match
            }`
          );
          setIsLoading(false);
          return;
        }

        // Store tokens in localStorage
        localStorage.setItem("accessToken", data.tokens.access);
        localStorage.setItem("refreshToken", data.tokens.refresh);

        // Store user info
        localStorage.setItem("user", JSON.stringify(data.user));

        toast.success(data.message || "Login successful!");
        onLogin(data.user);
      } else {
        console.error("❌ [Customer Login] Login failed:", data);
        setLoginError(data.message || data.error || "Invalid credentials");
      }
    } catch (error) {
      console.error("❌ [Customer Login] Network error:", error);
      setLoginError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log(
      "🚀 [Customer Register] Form submitted! Starting registration process...",
      registerData
    );

    // Reset errors
    setRegisterErrors({
      name: "",
      email: "",
      username: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });

    let hasError = false;
    const newErrors: any = {};

    // Validation
    if (!registerData.name.trim()) {
      console.log("❌ Validation failed: Name is required");
      newErrors.name = "Full name is required";
      hasError = true;
    }

    if (!registerData.username.trim()) {
      console.log("❌ Validation failed: Username is required");
      newErrors.username = "Username is required";
      hasError = true;
    }

    if (!registerData.email.trim()) {
      console.log("❌ Validation failed: Email is required");
      newErrors.email = "Email is required";
      hasError = true;
    }

    if (!registerData.phone.trim()) {
      console.log("❌ Validation failed: Phone is required");
      newErrors.phone = "Phone number is required";
      hasError = true;
    } else if (!registerData.phone.match(/^\+\d{10,15}$/)) {
      console.log(
        "❌ Validation failed: Invalid phone format",
        registerData.phone
      );
      newErrors.phone =
        "Phone must start with + and contain 10-15 digits (e.g., +1234567890)";
      hasError = true;
    }

    if (!registerData.password) {
      newErrors.password = "Password is required";
      hasError = true;
    } else if (registerData.password.length < 6) {
      console.log("❌ Validation failed: Password too short");
      newErrors.password = "Password must be at least 6 characters";
      hasError = true;
    }

    if (registerData.password !== registerData.confirmPassword) {
      console.log("❌ Validation failed: Passwords do not match");
      newErrors.confirmPassword = "Passwords do not match";
      hasError = true;
    }

    if (hasError) {
      setRegisterErrors(newErrors);
      return;
    }

    console.log(
      "✅ [Customer Register] All validation passed! Making API call..."
    );

    setIsLoading(true);

    try {
      const payload = {
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
        password_confirm: registerData.confirmPassword,
        full_name: registerData.name,
        phone: registerData.phone,
        role: "customer",
      };

      console.log("📤 [Customer Register] Sending payload to API:", payload);

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/register/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      console.log("📥 [Customer Register] Response status:", response.status);

      const data = await response.json();
      console.log("📥 [Customer Register] Response data:", data);

      if (response.ok) {
        console.log("✅ [Customer Register] Registration successful", data);
        toast.success("Registration successful! Please login.");
        setMode("login");
        setLoginUsername(registerData.username);
        // Reset form
        setRegisterData({
          name: "",
          email: "",
          username: "",
          phone: "",
          address: "",
          password: "",
          confirmPassword: "",
        });
      } else {
        console.error("❌ [Customer Register] Registration failed:", data);
        // Handle various error formats from API
        const apiErrors: any = {};
        if (data.username) {
          apiErrors.username = Array.isArray(data.username)
            ? data.username.join(", ")
            : data.username;
        }
        if (data.email) {
          apiErrors.email = Array.isArray(data.email)
            ? data.email.join(", ")
            : data.email;
        }
        if (data.phone) {
          apiErrors.phone = Array.isArray(data.phone)
            ? data.phone.join(", ")
            : data.phone;
        }
        if (data.password) {
          apiErrors.password = Array.isArray(data.password)
            ? data.password.join(", ")
            : data.password;
        }

        if (Object.keys(apiErrors).length > 0) {
          setRegisterErrors(apiErrors);
        } else {
          toast.error(
            data.message ||
              data.error ||
              "Registration failed. Please try again."
          );
        }
      }
    } catch (error) {
      console.error("❌ [Customer Register] Network error:", error);
      toast.error("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const registerToLocalStorage = () => {
    const customers = JSON.parse(localStorage.getItem("customers") || "[]");

    // Check if email already exists
    if (customers.some((c: any) => c.email === registerData.email)) {
      toast.error("Email already registered");
      return;
    }

    const newCustomer = {
      id: `customer_${Date.now()}`,
      name: registerData.name,
      email: registerData.email,
      phone: registerData.phone,
      address: registerData.address,
      password: registerData.password,
      createdAt: new Date().toISOString(),
    };

    customers.push(newCustomer);
    localStorage.setItem("customers", JSON.stringify(customers));

    toast.success("Registration successful! Please login.");
    setMode("login");
    setLoginUsername(registerData.username);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onBackToEntry}
          className="mb-6 flex items-center text-white/80 hover:text-white transition-colors backdrop-blur-sm bg-white/10 px-4 py-2 rounded-full"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </motion.button>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20"
        >
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="mb-4"
            >
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Crown className="w-10 h-10 text-yellow-400" />
              </div>
            </motion.div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center space-x-2">
              <span>{mode === "login" ? "Welcome Back" : "Join Us"}</span>
              <Sparkles className="w-6 h-6 text-purple-600" />
            </h2>
            <p className="text-gray-600">
              {mode === "login"
                ? "Sign in to your premium account"
                : "Create your premium account"}
            </p>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                mode === "login"
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                mode === "register"
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Register
            </button>
          </div>

          {/* Forms */}
          <AnimatePresence mode="wait">
            {mode === "login" ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                {/* Username */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                      placeholder="Enter your username"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Login Error Message */}
                {loginError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {loginError}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </motion.button>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={(e) => {
                  console.log("🔥 FORM SUBMIT EVENT FIRED!");
                  handleRegister(e);
                }}
                className="space-y-4"
              >
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={registerData.name}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          name: e.target.value,
                        })
                      }
                      onBlur={(e) => validateField("name", e.target.value)}
                      className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:ring-4 transition-all ${
                        registerErrors.name
                          ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                          : "border-gray-200 focus:border-purple-500 focus:ring-purple-100"
                      }`}
                      placeholder="John Doe"
                    />
                  </div>
                  {registerErrors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {registerErrors.name}
                    </p>
                  )}
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={registerData.username}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          username: e.target.value,
                        })
                      }
                      onBlur={(e) => validateField("username", e.target.value)}
                      className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:ring-4 transition-all ${
                        registerErrors.username
                          ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                          : "border-gray-200 focus:border-purple-500 focus:ring-purple-100"
                      }`}
                      placeholder="john_doe"
                    />
                  </div>
                  {registerErrors.username && (
                    <p className="mt-1 text-sm text-red-600">
                      {registerErrors.username}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={registerData.email}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          email: e.target.value,
                        })
                      }
                      onBlur={(e) => validateField("email", e.target.value)}
                      className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:ring-4 transition-all ${
                        registerErrors.email
                          ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                          : "border-gray-200 focus:border-purple-500 focus:ring-purple-100"
                      }`}
                      placeholder="your@email.com"
                    />
                  </div>
                  {registerErrors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {registerErrors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      required
                      value={registerData.phone}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          phone: e.target.value,
                        })
                      }
                      onBlur={(e) => validateField("phone", e.target.value)}
                      className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:ring-4 transition-all ${
                        registerErrors.phone
                          ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                          : "border-gray-200 focus:border-purple-500 focus:ring-purple-100"
                      }`}
                      placeholder="+977XXXXXXXXXX"
                    />
                  </div>
                  {registerErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">
                      {registerErrors.phone}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={registerData.address}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          address: e.target.value,
                        })
                      }
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                      placeholder="Pokhara, Nepal"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          password: e.target.value,
                        })
                      }
                      onBlur={(e) => validateField("password", e.target.value)}
                      className={`w-full pl-11 pr-12 py-3 border-2 rounded-xl focus:ring-4 transition-all ${
                        registerErrors.password
                          ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                          : "border-gray-200 focus:border-purple-500 focus:ring-purple-100"
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {registerErrors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {registerErrors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={registerData.confirmPassword}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          confirmPassword: e.target.value,
                        })
                      }
                      onBlur={(e) =>
                        validateField("confirmPassword", e.target.value)
                      }
                      className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:ring-4 transition-all ${
                        registerErrors.confirmPassword
                          ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                          : "border-gray-200 focus:border-purple-500 focus:ring-purple-100"
                      }`}
                      placeholder="••••••••"
                    />
                  </div>
                  {registerErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {registerErrors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Footer Note */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              {mode === "login"
                ? "Don't have an account? "
                : "Already have an account? "}
              <button
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="text-purple-600 font-semibold hover:text-purple-700 transition-colors"
              >
                {mode === "login" ? "Register now" : "Sign in"}
              </button>
            </p>
          </div>
        </motion.div>

        {/* Demo Credentials */}
      </div>
    </div>
  );
};
