import React, { useState } from "react";
import {
  X,
  Save,
  Check,
  CreditCard,
  TrendingUp,
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Package as PackageIcon,
  Crown,
  Sparkles,
} from "lucide-react";
import {
  AdminAccount,
  SubscriptionPackage,
} from "../SuperAdminDashboardRefined";
import { toast } from "sonner";

const PACKAGES = {
  basic: {
    name: "Basic",
    price: 2500,
    icon: PackageIcon,
    color: "blue",
    planId: 1,
  },
  professional: {
    name: "Professional",
    price: 5000,
    icon: Crown,
    color: "purple",
    planId: 2,
  },
  enterprise: {
    name: "Enterprise",
    price: 10000,
    icon: Sparkles,
    color: "orange",
    planId: 3,
  },
};

// Renew Subscription Modal
export const RenewSubscriptionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  admin: AdminAccount | null;
  onConfirm: (months: number) => void;
}> = ({ isOpen, onClose, admin, onConfirm }) => {
  const [months, setMonths] = useState(12);
  const [isLoading, setIsLoading] = useState(false);

  const handleRenew = async () => {
    if (!admin?.id) {
      toast.error("Invalid admin account");
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");

      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/subscription/subscriptions/${
          admin.id
        }/renew/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            months: months,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(`Subscription renewed for ${months} months!`);
        onConfirm(months);
        onClose();
      } else {
        const error = await response.json().catch(() => ({}));
        toast.error(
          error.detail || error.message || "Failed to renew subscription"
        );
      }
    } catch (error) {
      console.error("Error renewing subscription:", error);
      toast.error("Failed to renew subscription. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !admin) return null;

  const totalAmount = admin.packagePrice * months;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Renew Subscription</h2>
              <p className="text-blue-100 text-sm">{admin.businessName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-700">Current Package</span>
              <span className="font-bold text-blue-900 capitalize">
                {admin.package}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">Monthly Price</span>
              <span className="font-bold text-blue-900">
                NPR {admin.packagePrice.toLocaleString()}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Renewal Period
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[6, 12, 24].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMonths(m)}
                  className={`p-4 border-2 rounded-xl transition-all ${
                    months === m
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="font-bold text-gray-900">{m}</p>
                  <p className="text-xs text-gray-600">months</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Total Amount</p>
                <p className="text-xs text-green-600">
                  {months} months × NPR {admin.packagePrice.toLocaleString()}
                </p>
              </div>
              <p className="text-2xl font-bold text-green-900">
                NPR {totalAmount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRenew}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-5 h-5" />
              <span>{isLoading ? "Processing..." : "Renew Subscription"}</span>
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

// Upgrade Package Modal
export const UpgradePackageModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  admin: AdminAccount | null;
  onConfirm: (newPackage: SubscriptionPackage) => void;
}> = ({ isOpen, onClose, admin, onConfirm }) => {
  const [selectedPackage, setSelectedPackage] =
    useState<SubscriptionPackage>("professional");

  const handleUpgrade = () => {
    onConfirm(selectedPackage);
    onClose();
  };

  if (!isOpen || !admin) return null;

  const availablePackages =
    admin.package === "basic"
      ? (["professional", "enterprise"] as SubscriptionPackage[])
      : admin.package === "professional"
      ? (["enterprise"] as SubscriptionPackage[])
      : [];

  if (availablePackages.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Already on Top Tier
            </h3>
            <p className="text-gray-600 mb-4">
              This account is already on the highest package available.
            </p>
            <button
              onClick={onClose}
              className="bg-blue-500 text-white px-6 py-2 rounded-xl hover:bg-blue-600 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Upgrade Package</h2>
              <p className="text-purple-100 text-sm">{admin.businessName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Package</p>
                <p className="font-bold text-gray-900 capitalize">
                  {admin.package}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Current Price</p>
                <p className="font-bold text-gray-900">
                  NPR {admin.packagePrice.toLocaleString()}/mo
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select New Package
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availablePackages.map((pkg) => (
                <button
                  key={pkg}
                  type="button"
                  onClick={() => setSelectedPackage(pkg)}
                  className={`p-6 border-2 rounded-xl transition-all text-left ${
                    selectedPackage === pkg
                      ? "border-purple-500 bg-purple-50 shadow-lg"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-lg font-bold text-gray-900 capitalize">
                      {pkg}
                    </p>
                    {selectedPackage === pkg && (
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-purple-600 mb-3">
                    NPR {PACKAGES[pkg].price.toLocaleString()}/mo
                  </p>
                  <div className="space-y-2 text-sm text-gray-600">
                    {pkg === "professional" && (
                      <>
                        <p>• Up to 10 users</p>
                        <p>• 10,000 products</p>
                        <p>• 5 branches</p>
                        <p>• Priority support</p>
                      </>
                    )}
                    {pkg === "enterprise" && (
                      <>
                        <p>• Unlimited users</p>
                        <p>• Unlimited products</p>
                        <p>• Unlimited branches</p>
                        <p>• 24/7 support</p>
                      </>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">New Monthly Price</p>
                <p className="text-xs text-green-600">
                  Starting from next billing cycle
                </p>
              </div>
              <p className="text-2xl font-bold text-green-900">
                NPR {PACKAGES[selectedPackage].price.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleUpgrade}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-semibold flex items-center justify-center space-x-2"
            >
              <TrendingUp className="w-5 h-5" />
              <span>Upgrade Package</span>
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

// Mark as Paid Modal
export const MarkAsPaidModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  admin: AdminAccount | null;
  onConfirm: () => void;
}> = ({ isOpen, onClose, admin, onConfirm }) => {
  const [paymentMethod, setPaymentMethod] = useState<
    "esewa" | "fonepay" | "bank" | "cash"
  >("esewa");

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  if (!isOpen || !admin) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Mark as Paid</h2>
              <p className="text-green-100 text-sm">{admin.businessName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">Due Amount</p>
                <p className="text-xs text-red-600">Outstanding balance</p>
              </div>
              <p className="text-2xl font-bold text-red-900">
                NPR {admin.dueAmount.toLocaleString()}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "esewa", label: "eSewa" },
                { value: "fonepay", label: "FonePay" },
                { value: "bank", label: "Bank Transfer" },
                { value: "cash", label: "Cash" },
              ].map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setPaymentMethod(method.value as any)}
                  className={`p-3 border-2 rounded-xl transition-all ${
                    paymentMethod === method.value
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="font-semibold text-gray-900">{method.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-green-800">
              <Check className="w-5 h-5" />
              <div>
                <p className="font-semibold">Payment will be recorded</p>
                <p className="text-xs text-green-600">
                  Due amount will be cleared and last payment date will be
                  updated
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleConfirm}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-semibold flex items-center justify-center space-x-2"
            >
              <Check className="w-5 h-5" />
              <span>Confirm Payment</span>
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

// NEW: Manage Plan Modal (Bi-Directional: Upgrade & Downgrade)
export const ManagePlanModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  admin: AdminAccount | null;
  onConfirm: (newPackage: SubscriptionPackage) => void;
}> = ({ isOpen, onClose, admin, onConfirm }) => {
  const [selectedPackage, setSelectedPackage] = useState<SubscriptionPackage>(
    admin?.package || "basic"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [backendPlans, setBackendPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  // Fetch subscription plans from backend
  React.useEffect(() => {
    const fetchPlans = async () => {
      if (!isOpen) return;

      try {
        setLoadingPlans(true);
        const token = localStorage.getItem("accessToken");

        const response = await fetch(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/subscription/subscription-plans/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setBackendPlans(data.results || []);
          console.log("✅ Fetched backend plans:", data.results);
        } else {
          console.error("Failed to fetch subscription plans");
          toast.error("Failed to load subscription plans");
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
        toast.error("Failed to load subscription plans");
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchPlans();
  }, [isOpen]);

  const handleChangePlan = async () => {
    if (selectedPackage === admin?.package) return;

    if (!admin?.id) {
      toast.error("Invalid admin account");
      return;
    }

    // Find the selected plan from backend plans
    const selectedPlan = backendPlans.find(
      (plan) => plan.plan_name.toLowerCase() === selectedPackage.toLowerCase()
    );

    if (!selectedPlan) {
      toast.error(`Plan "${selectedPackage}" not found in backend`);
      console.error("Available plans:", backendPlans);
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");

      if (!token) {
        toast.error("Authentication required");
        return;
      }

      // Fetch the subscription to get the actual tenant ID
      console.log("🔍 Fetching subscription for admin.id:", admin.id);
      const subscriptionResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/subscription/subscriptions/${
          admin.id
        }/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (!subscriptionResponse.ok) {
        toast.error("Failed to fetch subscription details");
        return;
      }

      const subscription = await subscriptionResponse.json();
      const tenantId = subscription.tenant;

      console.log("🔍 Admin object:", admin);
      console.log("🔍 admin.id:", admin.id);
      console.log("🔍 Subscription data:", subscription);
      console.log("🔍 Tenant ID from subscription:", tenantId);
      console.log("🔍 Selected plan from backend:", selectedPlan);
      console.log(
        "🔍 Sending tenant_id:",
        tenantId,
        "new_plan_id:",
        selectedPlan.id
      );

      if (!tenantId) {
        toast.error("Invalid tenant ID in subscription");
        return;
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/subscription/subscriptions/change_plan/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            tenant_id: tenantId,
            new_plan_id: selectedPlan.id,
          }),
        }
      );

      console.log("📡 Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        const isUpgrade = selectedPackageIndex > currentPackageIndex;
        toast.success(
          `Successfully ${
            isUpgrade ? "upgraded" : "downgraded"
          } to ${selectedPackage} plan!`
        );
        onConfirm(selectedPackage);
        onClose();
      } else {
        const error = await response.json().catch(() => ({}));
        console.log("❌ Error response:", error);
        toast.error(
          error.detail ||
            error.message ||
            `Failed to change plan. Tenant ID ${numericId} not found in backend. Please ensure this tenant exists in your database.`
        );
      }
    } catch (error) {
      console.error("Error changing plan:", error);
      toast.error("Failed to change plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !admin) return null;

  if (loadingPlans) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  const allPackages: SubscriptionPackage[] = [
    "basic",
    "professional",
    "enterprise",
  ];
  const currentPackageIndex = allPackages.indexOf(admin.package);
  const selectedPackageIndex = allPackages.indexOf(selectedPackage);
  const isUpgrade = selectedPackageIndex > currentPackageIndex;
  const isDowngrade = selectedPackageIndex < currentPackageIndex;
  const isSamePlan = selectedPackage === admin.package;

  const PackageIcon = PACKAGES[selectedPackage].icon;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <ArrowUpDown className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Manage Subscription Plan</h2>
              <p className="text-purple-100 text-sm">{admin.businessName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Plan Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-500 p-3 rounded-xl">
                  {React.createElement(PACKAGES[admin.package].icon, {
                    className: "w-6 h-6 text-white",
                  })}
                </div>
                <div>
                  <p className="text-sm text-blue-700 font-medium">
                    Current Plan
                  </p>
                  <p className="text-xl font-bold text-blue-900 capitalize">
                    {admin.package}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-700 font-medium">
                  Current Price
                </p>
                <p className="text-xl font-bold text-blue-900">
                  NPR {admin.packagePrice.toLocaleString()}/mo
                </p>
              </div>
            </div>
          </div>

          {/* Available Plans */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-base font-bold text-gray-900">
                Select New Plan
              </label>
              {!isSamePlan && (
                <span
                  className={`flex items-center space-x-1 text-sm font-semibold ${
                    isUpgrade ? "text-green-600" : "text-orange-600"
                  }`}
                >
                  {isUpgrade ? (
                    <ArrowUp className="w-4 h-4" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
                  )}
                  <span>{isUpgrade ? "Upgrade" : "Downgrade"}</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {allPackages.map((pkg) => {
                const PkgIcon = PACKAGES[pkg].icon;
                const isCurrentPlan = pkg === admin.package;
                const isSelected = pkg === selectedPackage;

                return (
                  <button
                    key={pkg}
                    type="button"
                    onClick={() => setSelectedPackage(pkg)}
                    className={`relative p-5 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? `border-${PACKAGES[pkg].color}-500 bg-${PACKAGES[pkg].color}-50 shadow-xl ring-2 ring-${PACKAGES[pkg].color}-200`
                        : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                    }`}
                  >
                    {/* Badge */}
                    {isCurrentPlan && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-bold">
                          Current
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <PkgIcon
                        className={`w-8 h-8 ${
                          isSelected
                            ? `text-${PACKAGES[pkg].color}-600`
                            : "text-gray-400"
                        }`}
                      />
                      {isSelected && !isCurrentPlan && (
                        <div
                          className={`w-7 h-7 bg-${PACKAGES[pkg].color}-500 rounded-full flex items-center justify-center`}
                        >
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    <p
                      className={`text-lg font-bold mb-1 capitalize ${
                        isSelected
                          ? `text-${PACKAGES[pkg].color}-900`
                          : "text-gray-900"
                      }`}
                    >
                      {pkg}
                    </p>

                    <p
                      className={`text-2xl font-bold mb-3 ${
                        isSelected
                          ? `text-${PACKAGES[pkg].color}-600`
                          : "text-gray-700"
                      }`}
                    >
                      NPR{" "}
                      {backendPlans.find(
                        (p) => p.plan_name.toLowerCase() === pkg
                      )?.plan_price || PACKAGES[pkg].price.toLocaleString()}
                      <span className="text-sm font-normal">/mo</span>
                    </p>

                    <div className="space-y-1.5 text-xs text-gray-600">
                      {pkg === "basic" && (
                        <>
                          <p className="flex items-center">
                            <Check className="w-3 h-3 mr-1 text-green-500" /> 3
                            users
                          </p>
                          <p className="flex items-center">
                            <Check className="w-3 h-3 mr-1 text-green-500" />{" "}
                            1,000 products
                          </p>
                          <p className="flex items-center">
                            <Check className="w-3 h-3 mr-1 text-green-500" /> 1
                            branch
                          </p>
                          <p className="flex items-center">
                            <Check className="w-3 h-3 mr-1 text-green-500" />{" "}
                            Email support
                          </p>
                        </>
                      )}
                      {pkg === "professional" && (
                        <>
                          <p className="flex items-center">
                            <Check className="w-3 h-3 mr-1 text-green-500" /> 10
                            users
                          </p>
                          <p className="flex items-center">
                            <Check className="w-3 h-3 mr-1 text-green-500" />{" "}
                            10,000 products
                          </p>
                          <p className="flex items-center">
                            <Check className="w-3 h-3 mr-1 text-green-500" /> 5
                            branches
                          </p>
                          <p className="flex items-center">
                            <Check className="w-3 h-3 mr-1 text-green-500" />{" "}
                            Priority support
                          </p>
                        </>
                      )}
                      {pkg === "enterprise" && (
                        <>
                          <p className="flex items-center">
                            <Check className="w-3 h-3 mr-1 text-green-500" />{" "}
                            Unlimited users
                          </p>
                          <p className="flex items-center">
                            <Check className="w-3 h-3 mr-1 text-green-500" />{" "}
                            Unlimited products
                          </p>
                          <p className="flex items-center">
                            <Check className="w-3 h-3 mr-1 text-green-500" />{" "}
                            Unlimited branches
                          </p>
                          <p className="flex items-center">
                            <Check className="w-3 h-3 mr-1 text-green-500" />{" "}
                            24/7 support
                          </p>
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Info Banner */}
          {!isSamePlan && (
            <div
              className={`rounded-xl p-4 border-2 ${
                isUpgrade
                  ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                  : "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200"
              }`}
            >
              <div className="flex items-start space-x-3">
                <AlertCircle
                  className={`w-5 h-5 mt-0.5 ${
                    isUpgrade ? "text-green-600" : "text-orange-600"
                  }`}
                />
                <div
                  className={`text-sm ${
                    isUpgrade ? "text-green-900" : "text-orange-900"
                  }`}
                >
                  <p className="font-semibold mb-1">
                    {isUpgrade ? "⬆️ Upgrading Plan" : "⬇️ Downgrading Plan"}
                  </p>
                  <ul
                    className={`space-y-1 text-xs ${
                      isUpgrade ? "text-green-800" : "text-orange-800"
                    }`}
                  >
                    <li>
                      • New price:{" "}
                      <strong>
                        NPR{" "}
                        {backendPlans.find(
                          (p) =>
                            p.plan_name.toLowerCase() ===
                            selectedPackage.toLowerCase()
                        )?.plan_price ||
                          PACKAGES[selectedPackage].price.toLocaleString()}
                        /mo
                      </strong>
                    </li>
                    <li>
                      •{" "}
                      {isUpgrade
                        ? "Upgrade takes effect immediately"
                        : "Downgrade will be processed at the end of current billing period"}
                    </li>
                    <li>
                      • Price difference will be{" "}
                      {isUpgrade ? "charged" : "refunded"} pro-rata
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleChangePlan}
              disabled={isSamePlan || isLoading}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${
                isSamePlan || isLoading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : isUpgrade
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg"
                  : "bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:shadow-lg"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : isSamePlan ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Already on this plan</span>
                </>
              ) : isUpgrade ? (
                <>
                  <ArrowUp className="w-5 h-5" />
                  <span>
                    Upgrade to{" "}
                    {selectedPackage.charAt(0).toUpperCase() +
                      selectedPackage.slice(1)}
                  </span>
                </>
              ) : (
                <>
                  <ArrowDown className="w-5 h-5" />
                  <span>
                    Downgrade to{" "}
                    {selectedPackage.charAt(0).toUpperCase() +
                      selectedPackage.slice(1)}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
