import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  Upload,
  FileText,
  Image,
  CreditCard,
  ArrowLeft,
  ArrowRight,
  Check,
  AlertCircle,
  X,
} from "lucide-react";
import { initiatePayment, mockPaymentSuccess } from "../utils/paymentGateway";
import { handlePhoneInput, NEPAL_COUNTRY_CODE } from "../utils/phoneValidation";

interface RegistrationData {
  // Business Information
  businessName: string;
  businessType: string;
  panVatNumber: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;

  // Owner/Person Information
  ownerName: string;
  citizenshipNumber: string;

  // Package Selection
  selectedPackage: "basic" | "pro" | "enterprise" | "";

  // Documents
  panVatCertificate: File | null;
  registrationCertificate: File | null;
  ownerPhoto: File | null;
  citizenshipPhoto: File | null;

  // Credentials
  password: string;
  confirmPassword: string;

  // Payment Info (will be filled after payment)
  paymentId?: string;
  paymentMethod?: "esewa" | "fonepay";
  paymentAmount?: number;
  paymentStatus?: "pending" | "completed" | "failed";
}

interface BusinessRegistrationFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const BusinessRegistrationForm: React.FC<
  BusinessRegistrationFormProps
> = ({ onBack, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Business Info, 2: Owner Info, 3: Package Selection, 4: Credentials, 5: Payment
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Package pricing in NPR
  const packages = {
    basic: {
      name: "Basic",
      price: 5000,
      features: ["1 User", "100 Products", "Basic Reports", "Email Support"],
    },
    pro: {
      name: "Professional",
      price: 15000,
      features: [
        "5 Users",
        "1000 Products",
        "Advanced Reports",
        "Priority Support",
        "Multi-Branch",
      ],
    },
    enterprise: {
      name: "Enterprise",
      price: 35000,
      features: [
        "Unlimited Users",
        "Unlimited Products",
        "Custom Reports",
        "24/7 Support",
        "API Access",
      ],
    },
  };

  const [formData, setFormData] = useState<RegistrationData>({
    businessName: "",
    businessType: "",
    panVatNumber: "",
    businessAddress: "",
    businessPhone: NEPAL_COUNTRY_CODE,
    businessEmail: "",
    ownerName: "",
    citizenshipNumber: "",
    selectedPackage: "",
    panVatCertificate: null,
    registrationCertificate: null,
    ownerPhoto: null,
    citizenshipPhoto: null,
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (field: keyof RegistrationData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleFileChange = (
    field: keyof RegistrationData,
    file: File | null,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
    setError(null);
  };

  const validateStep = (stepNumber: number): boolean => {
    setError(null);

    switch (stepNumber) {
      case 1: // Business Information
        if (!formData.businessName.trim()) {
          setError("Business name is required");
          return false;
        }
        if (!formData.businessType) {
          setError("Business type is required");
          return false;
        }
        if (!formData.panVatNumber.trim()) {
          setError("PAN/VAT number is required");
          return false;
        }
        if (!formData.businessAddress.trim()) {
          setError("Business address is required");
          return false;
        }
        if (!formData.businessPhone.trim()) {
          setError("Business phone is required");
          return false;
        }
        if (
          !formData.businessEmail.trim() ||
          !formData.businessEmail.includes("@")
        ) {
          setError("Valid business email is required");
          return false;
        }
        break;

      case 2: // Owner Information
        if (!formData.ownerName.trim()) {
          setError("Owner name is required");
          return false;
        }
        if (!formData.citizenshipNumber.trim()) {
          setError("Citizenship number is required");
          return false;
        }
        break;

      case 3: // Package Selection
        if (!formData.selectedPackage) {
          setError("Please select a package");
          return false;
        }
        break;

      case 4: // Documents
        if (!formData.panVatCertificate) {
          setError("PAN/VAT certificate is required");
          return false;
        }
        if (!formData.registrationCertificate) {
          setError("Registration certificate is required");
          return false;
        }
        if (!formData.ownerPhoto) {
          setError("Owner photo is required");
          return false;
        }
        if (!formData.citizenshipPhoto) {
          setError("Citizenship photo is required");
          return false;
        }
        break;

      case 5: // Credentials
        if (!formData.password || formData.password.length < 8) {
          setError("Password must be at least 8 characters");
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          return false;
        }
        break;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Only allow submission on step 6 after payment is completed
    if (step !== 6) {
      handleNext(); // If not on step 6, treat as "Next" button
      return;
    }

    // Validate payment completion
    if (!formData.paymentStatus || formData.paymentStatus !== "completed") {
      setError("Please complete payment before submitting registration");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Convert files to base64
      const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        });
      };

      const [
        panVatBase64,
        regCertBase64,
        ownerPhotoBase64,
        citizenshipPhotoBase64,
      ] = await Promise.all([
        formData.panVatCertificate
          ? fileToBase64(formData.panVatCertificate)
          : Promise.resolve(""),
        formData.registrationCertificate
          ? fileToBase64(formData.registrationCertificate)
          : Promise.resolve(""),
        formData.ownerPhoto
          ? fileToBase64(formData.ownerPhoto)
          : Promise.resolve(""),
        formData.citizenshipPhoto
          ? fileToBase64(formData.citizenshipPhoto)
          : Promise.resolve(""),
      ]);

      // Create pending registration
      const registrationId = `reg_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // 🔥 IMPORTANT: Using PAN/VAT as tenantId for verification
      const tenantId = formData.panVatNumber; // This will be their unique tenant identifier

      const pendingRegistration = {
        id: registrationId,
        tenantId: tenantId, // PAN/VAT number as tenant ID
        status: "pending_payment", // pending_payment, paid, approved, rejected
        submittedAt: new Date().toISOString(),
        businessInfo: {
          name: formData.businessName,
          type: formData.businessType,
          panVatNumber: formData.panVatNumber,
          address: formData.businessAddress,
          phone: formData.businessPhone,
          email: formData.businessEmail,
        },
        ownerInfo: {
          name: formData.ownerName,
          citizenshipNumber: formData.citizenshipNumber,
        },
        packageInfo: {
          package: formData.selectedPackage,
          price: formData.selectedPackage
            ? packages[formData.selectedPackage].price
            : 0,
          features: formData.selectedPackage
            ? packages[formData.selectedPackage].features
            : [],
        },
        paymentInfo: {
          paymentId: formData.paymentId || "",
          paymentMethod: formData.paymentMethod || "",
          paymentAmount: formData.paymentAmount || 0,
          paymentStatus: formData.paymentStatus || "pending",
          paymentDate:
            formData.paymentStatus === "completed"
              ? new Date().toISOString()
              : "",
        },
        documents: {
          panVatCertificate: panVatBase64,
          registrationCertificate: regCertBase64,
          ownerPhoto: ownerPhotoBase64,
          citizenshipPhoto: citizenshipPhotoBase64,
        },
        credentials: {
          email: formData.businessEmail,
          password: formData.password, // In production, this should be hashed
        },
      };

      // Save to localStorage (pending_registrations)
      const existingRegistrations = JSON.parse(
        localStorage.getItem("pending_registrations") || "[]",
      );
      existingRegistrations.push(pendingRegistration);
      localStorage.setItem(
        "pending_registrations",
        JSON.stringify(existingRegistrations),
      );

      // Debug logging
      console.log(
        "✅ New registration saved:",
        pendingRegistration.businessInfo.name,
      );
      console.log("🏢 Tenant ID (PAN):", tenantId);
      console.log("📦 Package:", formData.selectedPackage);
      console.log("💰 Payment Status:", formData.paymentStatus);
      console.log("📊 Total registrations now:", existingRegistrations.length);

      // Success - show message
      alert(`✅ Registration submitted successfully!

🏢 Business: ${formData.businessName}
🆔 Tenant ID: ${tenantId}
📦 Package: ${formData.selectedPackage?.toUpperCase()}
💰 Amount: NPR ${formData.paymentAmount?.toLocaleString()}

📋 Status: ${
        formData.paymentStatus === "completed"
          ? "Payment Verified - Pending Admin Approval"
          : "Payment Pending"
      }

${
  formData.paymentStatus === "completed"
    ? "✅ Your payment has been verified. Your application is now pending Super Admin approval."
    : "⚠️ Please complete the payment to proceed with approval."
}

You will receive a notification once approved.

Thank you for your patience!`);

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const FileUploadField: React.FC<{
    label: string;
    file: File | null;
    onChange: (file: File | null) => void;
    accept?: string;
  }> = ({ label, file, onChange, accept = "image/*,.pdf" }) => (
    <div>
      <label className="block mb-2 font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input
          type="file"
          accept={accept}
          onChange={(e) => onChange(e.target.files?.[0] || null)}
          className="hidden"
          id={label.replace(/\s/g, "-")}
        />
        <label
          htmlFor={label.replace(/\s/g, "-")}
          className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors"
        >
          {file ? (
            <>
              <Check className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-700">{file.name}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onChange(null);
                }}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500">Click to upload</span>
            </>
          )}
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Business Registration</h2>
              <p className="text-indigo-100 mt-1">Step {step} of 6</p>
            </div>
            <button
              onClick={onBack}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 bg-white/20 rounded-full h-2">
            <motion.div
              initial={{ width: "25%" }}
              animate={{ width: `${(step / 6) * 100}%` }}
              className="bg-white h-2 rounded-full"
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Step 1: Business Information */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h3 className="flex items-center gap-2 mb-4">
                <Building className="w-5 h-5 text-indigo-600" />
                <span>Business Information</span>
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) =>
                      handleInputChange("businessName", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter business name"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Business Type *
                  </label>
                  <select
                    value={formData.businessType}
                    onChange={(e) =>
                      handleInputChange("businessType", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select type</option>
                    <option value="auto_parts_dealer">Auto Parts Dealer</option>
                    <option value="workshop">Workshop</option>
                    <option value="service_center">Service Center</option>
                    <option value="retail_shop">Retail Shop</option>
                    <option value="wholesaler">Wholesaler</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    PAN/VAT Number *
                  </label>
                  <input
                    type="text"
                    value={formData.panVatNumber}
                    onChange={(e) =>
                      handleInputChange("panVatNumber", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter PAN/VAT number"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Business Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.businessPhone}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.startsWith("+977")) {
                        if (value.length <= 14) {
                          handleInputChange("businessPhone", value);
                        }
                      } else if (value.length <= 10) {
                        handleInputChange("businessPhone", value);
                      }
                    }}
                    maxLength={14}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="+977 98XXXXXXXX"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter 10 digit number after +977
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-2 font-medium text-gray-700">
                    Business Email *
                  </label>
                  <input
                    type="email"
                    value={formData.businessEmail}
                    onChange={(e) =>
                      handleInputChange("businessEmail", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="business@example.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-2 font-medium text-gray-700">
                    Business Address *
                  </label>
                  <textarea
                    value={formData.businessAddress}
                    onChange={(e) =>
                      handleInputChange("businessAddress", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter complete address"
                    rows={3}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Owner Information */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h3 className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-indigo-600" />
                <span>Owner/Applicant Information</span>
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) =>
                      handleInputChange("ownerName", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Citizenship Number *
                  </label>
                  <input
                    type="text"
                    value={formData.citizenshipNumber}
                    onChange={(e) =>
                      handleInputChange("citizenshipNumber", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter citizenship number"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Package Selection */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h3 className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <span>Select Package</span>
              </h3>

              <div className="grid md:grid-cols-3 gap-4">
                <div
                  className={`p-4 border rounded-lg cursor-pointer ${
                    formData.selectedPackage === "basic"
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-300"
                  }`}
                  onClick={() => handleInputChange("selectedPackage", "basic")}
                >
                  <h4 className="text-lg font-bold text-indigo-600">Basic</h4>
                  <p className="text-sm text-gray-500">NPR 5000</p>
                  <ul className="mt-2 text-sm text-gray-500">
                    {packages.basic.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>

                <div
                  className={`p-4 border rounded-lg cursor-pointer ${
                    formData.selectedPackage === "pro"
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-300"
                  }`}
                  onClick={() => handleInputChange("selectedPackage", "pro")}
                >
                  <h4 className="text-lg font-bold text-indigo-600">
                    Professional
                  </h4>
                  <p className="text-sm text-gray-500">NPR 15000</p>
                  <ul className="mt-2 text-sm text-gray-500">
                    {packages.pro.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>

                <div
                  className={`p-4 border rounded-lg cursor-pointer ${
                    formData.selectedPackage === "enterprise"
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-300"
                  }`}
                  onClick={() =>
                    handleInputChange("selectedPackage", "enterprise")
                  }
                >
                  <h4 className="text-lg font-bold text-indigo-600">
                    Enterprise
                  </h4>
                  <p className="text-sm text-gray-500">NPR 35000</p>
                  <ul className="mt-2 text-sm text-gray-500">
                    {packages.enterprise.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Documents */}
          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h3 className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>Required Documents</span>
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <FileUploadField
                  label="PAN/VAT Certificate *"
                  file={formData.panVatCertificate}
                  onChange={(file) =>
                    handleFileChange("panVatCertificate", file)
                  }
                />

                <FileUploadField
                  label="Business Registration Certificate *"
                  file={formData.registrationCertificate}
                  onChange={(file) =>
                    handleFileChange("registrationCertificate", file)
                  }
                />

                <FileUploadField
                  label="Owner Photo *"
                  file={formData.ownerPhoto}
                  onChange={(file) => handleFileChange("ownerPhoto", file)}
                  accept="image/*"
                />

                <FileUploadField
                  label="Citizenship Photo *"
                  file={formData.citizenshipPhoto}
                  onChange={(file) =>
                    handleFileChange("citizenshipPhoto", file)
                  }
                  accept="image/*"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> All documents will be verified by our
                  team. Please ensure all documents are clear and legible.
                  Accepted formats: JPG, PNG, PDF
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 5: Credentials */}
          {step === 5 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h3 className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <span>Create Login Credentials</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Login Email
                  </label>
                  <input
                    type="email"
                    value={formData.businessEmail}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This will be your login email
                  </p>
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Minimum 8 characters"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Re-enter password"
                  />
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> After submitting your
                  registration, your account will be reviewed by our Super
                  Admin. You will be notified via email once your account is
                  approved and you can start using the system.
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 6: Payment */}
          {step === 6 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h3 className="flex items-center gap-2 mb-4 text-xl font-semibold">
                <CreditCard className="w-6 h-6 text-indigo-600" />
                <span>Complete Payment</span>
              </h3>

              {/* Package Summary */}
              {formData.selectedPackage && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
                  <h4 className="font-semibold text-indigo-900 mb-3">
                    Package Summary
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-indigo-600">
                        Selected Package
                      </p>
                      <p className="text-lg font-bold text-indigo-900">
                        {packages[formData.selectedPackage].name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-indigo-600">Amount to Pay</p>
                      <p className="text-2xl font-bold text-indigo-900">
                        NPR{" "}
                        {packages[
                          formData.selectedPackage
                        ].price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-indigo-200">
                    <p className="text-sm text-indigo-700 font-medium mb-2">
                      Features:
                    </p>
                    <ul className="grid md:grid-cols-2 gap-2 text-sm text-indigo-600">
                      {packages[formData.selectedPackage].features.map(
                        (feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            {feature}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {/* Payment Method Selection */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-4">
                  Choose Payment Method
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* eSewa Payment Button */}
                  <button
                    type="button"
                    onClick={async () => {
                      if (!formData.selectedPackage) return;
                      setPaymentProcessing(true);

                      // Save registration data before redirecting to payment
                      const registrationId = `reg_${Date.now()}_${Math.random()
                        .toString(36)
                        .substr(2, 9)}`;
                      localStorage.setItem(
                        "pending_registration_data",
                        JSON.stringify({
                          registrationId,
                          ...formData,
                          selectedPackage: formData.selectedPackage,
                          packagePrice:
                            packages[formData.selectedPackage].price,
                        }),
                      );

                      // Initiate eSewa payment
                      try {
                        initiatePayment({
                          gateway: "esewa",
                          amount: packages[formData.selectedPackage].price,
                          transactionId: registrationId,
                          productName: `Serve Spares ${
                            packages[formData.selectedPackage].name
                          } Package`,
                          remarks: `Business Registration - ${formData.businessName}`,
                        });
                      } catch (error: any) {
                        setPaymentProcessing(false);
                        setError(
                          error.message || "Failed to initiate eSewa payment",
                        );
                      }
                    }}
                    disabled={paymentProcessing || !formData.selectedPackage}
                    className="p-6 border-2 border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                        <CreditCard className="w-8 h-8 text-white" />
                      </div>
                      <h5 className="text-lg font-semibold text-gray-800">
                        eSewa
                      </h5>
                      <p className="text-xs text-gray-500 text-center">
                        Pay with eSewa digital wallet
                      </p>
                    </div>
                  </button>

                  {/* FonePay Payment Button */}
                  <button
                    type="button"
                    onClick={async () => {
                      if (!formData.selectedPackage) return;
                      setPaymentProcessing(true);

                      // Save registration data before redirecting to payment
                      const registrationId = `reg_${Date.now()}_${Math.random()
                        .toString(36)
                        .substr(2, 9)}`;
                      localStorage.setItem(
                        "pending_registration_data",
                        JSON.stringify({
                          registrationId,
                          ...formData,
                          selectedPackage: formData.selectedPackage,
                          packagePrice:
                            packages[formData.selectedPackage].price,
                        }),
                      );

                      // Initiate FonePay payment
                      try {
                        initiatePayment({
                          gateway: "fonepay",
                          amount: packages[formData.selectedPackage].price,
                          transactionId: registrationId,
                          productName: `Serve Spares ${
                            packages[formData.selectedPackage].name
                          } Package`,
                          remarks: `Business Registration - ${formData.businessName}`,
                        });
                      } catch (error: any) {
                        setPaymentProcessing(false);
                        setError(
                          error.message || "Failed to initiate FonePay payment",
                        );
                      }
                    }}
                    disabled={paymentProcessing || !formData.selectedPackage}
                    className="p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                        <CreditCard className="w-8 h-8 text-white" />
                      </div>
                      <h5 className="text-lg font-semibold text-gray-800">
                        FonePay
                      </h5>
                      <p className="text-xs text-gray-500 text-center">
                        Pay with your bank account
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Test Payment Option */}
              <div className="border-t border-gray-200 pt-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-800">
                        For Testing Only
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Click the button below to simulate a successful payment
                        without using real payment gateways.
                        <strong> Remove this in production!</strong>
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          if (!formData.selectedPackage) return;

                          const registrationId = `reg_${Date.now()}_${Math.random()
                            .toString(36)
                            .substr(2, 9)}`;
                          const mockResult = mockPaymentSuccess(
                            "esewa",
                            registrationId,
                            packages[formData.selectedPackage].price,
                          );

                          // Update form with mock payment data
                          setFormData((prev) => ({
                            ...prev,
                            paymentId: mockResult.data.paymentId,
                            paymentMethod: mockResult.data.gateway,
                            paymentAmount: mockResult.data.amount,
                            paymentStatus: "completed",
                          }));

                          alert(
                            `✅ MOCK PAYMENT SUCCESS\n\nPayment ID: ${mockResult.data.paymentId}\nAmount: NPR ${mockResult.data.amount}\n\nNow click "Submit Registration" to complete the process.`,
                          );
                        }}
                        className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                      >
                        🧪 Simulate Successful Payment (Test Mode)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>🔒 Secure Payment:</strong> All payments are processed
                  through secure payment gateways. Your payment information is
                  encrypted and never stored on our servers.
                </p>
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            )}

            <div className="ml-auto">
              {step < 6 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Next
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Submit Registration
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
