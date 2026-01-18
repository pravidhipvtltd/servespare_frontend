import React, { useState } from "react";
import {
  Building2,
  FileText,
  Upload,
  Check,
  AlertCircle,
  Eye,
  X,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

interface BusinessVerificationProps {
  adminEmail: string;
  onComplete: (data: BusinessVerificationData) => void;
  onCancel: () => void;
}

export interface BusinessVerificationData {
  businessName: string;
  panVatNumber: string;
  panVatCertificate: string; // Base64 encoded image
  ownerCitizenship: string; // Base64 encoded image
  privacyPolicyAccepted: boolean;
  submittedAt: string;
}

export const BusinessVerification: React.FC<BusinessVerificationProps> = ({
  adminEmail,
  onComplete,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    businessName: "",
    panVatNumber: "",
    panVatCertificate: null as File | null,
    ownerCitizenship: null as File | null,
    privacyPolicyAccepted: false,
  });

  const [previews, setPreviews] = useState({
    panVatCertificate: "",
    ownerCitizenship: "",
  });

  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPG, PNG, or WebP)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviews((prev) => ({
        ...prev,
        [fieldName]: event.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);

    setFormData((prev) => ({
      ...prev,
      [fieldName]: file,
    }));

    // Clear error for this field
    if (errors[fieldName]) {
      setErrors((prev: any) => ({ ...prev, [fieldName]: "" }));
    }

    toast.success("Document uploaded successfully");
  };

  const removeFile = (fieldName: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: null,
    }));
    setPreviews((prev) => ({
      ...prev,
      [fieldName]: "",
    }));
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business name is required";
    }

    if (!formData.panVatNumber.trim()) {
      newErrors.panVatNumber = "PAN/VAT number is required";
    } else if (!/^\d{9}$/.test(formData.panVatNumber)) {
      newErrors.panVatNumber = "PAN/VAT number must be 9 digits";
    }

    if (!formData.panVatCertificate) {
      newErrors.panVatCertificate = "PAN/VAT certificate is required";
    }

    if (!formData.ownerCitizenship) {
      newErrors.ownerCitizenship = "Owner citizenship is required";
    }

    if (!formData.privacyPolicyAccepted) {
      newErrors.privacyPolicyAccepted = "You must accept the privacy policy";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert files to base64
      const panVatBase64 = await fileToBase64(formData.panVatCertificate!);
      const citizenshipBase64 = await fileToBase64(formData.ownerCitizenship!);

      const verificationData: BusinessVerificationData = {
        businessName: formData.businessName,
        panVatNumber: formData.panVatNumber,
        panVatCertificate: panVatBase64,
        ownerCitizenship: citizenshipBase64,
        privacyPolicyAccepted: formData.privacyPolicyAccepted,
        submittedAt: new Date().toISOString(),
      };

      // Store in localStorage
      localStorage.setItem(
        "business_verification",
        JSON.stringify(verificationData)
      );
      localStorage.setItem("business_verified", "true");

      toast.success("Business verification completed successfully!");

      // Wait a moment before calling onComplete
      setTimeout(() => {
        onComplete(verificationData);
      }, 1000);
    } catch (error) {
      console.error("Error submitting verification:", error);
      toast.error("Failed to submit verification. Please try again.");
      setIsSubmitting(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Business Verification
            </h1>
            <p className="text-lg text-gray-600 mb-2">Welcome, {adminEmail}</p>
            <p className="text-gray-500">
              Please complete your business verification to continue
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <form onSubmit={handleSubmit}>
              {/* Business Name */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  placeholder="Enter your business name"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.businessName ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.businessName && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.businessName}
                  </p>
                )}
              </div>

              {/* PAN/VAT Number */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  PAN/VAT Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="panVatNumber"
                  value={formData.panVatNumber}
                  onChange={handleInputChange}
                  placeholder="Enter 9-digit PAN/VAT number"
                  maxLength={9}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.panVatNumber ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.panVatNumber && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.panVatNumber}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Enter your 9-digit PAN/VAT registration number
                </p>
              </div>

              {/* PAN/VAT Certificate Upload */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  PAN/VAT Certificate <span className="text-red-500">*</span>
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 ${
                    errors.panVatCertificate
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                >
                  {previews.panVatCertificate ? (
                    <div className="space-y-3">
                      <div className="relative">
                        <img
                          src={previews.panVatCertificate}
                          alt="PAN/VAT Certificate"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile("panVatCertificate")}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-green-600 flex items-center">
                        <Check className="w-4 h-4 mr-1" />
                        Certificate uploaded successfully
                      </p>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleFileUpload(e, "panVatCertificate")
                        }
                        className="hidden"
                      />
                      <div className="text-center">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-gray-700 mb-1">
                          Click to upload PAN/VAT Certificate
                        </p>
                        <p className="text-xs text-gray-500">
                          JPG, PNG, or WebP (Max 5MB)
                        </p>
                      </div>
                    </label>
                  )}
                </div>
                {errors.panVatCertificate && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.panVatCertificate}
                  </p>
                )}
              </div>

              {/* Owner Citizenship Upload */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Owner Citizenship <span className="text-red-500">*</span>
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 ${
                    errors.ownerCitizenship
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                >
                  {previews.ownerCitizenship ? (
                    <div className="space-y-3">
                      <div className="relative">
                        <img
                          src={previews.ownerCitizenship}
                          alt="Owner Citizenship"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile("ownerCitizenship")}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-green-600 flex items-center">
                        <Check className="w-4 h-4 mr-1" />
                        Citizenship uploaded successfully
                      </p>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleFileUpload(e, "ownerCitizenship")
                        }
                        className="hidden"
                      />
                      <div className="text-center">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-gray-700 mb-1">
                          Click to upload Owner Citizenship
                        </p>
                        <p className="text-xs text-gray-500">
                          JPG, PNG, or WebP (Max 5MB)
                        </p>
                      </div>
                    </label>
                  )}
                </div>
                {errors.ownerCitizenship && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.ownerCitizenship}
                  </p>
                )}
              </div>

              {/* Privacy Policy Checkbox */}
              <div className="mb-6">
                <div
                  className={`border rounded-lg p-4 ${
                    errors.privacyPolicyAccepted
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      name="privacyPolicyAccepted"
                      checked={formData.privacyPolicyAccepted}
                      onChange={handleInputChange}
                      className="mt-1 mr-3 h-5 w-5 text-orange-600 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">
                      I agree to the{" "}
                      <button
                        type="button"
                        onClick={() => setShowPrivacyPolicy(true)}
                        className="text-orange-600 font-semibold hover:underline"
                      >
                        Privacy Policy
                      </button>{" "}
                      and{" "}
                      <button
                        type="button"
                        onClick={() => setShowPrivacyPolicy(true)}
                        className="text-orange-600 font-semibold hover:underline"
                      >
                        Terms of Service
                      </button>
                      . I confirm that all the information provided is accurate
                      and that I have the authority to register this business.
                      <span className="text-red-500"> *</span>
                    </span>
                  </label>
                </div>
                {errors.privacyPolicyAccepted && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.privacyPolicyAccepted}
                  </p>
                )}
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">
                      Your Information is Secure
                    </p>
                    <p className="text-blue-700">
                      All documents are encrypted and stored securely. Your
                      information will only be used for verification purposes
                      and will not be shared with third parties.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between space-x-4">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                    isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-orange-500 to-red-600 hover:shadow-lg"
                  } text-white`}
                >
                  {isSubmitting ? "Submitting..." : "Submit Verification"}
                </button>
              </div>
            </form>
          </div>

          {/* Footer Note */}
          <div className="text-center text-sm text-gray-500">
            <p>
              Need help? Contact our support team at support@servespares.com
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      {showPrivacyPolicy && (
        <PrivacyPolicyModal onClose={() => setShowPrivacyPolicy(false)} />
      )}
    </>
  );
};

