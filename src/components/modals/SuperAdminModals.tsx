import React, { useState } from "react";
import {
  X,
  Save,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Plus,
  Package,
  Crown,
  Sparkles,
  Mail,
  Key,
  RefreshCw,
  Copy,
  CheckCircle,
  Check,
} from "lucide-react";
import {
  AdminAccount,
  SubscriptionPackage,
} from "../SuperAdminDashboardRefined";
import { generateSecurePassword } from "../../utils/passwordUtils";

const PACKAGES = {
  basic: { name: "Basic", price: 2500 },
  professional: { name: "Professional", price: 5000 },
  enterprise: { name: "Enterprise", price: 10000 },
};

// Create Admin User Modal
export const CreateAdminUserModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>; // Updated signature to handle async
  tenantId: number;
  // Removed initialData prop requirement since we want fresh fields or controlled defaults
}> = ({ isOpen, onClose, onSave, tenantId }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    full_name: "",
    phone: "+977",
    location: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate required fields
    if (!formData.username || !formData.email) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    // Generate random password using utility
    const randomPassword = generateSecurePassword();

    // Prepare payload
    const payload = {
      username: formData.username,
      email: formData.email,
      password: randomPassword,
      password_confirm: randomPassword,
      full_name: formData.full_name,
      phone: formData.phone,
      location: formData.location,
      tenant: tenantId,
      role: "admin",
      status: "active",
      is_active: true,
    };

    try {
      await onSave(payload);
      // Success is handled by parent (closing modal), but if onSave throws, we catch it here
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "An error occurred");
    }
  };

  const handleNameChange = (val: string) => {
    setFormData({
      ...formData,
      full_name: val,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Create Admin Account</h2>
              <p className="text-blue-100 text-xs">
                Step 2: Set up admin credentials (Password will be
                auto-generated)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm font-medium whitespace-pre-line">
                {error}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username *
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="username"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+977"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="City, Country"
              />
            </div>

            <div className="md:col-span-2 bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start space-x-3">
              <div className="bg-blue-500 text-white p-1 rounded-full flex-shrink-0">
                <Check className="w-3 h-3" />
              </div>
              <p className="text-sm text-blue-800">
                A strong, random password will be auto-generated for this
                account. You can view it and send it via email after creation.
              </p>
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium flex items-center justify-center space-x-2 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Create Admin Account</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add Admin Modal (Step 1: Tenant Registration)
export const AddAdminModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    panVatNumber: "",
    businessLocation: "",
    package: "basic" as SubscriptionPackage,
    demoMode: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setFormData({
      name: "",
      email: "",
      phone: "",
      businessName: "",
      panVatNumber: "",
      businessLocation: "",
      package: "basic",
      demoMode: false,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Plus className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold">Tenant Registration</h2>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tenant Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="+977"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) =>
                  setFormData({ ...formData, businessName: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="ABC Auto Parts"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                PAN/VAT Number *
              </label>
              <input
                type="text"
                required
                value={formData.panVatNumber}
                onChange={(e) =>
                  setFormData({ ...formData, panVatNumber: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="123456789"
              />
              <p className="text-xs text-gray-500 mt-1">
                Used as Tenant ID for database isolation
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Business Location
              </label>
              <input
                type="text"
                value={formData.businessLocation}
                onChange={(e) =>
                  setFormData({ ...formData, businessLocation: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Pokhara, Nepal"
              />
            </div>
          </div>

          {/* Demo Mode Toggle */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="demoMode"
                checked={formData.demoMode}
                onChange={(e) =>
                  setFormData({ ...formData, demoMode: e.target.checked })
                }
                className="mt-1 w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
              />
              <div className="flex-1">
                <label
                  htmlFor="demoMode"
                  className="block font-semibold text-gray-900 cursor-pointer"
                >
                  Enable Demo Mode
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  Demo mode allows admin to test the system with sample data. No
                  real transactions will be processed.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all flex items-center justify-center space-x-2 font-semibold"
            >
              <Save className="w-5 h-5" />
              <span>Create Admin Account</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// View Admin Modal
export const ViewAdminModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  admin: AdminAccount | null;
}> = ({ isOpen, onClose, admin }) => {
  if (!isOpen || !admin) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{admin.businessName}</h2>
              <p className="text-blue-100 text-sm">Admin Account Details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Name</p>
                <p className="font-semibold text-gray-900">
                  {admin.name || admin.contactPerson || "N/A"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="font-semibold text-gray-900">{admin.email}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Phone</p>
                <p className="font-semibold text-gray-900">
                  {admin.phone || "N/A"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Business Name</p>
                <p className="font-semibold text-gray-900">
                  {admin.businessName}
                </p>
              </div>
            </div>
          </div>

          {/* Subscription Details */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Subscription Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                <p className="text-xs text-purple-600 mb-1">Package</p>
                <p className="font-bold text-purple-900 capitalize">
                  {admin.package}
                </p>
                <p className="text-sm text-purple-700">
                  NPR {admin.packagePrice || 0}/month
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    admin.status === "active"
                      ? "bg-green-100 text-green-700"
                      : admin.status === "suspended"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {admin.status.toUpperCase()}
                </span>
              </div>
              <div
                className={`p-4 rounded-xl border-2 ${
                  admin.demoMode
                    ? "bg-amber-50 border-amber-300"
                    : "bg-blue-50 border-blue-300"
                }`}
              >
                <p
                  className={`text-xs mb-1 ${
                    admin.demoMode ? "text-amber-600" : "text-blue-600"
                  }`}
                >
                  Account Mode
                </p>
                <p
                  className={`font-bold ${
                    admin.demoMode ? "text-amber-900" : "text-blue-900"
                  }`}
                >
                  {admin.demoMode ? "🔸 DEMO MODE" : "⚡ LIVE MODE"}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    admin.demoMode ? "text-amber-700" : "text-blue-700"
                  }`}
                >
                  {admin.demoMode
                    ? "Testing with sample data"
                    : "Real transactions active"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Start Date</p>
                <p className="font-semibold text-gray-900">
                  {admin.subscriptionStartDate
                    ? new Date(admin.subscriptionStartDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">End Date</p>
                <p className="font-semibold text-gray-900">
                  {admin.subscriptionEndDate
                    ? new Date(admin.subscriptionEndDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Business Metrics */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Business Metrics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <p className="text-xs text-green-600 mb-1">Revenue</p>
                <p className="font-bold text-green-900">
                  Rs{(admin.totalRevenue || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <p className="text-xs text-blue-600 mb-1">Customers</p>
                <p className="font-bold text-blue-900">
                  {admin.totalCustomers || 0}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                <p className="text-xs text-purple-600 mb-1">Sales</p>
                <p className="font-bold text-purple-900">
                  {admin.totalSales || 0}
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                <p className="text-xs text-orange-600 mb-1">Branches</p>
                <p className="font-bold text-orange-900">
                  {admin.branches || 0}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Users</p>
                <p className="font-semibold text-gray-900">
                  {admin.users || 0}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Products</p>
                <p className="font-semibold text-gray-900">
                  {(admin.products || 0).toLocaleString()}
                </p>
              </div>
              <div
                className={`p-4 rounded-xl ${
                  (admin.dueAmount || 0) > 0
                    ? "bg-red-50 border border-red-200"
                    : "bg-green-50 border border-green-200"
                }`}
              >
                <p
                  className={`text-xs mb-1 ${
                    (admin.dueAmount || 0) > 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  Due Amount
                </p>
                <p
                  className={`font-bold ${
                    (admin.dueAmount || 0) > 0
                      ? "text-red-900"
                      : "text-green-900"
                  }`}
                >
                  {(admin.dueAmount || 0) > 0
                    ? `Rs${(admin.dueAmount || 0).toLocaleString()}`
                    : "Paid"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Last Payment</p>
                <p className="font-semibold text-gray-900 text-xs">
                  {admin.lastPaymentDate
                    ? new Date(admin.lastPaymentDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-all font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export const EditAdminModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  admin: AdminAccount | null;
  onSave: (data: any) => void;
}> = ({ isOpen, onClose, admin, onSave }) => {
  const [formData, setFormData] = useState({
    name: admin?.name || "",
    email: admin?.email || "",
    phone: admin?.phone || "",
    businessName: admin?.businessName || "",
    package: (admin?.package || "basic") as SubscriptionPackage,
    status: admin?.status || "active",
    demoMode: admin?.demoMode || false,
  });

  React.useEffect(() => {
    if (admin) {
      setFormData({
        name: admin.name || admin.contactPerson || "",
        email: admin.email,
        phone: admin.phone || "",
        businessName: admin.businessName,
        package: admin.package,
        status: admin.status,
        demoMode: admin.demoMode || false,
      });
    }
  }, [admin]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen || !admin) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Edit className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold">Edit Admin Account</h2>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Admin Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="+977"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Business Name
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) =>
                  setFormData({ ...formData, businessName: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Package
              </label>
              <select
                value={formData.package}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    package: e.target.value as SubscriptionPackage,
                  })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="basic">Basic - NPR 2,500/mo</option>
                <option value="professional">
                  Professional - NPR 5,000/mo
                </option>
                <option value="enterprise">Enterprise - NPR 10,000/mo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as
                      | "active"
                      | "suspended"
                      | "expired",
                  })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          {/* Demo Mode Toggle */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="editDemoMode"
                checked={formData.demoMode}
                onChange={(e) =>
                  setFormData({ ...formData, demoMode: e.target.checked })
                }
                className="mt-1 w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
              />
              <div className="flex-1">
                <label
                  htmlFor="editDemoMode"
                  className="block font-semibold text-gray-900 cursor-pointer"
                >
                  Enable Demo Mode
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  Demo mode allows admin to test the system with sample data. No
                  real transactions will be processed.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all flex items-center justify-center space-x-2 font-semibold"
            >
              <Save className="w-5 h-5" />
              <span>Save Changes</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Confirmation Modal
export const DeleteAdminModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  admin: AdminAccount | null;
  onConfirm: () => void;
}> = ({ isOpen, onClose, admin, onConfirm }) => {
  if (!isOpen || !admin) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 flex items-center space-x-3 rounded-t-2xl">
          <div className="bg-white/20 p-2 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold">Delete Admin Account</h2>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete{" "}
            <span className="font-bold text-gray-900">
              {admin.businessName}
            </span>
            ?
          </p>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-800">
              <span className="font-semibold">Warning:</span> This action cannot
              be undone. All data associated with this admin account will be
              permanently deleted.
            </p>
          </div>

          <div className="flex items-center space-x-4 pt-4">
            <button
              onClick={onConfirm}
              className="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-all flex items-center justify-center space-x-2 font-semibold"
            >
              <Trash2 className="w-5 h-5" />
              <span>Delete Account</span>
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
