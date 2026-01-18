import React, { useState } from "react";
import {
  Building2,
  FileText,
  Upload,
  Check,
  AlertCircle,
  Shield,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface KYCFormModalProps {
  userId: string;
  userEmail: string;
  userName: string;
  tenantId: string;
  onComplete: () => void;
}

interface KYCFormData {
  businessName: string;
  panVatNumber: string;
  businessAddress: string;
  businessPhone: string;
  ownerName: string;
  ownerCitizenship: string;
  bankName: string;
  bankAccountNumber: string;
  businessType: string;
  numberOfEmployees: string;
}

export const KYCFormModal: React.FC<KYCFormModalProps> = ({
  userId,
  userEmail,
  userName,
  tenantId,
  onComplete,
}) => {
  const [formData, setFormData] = useState<KYCFormData>({
    businessName: "",
    panVatNumber: "",
    businessAddress: "",
    businessPhone: "",
    ownerName: userName || "",
    ownerCitizenship: "",
    bankName: "",
    bankAccountNumber: "",
    businessType: "retail",
    numberOfEmployees: "1-5",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof KYCFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name as keyof KYCFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Partial<Record<keyof KYCFormData, string>> = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business name is required";
    }
    if (!formData.panVatNumber.trim()) {
      newErrors.panVatNumber = "PAN/VAT number is required";
    } else if (!/^\d{9}$/.test(formData.panVatNumber)) {
      newErrors.panVatNumber = "PAN/VAT must be 9 digits";
    }
    if (!formData.businessAddress.trim()) {
      newErrors.businessAddress = "Business address is required";
    }
    if (!formData.businessPhone.trim()) {
      newErrors.businessPhone = "Business phone is required";
    } else if (!/^\+977\d{10}$/.test(formData.businessPhone)) {
      newErrors.businessPhone = "Phone must be in format +977XXXXXXXXXX";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Partial<Record<keyof KYCFormData, string>> = {};

    if (!formData.ownerName.trim()) {
      newErrors.ownerName = "Owner name is required";
    }
    if (!formData.ownerCitizenship.trim()) {
      newErrors.ownerCitizenship = "Citizenship number is required";
    }
    if (!formData.bankName.trim()) {
      newErrors.bankName = "Bank name is required";
    }
    if (!formData.bankAccountNumber.trim()) {
      newErrors.bankAccountNumber = "Bank account number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      console.log("📝 Submitting KYC form...");
      console.log("User ID:", userId);
      console.log("Tenant ID:", tenantId);
      console.log("KYC Data:", formData);

      // Store KYC data in localStorage
      const kycData = {
        ...formData,
        userId,
        userEmail,
        tenantId,
        submittedAt: new Date().toISOString(),
      };

      localStorage.setItem("kyc_data", JSON.stringify(kycData));
      localStorage.setItem("kyc_completed", "true");
      localStorage.setItem("is_first_login", "false");

      toast.success("KYC verification completed successfully!");

      // Wait a moment then complete
      setTimeout(() => {
        onComplete();
      }, 1000);
    } catch (error) {
      console.error("Error submitting KYC:", error);
      toast.error("Failed to submit KYC. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-3 rounded-lg">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Complete Your Profile</h2>
                <p className="text-blue-100 text-sm">
                  KYC & Business Verification Required
                </p>
              </div>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-lg">
              <span className="text-sm font-semibold">
                Step {currentStep} of 2
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Welcome Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-blue-900 font-semibold mb-1">
              Welcome, {userName}!
            </p>
            <p className="text-sm text-blue-700">
              Before you can access your dashboard, we need to verify your
              business details. This is a one-time process required by Nepal's
              business regulations.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center space-x-2">
            <div
              className={`flex-1 h-2 rounded-full ${
                currentStep >= 1 ? "bg-blue-600" : "bg-gray-200"
              }`}
            />
            <div
              className={`flex-1 h-2 rounded-full ${
                currentStep >= 2 ? "bg-blue-600" : "bg-gray-200"
              }`}
            />
          </div>

          {/* Step 1: Business Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">
                  Business Information
                </h3>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.businessName ? "border-red-500" : "border-gray-200"
                  }`}
                  placeholder="ABC Auto Parts Pvt. Ltd."
                />
                {errors.businessName && (
                  <p className="text-red-600 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.businessName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  PAN/VAT Number *
                </label>
                <input
                  type="text"
                  name="panVatNumber"
                  value={formData.panVatNumber}
                  onChange={handleInputChange}
                  maxLength={9}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.panVatNumber ? "border-red-500" : "border-gray-200"
                  }`}
                  placeholder="123456789 (9 digits)"
                />
                {errors.panVatNumber && (
                  <p className="text-red-600 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.panVatNumber}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Address *
                </label>
                <input
                  type="text"
                  name="businessAddress"
                  value={formData.businessAddress}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.businessAddress
                      ? "border-red-500"
                      : "border-gray-200"
                  }`}
                  placeholder="Thamel, Pokhara"
                />
                {errors.businessAddress && (
                  <p className="text-red-600 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.businessAddress}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Phone *
                </label>
                <input
                  type="text"
                  name="businessPhone"
                  value={formData.businessPhone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.businessPhone ? "border-red-500" : "border-gray-200"
                  }`}
                  placeholder="+9779800000000"
                />
                {errors.businessPhone && (
                  <p className="text-red-600 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.businessPhone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Type *
                </label>
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="retail">Retail</option>
                  <option value="wholesale">Wholesale</option>
                  <option value="both">Both Retail & Wholesale</option>
                  <option value="service">Service Center</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Owner & Financial Information */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">
                  Owner & Financial Information
                </h3>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Owner Name *
                </label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.ownerName ? "border-red-500" : "border-gray-200"
                  }`}
                  placeholder="Full name as per citizenship"
                />
                {errors.ownerName && (
                  <p className="text-red-600 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.ownerName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Owner Citizenship Number *
                </label>
                <input
                  type="text"
                  name="ownerCitizenship"
                  value={formData.ownerCitizenship}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.ownerCitizenship
                      ? "border-red-500"
                      : "border-gray-200"
                  }`}
                  placeholder="Citizenship number"
                />
                {errors.ownerCitizenship && (
                  <p className="text-red-600 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.ownerCitizenship}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bank Name *
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.bankName ? "border-red-500" : "border-gray-200"
                  }`}
                  placeholder="e.g., Nabil Bank, Himalayan Bank"
                />
                {errors.bankName && (
                  <p className="text-red-600 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.bankName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bank Account Number *
                </label>
                <input
                  type="text"
                  name="bankAccountNumber"
                  value={formData.bankAccountNumber}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.bankAccountNumber
                      ? "border-red-500"
                      : "border-gray-200"
                  }`}
                  placeholder="Account number"
                />
                {errors.bankAccountNumber && (
                  <p className="text-red-600 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.bankAccountNumber}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Employees *
                </label>
                <select
                  name="numberOfEmployees"
                  value={formData.numberOfEmployees}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="1-5">1-5 employees</option>
                  <option value="6-10">6-10 employees</option>
                  <option value="11-20">11-20 employees</option>
                  <option value="21-50">21-50 employees</option>
                  <option value="50+">50+ employees</option>
                </select>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="px-6 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  {currentStep === 2 ? <Check className="w-5 h-5" /> : null}
                  <span>{currentStep === 2 ? "Complete KYC" : "Next"}</span>
                </>
              )}
            </button>
          </div>

          {/* Security Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs text-amber-800">
              🔒 <strong>Privacy:</strong> Your information is encrypted and
              stored securely. We comply with Nepal's data protection
              regulations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
