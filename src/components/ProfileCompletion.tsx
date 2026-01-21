import React, { useState } from "react";
import { motion } from "motion/react";
import {
  User,
  Building,
  Phone,
  MapPin,
  FileText,
  ArrowRight,
  Upload,
  X,
} from "lucide-react";

interface ProfileCompletionProps {
  userEmail: string;
  onComplete: () => void;
  onSkip?: () => void;
}

export const ProfileCompletion: React.FC<ProfileCompletionProps> = ({
  userEmail,
  onComplete,
  onSkip,
}) => {
  const [profileData, setProfileData] = useState({
    businessName: "",
    ownerName: "",
    phone: "+977",
    address: "",
    panVatNumber: "",
    password: "",
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "application/pdf",
      ];
      if (allowedTypes.includes(file.type)) {
        setUploadedFile(file);
      } else {
        alert("Please upload a PNG, JPG, or PDF file");
      }
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Get current user and update their profile
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const currentUser = JSON.parse(
        localStorage.getItem("currentUser") || "{}"
      );

      const updatedUsers = users.map((user: any) => {
        if (user.id === currentUser.id) {
          return {
            ...user,
            name: profileData.ownerName,
            businessName: profileData.businessName,
            phone: profileData.phone,
            address: profileData.address,
            panVatNumber: profileData.panVatNumber,
            password: profileData.password,
            profileComplete: true,
          };
        }
        return user;
      });

      localStorage.setItem("users", JSON.stringify(updatedUsers));

      // Update current user
      const updatedCurrentUser = updatedUsers.find(
        (u: any) => u.id === currentUser.id
      );
      localStorage.setItem("currentUser", JSON.stringify(updatedCurrentUser));
      localStorage.removeItem("needsProfileCompletion");

      setTimeout(() => {
        onComplete();
      }, 500);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      localStorage.removeItem("needsProfileCompletion");
      onSkip();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 md:p-12"
      >
        <div className="mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
            <User className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Complete Your Profile
          </h2>
          <p className="text-gray-600">
            Let's set up your account. This helps us personalize your
            experience.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Logged in as:{" "}
            <span className="font-medium text-indigo-600">{userEmail}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Building className="text-gray-400" size={20} />
              </div>
              <input
                type="text"
                value={profileData.businessName}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    businessName: e.target.value,
                  })
                }
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                placeholder="Your Auto Parts Shop"
                required
              />
            </div>
          </div>

          {/* Owner Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="text-gray-400" size={20} />
              </div>
              <input
                type="text"
                value={profileData.ownerName}
                onChange={(e) =>
                  setProfileData({ ...profileData, ownerName: e.target.value })
                }
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="text-gray-400" size={20} />
              </div>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({ ...profileData, phone: e.target.value })
                }
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                placeholder="+977"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Create Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FileText className="text-gray-400" size={20} />
              </div>
              <input
                type="password"
                value={profileData.password}
                onChange={(e) =>
                  setProfileData({ ...profileData, password: e.target.value })
                }
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                placeholder="Create a secure password"
                required
                minLength={6}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MapPin className="text-gray-400" size={20} />
              </div>
              <input
                type="text"
                value={profileData.address}
                onChange={(e) =>
                  setProfileData({ ...profileData, address: e.target.value })
                }
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                placeholder="Pokhara, Nepal"
                required
              />
            </div>
          </div>

          {/* PAN/VAT Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PAN/VAT Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FileText className="text-gray-400" size={20} />
              </div>
              <input
                type="text"
                value={profileData.panVatNumber}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    panVatNumber: e.target.value,
                  })
                }
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                placeholder="123456789"
                required
              />
            </div>
          </div>

          {/* Document Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Verification Document{" "}
              <span className="text-gray-500">(Optional)</span>
            </label>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".png,.jpg,.jpeg,.pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div
                className={`w-full py-3 px-4 border-2 ${
                  uploadedFile
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-indigo-500"
                } rounded-xl flex items-center justify-between transition-all cursor-pointer`}
              >
                <div className="flex items-center space-x-3">
                  <Upload
                    size={20}
                    className={
                      uploadedFile ? "text-green-600" : "text-gray-400"
                    }
                  />
                  <span
                    className={`text-sm ${
                      uploadedFile
                        ? "text-green-700 font-medium"
                        : "text-gray-600"
                    }`}
                  >
                    {uploadedFile
                      ? uploadedFile.name
                      : "Click to upload document (PNG, JPG, PDF)"}
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
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <motion.button
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              type="submit"
              disabled={isLoading}
              className={`flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:shadow-lg transition-all ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>Complete Profile</span>
                  <ArrowRight size={20} />
                </>
              )}
            </motion.button>

            {onSkip && (
              <button
                type="button"
                onClick={handleSkip}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Skip for Now
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500 text-center">
            You can complete or update your profile later from settings
          </p>
        </form>
      </motion.div>
    </div>
  );
};