// Privacy Policy Modal Component
const PrivacyPolicyModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Privacy Policy & Terms of Service
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose max-w-none">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h3>

            <p className="text-gray-700 mb-4">
              <strong>Last Updated:</strong> December 6, 2025
            </p>

            <h4 className="font-semibold text-gray-900 mb-2">
              1. Information We Collect
            </h4>
            <p className="text-gray-700 mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Business name and PAN/VAT registration details</li>
              <li>Business owner identification documents (citizenship)</li>
              <li>Contact information (email, phone number)</li>
              <li>Payment and billing information</li>
              <li>Inventory and sales data entered into the system</li>
            </ul>

            <h4 className="font-semibold text-gray-900 mb-2">
              2. How We Use Your Information
            </h4>
            <p className="text-gray-700 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Verify your business registration and identity</li>
              <li>Provide, maintain, and improve our services</li>
              <li>Process your payments and transactions</li>
              <li>Send you technical notices and support messages</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h4 className="font-semibold text-gray-900 mb-2">
              3. Information Security
            </h4>
            <p className="text-gray-700 mb-4">
              We implement appropriate technical and organizational measures to
              protect your personal information against unauthorized access,
              alteration, disclosure, or destruction. All documents are
              encrypted and stored securely.
            </p>

            <h4 className="font-semibold text-gray-900 mb-2">
              4. Data Retention
            </h4>
            <p className="text-gray-700 mb-4">
              We retain your information for as long as your account is active
              or as needed to provide you services. We will retain and use your
              information as necessary to comply with legal obligations.
            </p>

            <h4 className="font-semibold text-gray-900 mb-2">5. Your Rights</h4>
            <p className="text-gray-700 mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Object to processing of your information</li>
              <li>Request data portability</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-900 mb-4 mt-8">
              Terms of Service
            </h3>

            <h4 className="font-semibold text-gray-900 mb-2">
              1. Account Registration
            </h4>
            <p className="text-gray-700 mb-4">
              You must provide accurate and complete information during
              registration. You are responsible for maintaining the
              confidentiality of your account credentials.
            </p>

            <h4 className="font-semibold text-gray-900 mb-2">
              2. Acceptable Use
            </h4>
            <p className="text-gray-700 mb-4">
              You agree not to misuse the service or help anyone else do so. You
              will not use the service for any illegal or unauthorized purpose.
            </p>

            <h4 className="font-semibold text-gray-900 mb-2">
              3. Payment Terms
            </h4>
            <p className="text-gray-700 mb-4">
              Payment is due on the billing date specified in your subscription.
              All fees are in NPR (Nepalese Rupees). Subscriptions auto-renew
              unless cancelled before the renewal date.
            </p>

            <h4 className="font-semibold text-gray-900 mb-2">
              4. Cancellation & Refunds
            </h4>
            <p className="text-gray-700 mb-4">
              You may cancel your subscription at any time. If you cancel within
              14 days of purchase, you will receive a full refund. After 14
              days, no refunds will be provided for the current billing period.
            </p>

            <h4 className="font-semibold text-gray-900 mb-2">
              5. Limitation of Liability
            </h4>
            <p className="text-gray-700 mb-4">
              The service is provided &quot;as is&quot; without warranties of
              any kind. We are not liable for any indirect, incidental, or
              consequential damages arising from your use of the service.
            </p>

            <h4 className="font-semibold text-gray-900 mb-2">
              6. Contact Information
            </h4>
            <p className="text-gray-700 mb-4">
              For questions about these terms or our privacy practices, contact
              us at:
              <br />
              Email: support@servespares.com
              <br />
              Phone: +977-XX-XXXXXX
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
