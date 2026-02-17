import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
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
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import {
  formatPhoneWithCode,
  handlePhoneInput,
  isValidNepalPhone,
  NEPAL_COUNTRY_CODE,
} from "../../utils/phoneValidation";

interface CustomerAuthProps {
  onLogin: (customer: any) => void;
  onBackToEntry: () => void;
  initialMode?: "login" | "register";
}

type AuthMode = "login" | "register";

const nepalLocations = [
  "Achham",
  "Arghakhanchi",
  "Baglung",
  "Baitadi",
  "Bajhang",
  "Bajura",
  "Banke",
  "Bara",
  "Bardiya",
  "Bhaktapur",
  "Bhojpur",
  "Chitwan",
  "Dadeldhura",
  "Dailekh",
  "Dang",
  "Darchula",
  "Dhading",
  "Dhankuta",
  "Dhanusha",
  "Dolakha",
  "Dolpa",
  "Doti",
  "Gorkha",
  "Gulmi",
  "Humla",
  "Ilam",
  "Jajarkot",
  "Jhapa",
  "Jumla",
  "Kailali",
  "Kalikot",
  "Kanchanpur",
  "Kapilvastu",
  "Kaski",
  "Kathmandu",
  "Kavrepalanchok",
  "Khotang",
  "Lalitpur",
  "Lamjung",
  "Mahottari",
  "Makwanpur",
  "Manang",
  "Morang",
  "Mugu",
  "Mustang",
  "Myagdi",
  "Nawalpur",
  "Nuwakot",
  "Okhaldhunga",
  "Palpa",
  "Panchthar",
  "Parasi",
  "Parbat",
  "Parsa",
  "Pyuthan",
  "Ramechhap",
  "Rasuwa",
  "Rautahat",
  "Rolpa",
  "Rukum East",
  "Rukum West",
  "Rupandehi",
  "Salyan",
  "Sankhuwasabha",
  "Saptari",
  "Sarlahi",
  "Sindhuli",
  "Sindhupalchok",
  "Siraha",
  "Solukhumbu",
  "Sunsari",
  "Surkhet",
  "Syangja",
  "Tanahu",
  "Taplejung",
  "Terhathum",
  "Udayapur",
];

