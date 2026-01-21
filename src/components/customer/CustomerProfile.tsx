import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Save,
  X,
  Camera,
  ShoppingBag,
  Package,
  Heart,
  Settings,
  Bell,
  Shield,
  CreditCard,
  Lock,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";

interface CustomerProfileProps {
  customerData: any;
  onUpdate: (updatedData: any) => void;
  onLogout?: () => void;
}

export const CustomerProfile: React.FC<CustomerProfileProps> = ({
  customerData,
  onUpdate,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<
    "profile" | "settings" | "security"
  >("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [customerStats, setCustomerStats] = useState<{
    total_orders?: number;
    active_orders?: number;
    favorites_count?: number;
  }>({
    total_orders: 0,
    active_orders: 0,
    favorites_count: 0,
  });
  const [formData, setFormData] = useState({
    name: customerData?.name || "",
    email: customerData?.email || "",
    phone: customerData?.phone || "",
    address: customerData?.address || "",
    profileImage: customerData?.profileImage || "",
  });
  const [profileImagePreview, setProfileImagePreview] = useState<string>(
    customerData?.profileImage || "",
  );
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Fetch customer status from API
  useEffect(() => {
    fetchCustomerStatus();
  }, []);

  const fetchCustomerStatus = async () => {
    try {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("auth_token");

      if (!token) {
        console.warn("No access token available");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/users/customer_status/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setCustomerStats({
          total_orders: data.total_orders || 0,
          active_orders: data.active_orders || 0,
          favorites_count: data.favorites_count || 0,
        });
        console.log("✅ Customer status fetched:", data);
      } else {
        console.error("Failed to fetch customer status:", response.status);
      }
    } catch (error) {
      console.error("Error fetching customer status:", error);
    }
  };

  // Add safety check for missing customerData
  if (!customerData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <User className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl text-gray-900 mb-2">
              Profile Not Available
            </h2>
            <p className="text-gray-600">Please log in to view your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("auth_token");

      // Try multiple ways to get userId
      let userId = localStorage.getItem("user_id");
      if (!userId && customerData?.id) {
        userId = customerData.id;
      }

      console.log("🔍 [handleSave] Token:", token ? "exists" : "missing");
      console.log("🔍 [handleSave] UserId:", userId);
      console.log("🔍 [handleSave] FormData:", formData);
      console.log("🔍 [handleSave] CustomerData:", customerData);
      console.log(
        "🔍 [handleSave] LocalStorage keys:",
        Object.keys(localStorage).filter(
          (k) =>
            k.includes("token") || k.includes("user") || k.includes("customer"),
        ),
      );

      if (!token || !userId) {
        toast.error("Session expired. Please log in again.");
        console.error("❌ Missing token or userId");
        console.error("   Token exists:", !!token);
        console.error(
          "   UserId from storage:",
          localStorage.getItem("user_id"),
        );
        console.error("   UserId from customerData:", customerData?.id);
        return;
      }

      // Build the update payload with only changed fields
      const updatePayload: any = {};
      let hasImageChange = false;

      if (formData.name !== customerData.name) {
        updatePayload.full_name = formData.name;
        console.log(
          "✏️ [handleSave] Name changed:",
          customerData.name,
          "→",
          formData.name,
        );
      }
      if (formData.email !== customerData.email) {
        updatePayload.email = formData.email;
        console.log(
          "✏️ [handleSave] Email changed:",
          customerData.email,
          "→",
          formData.email,
        );
      }
      if (formData.phone !== (customerData.phone || "")) {
        updatePayload.phone = formData.phone;
        console.log(
          "✏️ [handleSave] Phone changed:",
          customerData.phone,
          "→",
          formData.phone,
        );
      }
      if (formData.address !== (customerData.address || "")) {
        updatePayload.location = formData.address;
        console.log(
          "✏️ [handleSave] Address changed:",
          customerData.address,
          "→",
          formData.address,
        );
      }

      // Check if image file changed
      if (imageFile) {
        hasImageChange = true;
        console.log("✏️ [handleSave] Avatar changed (file):", imageFile.name);
      }

      console.log("📦 [handleSave] Update payload:", updatePayload);
      console.log("📦 [handleSave] Has image change:", hasImageChange);

      // Only make API call if there are changes
      if (Object.keys(updatePayload).length === 0 && !hasImageChange) {
        toast.info("No changes made");
        console.warn("[handleSave] No changes detected");
        setIsEditing(false);
        return;
      }

      console.log(
        `📡 [handleSave] Making PATCH request to /api/users/${userId}/`,
      );

      // Build request headers and body based on whether we have a file
      let requestHeaders: HeadersInit = {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      };
      let requestBody: any;

      if (hasImageChange && imageFile) {
        // Use FormData for file upload (multipart/form-data)
        const formDataToSend = new FormData();

        // Add all the text fields to FormData
        Object.keys(updatePayload).forEach((key) => {
          formDataToSend.append(key, updatePayload[key]);
        });

        // Add the image file with key 'avatar'
        formDataToSend.append("avatar", imageFile, imageFile.name);

        requestBody = formDataToSend;

        // Don't set Content-Type header when using FormData
        // Browser will set it automatically with boundary
        console.log(
          "📡 [handleSave] Sending as FormData (multipart/form-data) with file",
        );
      } else {
        // Use JSON for text-only updates
        requestHeaders["Content-Type"] = "application/json";
        requestBody = JSON.stringify(updatePayload);
        console.log("📡 [handleSave] Sending as JSON");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/users/${userId}/`,
        {
          method: "PATCH",
          headers: requestHeaders,
          body: requestBody,
        },
      );

      console.log("📥 [handleSave] Response status:", response.status);

      if (response.ok) {
        const updatedData = await response.json();
        console.log("✅ [handleSave] API response:", updatedData);

        // Update local state with API response
        const updatedCustomer = {
          ...customerData,
          name: updatedData.full_name || formData.name,
          email: updatedData.email || formData.email,
          phone: updatedData.phone || formData.phone,
          address: updatedData.location || formData.address,
          profileImage: updatedData.avatar || formData.profileImage,
        };

        // Update localStorage
        const customers = JSON.parse(localStorage.getItem("customers") || "[]");
        const updatedCustomers = customers.map((c: any) =>
          c.id === customerData.id ? updatedCustomer : c,
        );
        localStorage.setItem("customers", JSON.stringify(updatedCustomers));

        // Also update customer_user
        localStorage.setItem("customer_user", JSON.stringify(updatedCustomer));

        onUpdate(updatedCustomer);
        setIsEditing(false);
        setImageFile(null); // Clear the image file after successful upload
        toast.success("Profile updated successfully!");
        console.log("✅ Profile updated:", updatedData);
      } else {
        try {
          const errorData = await response.json();
          console.error(
            "❌ [handleSave] Profile update failed:",
            response.status,
            errorData,
          );

          // Extract error message from various possible API response formats
          let errorMessage = "Failed to update profile";
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.non_field_errors?.[0]) {
            errorMessage = errorData.non_field_errors[0];
          } else if (typeof errorData === "object") {
            // Check for field-specific errors
            const fieldErrors = Object.entries(errorData)
              .filter(
                ([key, value]) =>
                  key !== "message" &&
                  key !== "detail" &&
                  key !== "status" &&
                  key !== "code",
              )
              .map(([key, value]) => {
                const errorStr = Array.isArray(value)
                  ? value.join(", ")
                  : String(value);
                const fieldName =
                  key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
                return `${fieldName}: ${errorStr}`;
              });
            if (fieldErrors.length > 0) {
              errorMessage = fieldErrors.join("\n");
            }
          }

          toast.error(errorMessage);
        } catch (parseError) {
          console.error(
            "❌ [handleSave] Failed to parse error response:",
            parseError,
          );
          console.error("❌ [handleSave] Response status:", response.status);
          console.error(
            "❌ [handleSave] Response statusText:",
            response.statusText,
          );

          let errorMessage = "Failed to update profile";
          if (response.status === 401) {
            errorMessage = "Unauthorized - Please log in again";
          } else if (response.status === 403) {
            errorMessage = "Permission denied - You cannot edit this profile";
          } else if (response.status === 404) {
            errorMessage = "User not found";
          } else if (response.status === 400) {
            errorMessage = "Invalid data - Please check your inputs";
          } else if (response.status >= 500) {
            errorMessage = "Please try again later";
          }

          toast.error(errorMessage);
        }
      }
    } catch (error: any) {
      console.error("❌ [handleSave] Catch Error:", error);
      console.error("❌ [handleSave] Error message:", error.message);
      console.error("❌ [handleSave] Error stack:", error.stack);
      toast.error(
        "An error occurred while updating your profile: " +
          (error.message || "Unknown error"),
      );
    }
  };

  const handleCancel = () => {
    setFormData({
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone || "",
      address: customerData.address || "",
      profileImage: customerData.profileImage || "",
    });
    setProfileImagePreview(customerData.profileImage || "");
    setIsEditing(false);
  };

  // Handle profile image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileImagePreview(base64String);
        // Store the actual file for upload instead of base64
        setImageFile(file);
        toast.success("Profile image selected!");
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove profile image
  const handleRemoveImage = () => {
    setProfileImagePreview("");
    setFormData({ ...formData, profileImage: "" });
    setImageFile(null);
    toast.info("Profile image removed");
  };

  const stats = [
    {
      label: "Total Orders",
      value: (customerStats.total_orders ?? 0).toString(),
      icon: ShoppingBag,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Active Orders",
      value: (customerStats.active_orders ?? 0).toString(),
      icon: Package,
      color: "from-green-500 to-green-600",
    },
    {
      label: "Wishlist Items",
      value: (customerStats.favorites_count ?? 0).toString(),
      icon: Heart,
      color: "from-red-500 to-red-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-8 mb-8 shadow-xl">
          <div className="flex items-center space-x-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 bg-white rounded-2xl overflow-hidden flex items-center justify-center shadow-lg">
                {profileImagePreview || customerData.profileImage ? (
                  <img
                    src={profileImagePreview || customerData.profileImage}
                    alt={customerData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-amber-600" />
                )}
              </div>
              <label
                htmlFor="header-image-upload"
                className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 transition-all cursor-pointer group-hover:scale-110"
              >
                <Camera className="w-5 h-5 text-amber-600" />
                <input
                  id="header-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Info */}
            <div className="flex-1 text-white">
              <h1 className="text-4xl mb-2">{customerData.name}</h1>
              <p className="text-white/90 mb-4">{customerData.email}</p>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 inline-flex">
                <Shield className="w-4 h-4" />
                <span className="text-sm">Verified Customer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl text-gray-900">{stat.value}</p>
                  </div>
                  <div
                    className={`w-14 h-14 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-sm text-gray-500 uppercase tracking-wider mb-4">
                  Account
                </h3>
                <nav className="space-y-2">
                  {[
                    { id: "profile", icon: User, label: "Profile Info" },
                    { id: "settings", icon: Settings, label: "Settings" },
                    { id: "security", icon: Lock, label: "Security" },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                          activeTab === tab.id
                            ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-6 border-t border-gray-200">
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl text-gray-900 mb-2">
                        Profile Information
                      </h2>
                      <p className="text-gray-600">
                        Manage your personal information
                      </p>
                    </div>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Edit Profile</span>
                      </button>
                    ) : (
                      <div className="flex gap-3">
                        <button
                          onClick={handleCancel}
                          className="flex items-center space-x-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                        <button
                          onClick={handleSave}
                          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* Profile Image Upload Section */}
                    <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl">
                      <label className="block text-sm text-gray-700 mb-4">
                        <Camera className="w-4 h-4 inline mr-2" />
                        Profile Picture
                      </label>

                      <div className="flex items-center gap-6">
                        {/* Current Image Preview */}
                        <div className="relative group">
                          <div className="w-32 h-32 bg-white rounded-2xl overflow-hidden flex items-center justify-center shadow-lg border-2 border-amber-300">
                            {profileImagePreview ? (
                              <img
                                src={profileImagePreview}
                                alt="Profile preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-16 h-16 text-gray-300" />
                            )}
                          </div>
                          {profileImagePreview && isEditing && (
                            <button
                              onClick={handleRemoveImage}
                              className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-all"
                              title="Remove image"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Upload Instructions */}
                        <div className="flex-1">
                          <p className="text-gray-900 mb-2">
                            Upload your profile picture
                          </p>
                          <p className="text-sm text-gray-600 mb-4">
                            JPG, PNG or GIF. Max size 5MB. Square images work
                            best.
                          </p>

                          {isEditing && (
                            <div className="flex gap-3">
                              <label className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all cursor-pointer">
                                <Camera className="w-4 h-4" />
                                <span>Choose Image</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  className="hidden"
                                />
                              </label>

                              {profileImagePreview && (
                                <button
                                  onClick={handleRemoveImage}
                                  className="flex items-center space-x-2 px-6 py-3 border-2 border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-all"
                                >
                                  <X className="w-4 h-4" />
                                  <span>Remove</span>
                                </button>
                              )}
                            </div>
                          )}

                          {!isEditing && !profileImagePreview && (
                            <p className="text-sm text-gray-500 italic">
                              No profile picture uploaded
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border rounded-xl transition-all ${
                          isEditing
                            ? "border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        <Mail className="w-4 h-4 inline mr-2" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border rounded-xl transition-all ${
                          isEditing
                            ? "border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-2" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        disabled={!isEditing}
                        placeholder="+977 123-456-7890"
                        className={`w-full px-4 py-3 border rounded-xl transition-all ${
                          isEditing
                            ? "border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        Address
                      </label>
                      <textarea
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        disabled={!isEditing}
                        rows={3}
                        placeholder="Your delivery address"
                        className={`w-full px-4 py-3 border rounded-xl transition-all ${
                          isEditing
                            ? "border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div>
                  <h2 className="text-2xl text-gray-900 mb-2">
                    Account Settings
                  </h2>
                  <p className="text-gray-600 mb-8">
                    Manage your account preferences
                  </p>

                  <div className="space-y-6">
                    {/* Email Notifications */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <Bell className="w-5 h-5 text-amber-600" />
                        <div>
                          <p className="text-gray-900">Email Notifications</p>
                          <p className="text-sm text-gray-600">
                            Receive order updates via email
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          defaultChecked
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                      </label>
                    </div>

                    {/* SMS Notifications */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-amber-600" />
                        <div>
                          <p className="text-gray-900">SMS Notifications</p>
                          <p className="text-sm text-gray-600">
                            Get SMS alerts for deliveries
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                      </label>
                    </div>

                    {/* Marketing Emails */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-amber-600" />
                        <div>
                          <p className="text-gray-900">Marketing Emails</p>
                          <p className="text-sm text-gray-600">
                            Receive promotions and offers
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          defaultChecked
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div>
                  <h2 className="text-2xl text-gray-900 mb-2">
                    Security Settings
                  </h2>
                  <p className="text-gray-600 mb-8">
                    Manage your account security
                  </p>

                  <div className="space-y-6">
                    {/* Change Password */}
                    <div className="p-6 border-2 border-gray-200 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                            <Lock className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-gray-900">Password</p>
                            <p className="text-sm text-gray-600">
                              Last changed 30 days ago
                            </p>
                          </div>
                        </div>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all">
                          Change
                        </button>
                      </div>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="p-6 border-2 border-gray-200 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-gray-900">
                              Two-Factor Authentication
                            </p>
                            <p className="text-sm text-gray-600">
                              Add an extra layer of security
                            </p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all">
                          Enable
                        </button>
                      </div>
                    </div>

                    {/* Delete Account */}
                    <div className="p-6 border-2 border-red-200 bg-red-50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-red-900 mb-1">Delete Account</p>
                          <p className="text-sm text-red-700">
                            Permanently delete your account and all data
                          </p>
                        </div>
                        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