export const CustomerAuthEnhanced: React.FC<CustomerAuthProps> = ({
  onLogin,
  onBackToEntry,
  initialMode = "login",
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const navigate = useNavigate();

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    if (newMode === "login") {
      navigate("/login");
    } else {
      navigate("/register");
    }
  };
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot Password State
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
  const [forgotPasswordError, setForgotPasswordError] = useState<string | null>(
    null,
  );
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);

  // Reset Password Visibility State
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] =
    useState(false);

  // Login form
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Two-Factor Authentication State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [loginOtp, setLoginOtp] = useState("");
  const [pendingLoginData, setPendingLoginData] = useState<any>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");

  // Register form
  const [registerGeneralError, setRegisterGeneralError] = useState("");
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    username: "",
    phone: NEPAL_COUNTRY_CODE,
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
        if (!value.trim() || value === NEPAL_COUNTRY_CODE) {
          error = "Phone number is required";
        } else if (!isValidNepalPhone(value)) {
          error = "Phone must be +977 followed by 10 digits";
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

  // Forgot Password Handlers
  const handleSendResetCode = async () => {
    setForgotPasswordError(null);
    setIsForgotPasswordLoading(true);

    const API_URL = `${import.meta.env.VITE_API_BASE_URL}/otp/request/`;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: forgotPasswordEmail,
        }),
      });

      let result;
      try {
        const text = await response.text();
        result = text ? JSON.parse(text) : {};
      } catch (jsonError) {
        setForgotPasswordError("Please try again.");
        setIsForgotPasswordLoading(false);
        return;
      }

      if (!response.ok) {
        setForgotPasswordError(
          result.message ||
            result.detail ||
            result.error ||
            "Failed to send OTP. Please check your email and try again.",
        );
        setIsForgotPasswordLoading(false);
        return;
      }

      setForgotPasswordStep("code");
      setForgotPasswordError(null);
    } catch (err: any) {
      setForgotPasswordError(
        "Cannot connect to server. Please check your internet connection.",
      );
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setForgotPasswordError(null);
    setIsForgotPasswordLoading(true);

    const API_URL = `${import.meta.env.VITE_API_BASE_URL}/otp/verify/`;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: forgotPasswordEmail,
          otp: resetCode,
        }),
      });

      let result;
      try {
        const text = await response.text();
        result = text ? JSON.parse(text) : {};
      } catch (jsonError) {
        setForgotPasswordError("Server error. Please try again.");
        setIsForgotPasswordLoading(false);
        return;
      }

      if (!response.ok) {
        setForgotPasswordError(
          result.message ||
            result.detail ||
            result.error ||
            "Invalid or expired OTP. Please try again.",
        );
        setIsForgotPasswordLoading(false);
        return;
      }

      // Extract token
      const token =
        result.token || result.access_token || result.access || result.key;
      if (token) {
        setResetToken(token);
        setForgotPasswordStep("newPassword");
        setForgotPasswordError(null);
      } else {
        setForgotPasswordError(
          "Verification successful but no token received. Please contact support.",
        );
      }
    } catch (err: any) {
      setForgotPasswordError(
        "Cannot connect to server. Please check your internet connection.",
      );
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setForgotPasswordError(null);

    if (newPassword !== confirmPassword) {
      setForgotPasswordError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setForgotPasswordError("Password must be at least 6 characters");
      return;
    }

    setIsForgotPasswordLoading(true);

    const API_URL = `${
      import.meta.env.VITE_API_BASE_URL
    }/users/first_time_password_change/`;

    try {
      if (!resetToken) {
        setForgotPasswordError(
          "Missing reset token. Please try verifying OTP again.",
        );
        setIsForgotPasswordLoading(false);
        return;
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resetToken}`,
        },
        body: JSON.stringify({
          new_password: newPassword,
          new_password_confirm: confirmPassword,
        }),
      });

      let result;
      try {
        const text = await response.text();
        result = text ? JSON.parse(text) : {};
      } catch (jsonError) {
        setForgotPasswordError("Please try again.");
        setIsForgotPasswordLoading(false);
        return;
      }

      if (!response.ok) {
        setForgotPasswordError(
          result.message ||
            result.detail ||
            result.error ||
            "Failed to reset password. Please try again.",
        );
        setIsForgotPasswordLoading(false);
        return;
      }

      // Success
      setResetSuccess(true);
      toast.success("Password reset successful! Please login.");

      setTimeout(() => {
        closeForgotPasswordModal();
      }, 2000);
    } catch (err: any) {
      setForgotPasswordError(
        "Cannot connect to server. Please check your internet connection.",
      );
    } finally {
      setIsForgotPasswordLoading(false);
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
    setForgotPasswordError(null);
    setResetSuccess(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");

    try {
      const loginPayload = {
        username: loginUsername,
        password: loginPassword,
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/login/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginPayload),
        },
      );

      const data = await response.json();

      if (response.ok) {
        // Check for Two-Factor Authentication first
        if (data.requires_otp) {
          setPendingLoginData(data);
          setShowOtpModal(true);
          setIsLoading(false);
          toast.info(data.message || "Two-Factor Authentication required.");
          return;
        }

        if (data.user.role !== "customer") {
          setLoginError(`Username or Password do not match`);
          setIsLoading(false);
          return;
        }

        // Store tokens in localStorage
        localStorage.setItem("accessToken", data.tokens.access);
        localStorage.setItem("refreshToken", data.tokens.refresh);
        localStorage.setItem("session_active", "true");

        // Map avatar to profileImage if missing
        const userToStore = {
          ...data.user,
          profileImage: data.user.profileImage || data.user.avatar || "",
        };

        // Store user info
        localStorage.setItem("user", JSON.stringify(userToStore));
        localStorage.setItem("customer_user", JSON.stringify(userToStore));
        localStorage.setItem("user_role", data.user.role);

        toast.success(data.message || "Login successful!");

        // Refresh page immediately
        window.location.reload();
      } else {
        const errorData = data;
        let errorMessage = "Invalid credentials";

        if (errorData) {
          if (typeof errorData === "string") {
            errorMessage = errorData;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (
            errorData.non_field_errors &&
            Array.isArray(errorData.non_field_errors)
          ) {
            errorMessage = errorData.non_field_errors.join(", ");
          } else {
            // Check for field-specific errors
            const fieldErrors = Object.entries(errorData)
              .filter(
                ([key]) =>
                  key !== "status" &&
                  key !== "code" &&
                  key !== "tokens" &&
                  key !== "user",
              )
              .map(([field, errors]) => {
                const errorStr = Array.isArray(errors)
                  ? errors.join(", ")
                  : String(errors);
                const fieldName =
                  field.charAt(0).toUpperCase() +
                  field.slice(1).replace(/_/g, " ");
                return `${fieldName}: ${errorStr}`;
              });

            if (fieldErrors.length > 0) {
              errorMessage = fieldErrors.join("\n");
            }
          }
        }
        setLoginError(errorMessage);
      }
    } catch (error) {
      setLoginError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifyingOtp(true);
    setOtpError("");

    try {
      if (!pendingLoginData?.temp_token) {
        setOtpError("Session expired. Please login again.");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/verify_2fa_otp/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            temp_token: pendingLoginData.temp_token,
            otp_code: loginOtp,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        // Verification successful - actual tokens should be in 'data'
        // If data doesn't have tokens, maybe it's in data.tokens or similar.
        // Usually, 2FA verification returns the full login response.
        const loginData = data;

        // Store tokens in localStorage
        localStorage.setItem("accessToken", loginData.tokens.access);
        localStorage.setItem("refreshToken", loginData.tokens.refresh);
        localStorage.setItem("session_active", "true");

        // Store user info
        localStorage.setItem("user", JSON.stringify(loginData.user));
        localStorage.setItem("customer_user", JSON.stringify(loginData.user));
        localStorage.setItem("user_role", loginData.user.role);

        toast.success("Verification successful! Welcome back.");

        // Clean up
        setShowOtpModal(false);
        setPendingLoginData(null);
        setLoginOtp("");

        // Refresh page
        window.location.reload();
      } else {
        setOtpError(data.message || data.detail || "Invalid verification code");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setOtpError("Network error. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

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
      newErrors.name = "Full name is required";
      hasError = true;
    }

    if (!registerData.username.trim()) {
      newErrors.username = "Username is required";
      hasError = true;
    }

    if (!registerData.email.trim()) {
      newErrors.email = "Email is required";
      hasError = true;
    }

    if (
      !registerData.phone.trim() ||
      registerData.phone === NEPAL_COUNTRY_CODE
    ) {
      newErrors.phone = "Phone number is required";
      hasError = true;
    } else if (!isValidNepalPhone(registerData.phone)) {
      newErrors.phone = "Phone must be +977 followed by 10 digits";
      hasError = true;
    }

    if (!registerData.password) {
      newErrors.password = "Password is required";
      hasError = true;
    } else if (registerData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      hasError = true;
    }

    if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      hasError = true;
    }

    if (hasError) {
      setRegisterErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      setRegisterGeneralError("");
      const payload = {
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
        password_confirm: registerData.confirmPassword,
        full_name: registerData.name,
        phone: registerData.phone,
        role: "customer",
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/register/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Registration successful! Please login.");
        handleModeChange("login");
        setLoginUsername(registerData.username);
        // Reset form
        setRegisterData({
          name: "",
          email: "",
          username: "",
          phone: NEPAL_COUNTRY_CODE,
          address: "",
          password: "",
          confirmPassword: "",
        });
      } else {
        // Handle various error formats from API
        const errorData = data;
        let errorMessage = "Registration failed";

        if (errorData) {
          if (typeof errorData === "string") {
            errorMessage = errorData;
          } else if (
            errorData.non_field_errors &&
            Array.isArray(errorData.non_field_errors)
          ) {
            errorMessage = errorData.non_field_errors.join(", ");
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else {
            // Check for field-specific errors
            const fieldErrors = Object.entries(errorData)
              .filter(([key]) => key !== "status" && key !== "code")
              .map(([field, errors]) => {
                const errorStr = Array.isArray(errors)
                  ? errors.join(", ")
                  : String(errors);
                const fieldName =
                  field.charAt(0).toUpperCase() +
                  field.slice(1).replace(/_/g, " ");
                return `${fieldName}: ${errorStr}`;
              });

            if (fieldErrors.length > 0) {
              errorMessage = fieldErrors.join("\n");
            }
          }
        }
        setRegisterGeneralError(errorMessage);

        // Also map to field-specific errors if any for form feedback
        const apiErrors: any = {};
        if (typeof data === "object") {
          Object.keys(data).forEach((key) => {
            if (
              key in registerData ||
              key === "non_field_errors" ||
              key === "username" ||
              key === "email" ||
              key === "phone"
            ) {
              apiErrors[key] = Array.isArray(data[key])
                ? data[key][0]
                : data[key];
            }
          });
        }
        setRegisterErrors((prev) => ({ ...prev, ...apiErrors }));
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Network error. Please check your connection.");
      setRegisterGeneralError("Network error. Please try again.");
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
    handleModeChange("login");
    setLoginUsername(registerData.username);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4 relative overflow-hidden">
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
              onClick={() => handleModeChange("login")}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                mode === "login"
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => handleModeChange("register")}
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
                  <div className="text-right mt-1">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Forgot password?
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
                        handlePhoneInput(e.target.value, (phone) =>
                          setRegisterData({ ...registerData, phone }),
                        )
                      }
                      onBlur={(e) => validateField("phone", e.target.value)}
                      className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:ring-4 transition-all ${
                        registerErrors.phone
                          ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                          : "border-gray-200 focus:border-purple-500 focus:ring-purple-100"
                      }`}
                      placeholder="+977 98XXXXXXXX"
                    />
                  </div>
                  {registerErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">
                      {registerErrors.phone}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Enter 10 digit number after +977
                  </p>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address (District)
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <select
                      required
                      value={registerData.address}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          address: e.target.value,
                        })
                      }
                      className="w-full pl-11 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all appearance-none bg-white text-gray-700"
                    >
                      <option value="" disabled>
                        Select your district
                      </option>
                      {nepalLocations.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
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
                      type={showConfirmPassword ? "text" : "password"}
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
                      className={`w-full pl-11 pr-12 py-3 border-2 rounded-xl focus:ring-4 transition-all ${
                        registerErrors.confirmPassword
                          ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                          : "border-gray-200 focus:border-purple-500 focus:ring-purple-100"
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {registerErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {registerErrors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Registration Error Message */}
                {registerGeneralError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                    <div className="text-sm text-red-600 flex items-start">
                      <AlertCircle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                      <div className="whitespace-pre-wrap">
                        {registerGeneralError}
                      </div>
                    </div>
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
                onClick={() =>
                  handleModeChange(mode === "login" ? "register" : "login")
                }
                className="text-purple-600 font-semibold hover:text-purple-700 transition-colors"
              >
                {mode === "login" ? "Register now" : "Sign in"}
              </button>
            </p>
          </div>
        </motion.div>

        {/* Demo Credentials */}
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
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeForgotPasswordModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </div>
              </button>

              <div className="p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {resetSuccess
                      ? "Password Reset Successful"
                      : forgotPasswordStep === "email"
                        ? "Forgot Password?"
                        : forgotPasswordStep === "code"
                          ? "Enter Verification Code"
                          : "Set New Password"}
                  </h3>
                  <p className="text-gray-600 mt-2 text-sm">
                    {resetSuccess
                      ? "Your password has been successfully updated. You can now login with your new password."
                      : forgotPasswordStep === "email"
                        ? "Enter your email address to receive a verification code."
                        : forgotPasswordStep === "code"
                          ? `We sent a code to ${forgotPasswordEmail}. Enter it below.`
                          : "Create a strong password for your account."}
                  </p>
                </div>

                {resetSuccess ? (
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {forgotPasswordError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                        <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-600">
                          {forgotPasswordError}
                        </p>
                      </div>
                    )}

                    {forgotPasswordStep === "email" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={forgotPasswordEmail}
                          onChange={(e) =>
                            setForgotPasswordEmail(e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                          placeholder="Enter your email"
                        />
                        <button
                          onClick={handleSendResetCode}
                          disabled={
                            isForgotPasswordLoading || !forgotPasswordEmail
                          }
                          className="w-full mt-4 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {isForgotPasswordLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            "Send Reset Code"
                          )}
                        </button>
                      </div>
                    )}

                    {forgotPasswordStep === "code" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Verification Code
                        </label>
                        <input
                          type="text"
                          value={resetCode}
                          onChange={(e) => setResetCode(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-center tracking-widest text-lg"
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                        />
                        <button
                          onClick={handleVerifyCode}
                          disabled={isForgotPasswordLoading || !resetCode}
                          className="w-full mt-4 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {isForgotPasswordLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            "Verify Code"
                          )}
                        </button>
                        <button
                          onClick={() => setForgotPasswordStep("email")}
                          className="w-full mt-2 text-gray-500 text-sm hover:text-gray-700 py-2"
                        >
                          Change Email
                        </button>
                      </div>
                    )}

                    {forgotPasswordStep === "newPassword" && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showResetPassword ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all pr-12"
                              placeholder="At least 6 characters"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowResetPassword(!showResetPassword)
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showResetPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              type={
                                showResetConfirmPassword ? "text" : "password"
                              }
                              value={confirmPassword}
                              onChange={(e) =>
                                setConfirmPassword(e.target.value)
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all pr-12"
                              placeholder="Confirm new password"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowResetConfirmPassword(
                                  !showResetConfirmPassword,
                                )
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showResetConfirmPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={handleResetPassword}
                          disabled={
                            isForgotPasswordLoading ||
                            !newPassword ||
                            !confirmPassword
                          }
                          className="w-full mt-2 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {isForgotPasswordLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            "Reset Password"
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Two-Factor Authentication Modal */}
        {showOtpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowOtpModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-10 h-10 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Two-Factor Authentication
                  </h2>
                  <p className="text-gray-600 mt-2">
                    Enter the 6-digit verification code sent to your registered
                    email address.
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div>
                    <input
                      type="text"
                      maxLength={6}
                      value={loginOtp}
                      onChange={(e) =>
                        setLoginOtp(e.target.value.replace(/\D/g, ""))
                      }
                      className="w-full px-4 py-4 text-center text-3xl tracking-[0.5em] font-bold border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all placeholder:tracking-normal placeholder:text-gray-200"
                      placeholder="000000"
                      autoFocus
                    />
                    {otpError && (
                      <p className="mt-2 text-sm text-red-500 text-center">
                        {otpError}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifyingOtp || loginOtp.length !== 6}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-purple-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isVerifyingOtp ? (
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        Verify & Login
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowOtpModal(false)}
                    className="w-full text-gray-500 font-medium hover:text-gray-700 transition-colors py-2"
                  >
                    Back to Login
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
