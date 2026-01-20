import React, { useState, useEffect } from "react";
import {
  Crown,
  Check,
  ArrowUp,
  ArrowDown,
  CreditCard,
  Calendar,
  AlertCircle,
  Building2,
  Users,
  Package as PackageIcon,
  Zap,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { PaymentModal } from "./PaymentModal";
import {
  getCurrentUserSubscription,
  getSubscriptionPlans,
  SubscriptionPlanDetail,
} from "../api/subscription.api";
import { toast } from "sonner";

interface PackageDetails {
  id: string;
  dbId: number;
  name: string;
  price: number;
  features: string[];
  limits: {
    branches: number | "unlimited";
    users: number | "unlimited";
    products: number | "unlimited";
  };
  recommended?: boolean;
}

export const SubscriptionManagement: React.FC = () => {
  const { currentUser, tenantInfo, updateTenantInfo } = useAuth();
  const [availablePlans, setAvailablePlans] = useState<PackageDetails[]>([]);
  const [currentPackage, setCurrentPackage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageDetails | null>(
    null,
  );
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch all available plans from backend
      const plansData = await getSubscriptionPlans();
      const mappedPlans: PackageDetails[] = plansData.map(
        (p: SubscriptionPlanDetail) => ({
          id: p.plan_name.toLowerCase(),
          dbId: p.id,
          name: p.plan_name,
          price: parseFloat(p.plan_price),
          features: [
            `${p.no_of_branch === "unlimited" ? "Unlimited" : p.no_of_branch} Branch locations`,
            `${p.no_of_user === "unlimited" ? "Unlimited" : p.no_of_user} Users allowed`,
            `${p.no_of_product === "unlimited" ? "Unlimited" : p.no_of_product} Products capacity`,
            "Cloud synchronization",
            "Technical support",
          ],
          limits: {
            branches:
              p.no_of_branch === "unlimited"
                ? "unlimited"
                : parseInt(p.no_of_branch),
            users:
              p.no_of_user === "unlimited"
                ? "unlimited"
                : parseInt(p.no_of_user),
            products:
              p.no_of_product === "unlimited"
                ? "unlimited"
                : parseInt(p.no_of_product),
          },
          recommended: p.plan_name.toLowerCase() === "professional",
        }),
      );
      setAvailablePlans(mappedPlans);

      // 2. Fetch current subscription
      const apiSubscription = await getCurrentUserSubscription(
        currentUser?.workspaceId,
        currentUser?.email,
      );

      if (apiSubscription) {
        const pkgName =
          apiSubscription.subscription_plan_detail?.plan_name?.toLowerCase() ||
          "";
        setCurrentPackage(pkgName);
        setSubscriptionInfo({
          id: apiSubscription.id,
          workspaceId: currentUser?.workspaceId,
          package: pkgName,
          status: apiSubscription.is_active ? "active" : "expired",
          startDate: apiSubscription.subscription_date,
          nextBillingDate: apiSubscription.finish_date,
          price: parseFloat(
            apiSubscription.subscription_plan_detail?.plan_price || "0",
          ),
        });
      } else {
        toast.error("No active subscription found on backend");
      }
    } catch (error) {
      console.error("Error loading subscription data:", error);
      toast.error("Failed to load subscription information from backend");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeClick = (pkg: PackageDetails) => {
    setSelectedPackage(pkg);
    setShowUpgradeModal(true);
  };

  const handleDowngradeClick = (pkg: PackageDetails) => {
    setSelectedPackage(pkg);
    setShowDowngradeModal(true);
  };

  const proceedToPayment = () => {
    if (!selectedPackage) return;

    // Store the upgrade intent
    sessionStorage.setItem(
      "upgrade_intent",
      JSON.stringify({
        from: currentPackage,
        to: selectedPackage.id,
        price: selectedPackage.price,
        workspaceId: currentUser?.workspaceId,
      }),
    );

    // Redirect to payment processing
    window.location.href = "/payment-upgrade";
  };

  const confirmDowngrade = () => {
    if (!selectedPackage) return;

    // Direct update as server handles limit validation
    updatePackage(selectedPackage.id);
    setShowDowngradeModal(false);
  };

  const updatePackage = (newPackage: string) => {
    // Note: In a pure backend-driven system, we would call an API here.
    // Since we're moving to backend information only, we'll reload data after external updates.
    loadData();
  };

  const getCurrentPackageDetails = () => {
    return availablePlans.find((p) => p.id === currentPackage);
  };

  const isUpgrade = (targetPackage: string) => {
    const packageOrder = availablePlans.map((p) => p.id);
    return (
      packageOrder.indexOf(targetPackage) > packageOrder.indexOf(currentPackage)
    );
  };

  const currentPkgDetails = getCurrentPackageDetails();

  if (loading) {
    return (
      <div className="p-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-500 text-lg">
          Loading subscription data from server...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-gray-900 mb-2 flex items-center">
          <Crown className="mr-2 text-orange-600" size={24} />
          Subscription Management
        </h2>
        <p className="text-gray-600 text-sm">
          Plans and billing information powered by backend services
        </p>
      </div>

      {/* Current Subscription Card */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-6 mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center mb-2">
              <h3 className="text-gray-900 mr-3">
                Current Plan: {currentPkgDetails?.name || "No Plan"}
              </h3>
              {subscriptionInfo && (
                <span
                  className={`px-3 py-1 rounded-full text-xs ${
                    subscriptionInfo.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {subscriptionInfo.status.toUpperCase()}
                </span>
              )}
            </div>
            <p className="text-gray-600 text-sm">
              NPR {currentPkgDetails?.price.toLocaleString() || "0"}/month
            </p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full flex items-center justify-center">
            <Crown className="text-orange-600" size={28} />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white bg-opacity-60 rounded-lg p-3">
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <Building2 size={16} className="mr-2" />
              Branches
            </div>
            <div className="text-xl font-bold text-gray-900">
              {currentPkgDetails?.limits.branches === "unlimited"
                ? "∞"
                : currentPkgDetails?.limits.branches || "0"}
            </div>
          </div>
          <div className="bg-white bg-opacity-60 rounded-lg p-3">
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <Users size={16} className="mr-2" />
              Users
            </div>
            <div className="text-xl font-bold text-gray-900">
              {currentPkgDetails?.limits.users === "unlimited"
                ? "∞"
                : currentPkgDetails?.limits.users || "0"}
            </div>
          </div>
          <div className="bg-white bg-opacity-60 rounded-lg p-3">
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <PackageIcon size={16} className="mr-2" />
              Products
            </div>
            <div className="text-xl font-bold text-gray-900">
              {currentPkgDetails?.limits.products === "unlimited"
                ? "∞"
                : currentPkgDetails?.limits.products || "0"}
            </div>
          </div>
        </div>

        {subscriptionInfo && (
          <div className="flex items-center text-sm text-gray-600">
            <Calendar size={16} className="mr-2" />
            Next billing date:{" "}
            {new Date(subscriptionInfo.nextBillingDate).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Available Packages */}
      <h3 className="text-gray-900 mb-4">Available Plans</h3>
      <div className="grid md:grid-cols-3 gap-6">
        {availablePlans.map((pkg) => {
          const isCurrent = pkg.id === currentPackage;
          const canUpgrade = isUpgrade(pkg.id);

          return (
            <div
              key={pkg.id}
              className={`relative border-2 rounded-2xl p-6 transition-all ${
                isCurrent
                  ? "border-indigo-500 bg-indigo-50 shadow-lg"
                  : pkg.recommended
                    ? "border-orange-300 bg-orange-50"
                    : "border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md"
              }`}
            >
              {pkg.recommended && !isCurrent && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                    RECOMMENDED
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h4 className="text-gray-900 mb-2">{pkg.name}</h4>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  NPR {pkg.price.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">per month</div>
              </div>

              <div className="space-y-3 mb-6">
                {pkg.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-start text-sm text-gray-700"
                  >
                    <Check
                      size={16}
                      className="mr-2 text-green-600 flex-shrink-0 mt-0.5"
                    />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-auto">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full bg-gray-400 text-white py-3 rounded-lg cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : canUpgrade ? (
                  <button
                    onClick={() => handleUpgradeClick(pkg)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center"
                  >
                    <ArrowUp size={20} className="mr-2" />
                    Upgrade to {pkg.name}
                  </button>
                ) : (
                  <button
                    onClick={() => handleDowngradeClick(pkg)}
                    className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 flex items-center justify-center"
                  >
                    <ArrowDown size={20} className="mr-2" />
                    Downgrade to {pkg.name}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && selectedPackage && (
        <UpgradeModal
          currentPackage={currentPkgDetails!}
          targetPackage={selectedPackage}
          onConfirm={proceedToPayment}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}

      {/* Downgrade Modal */}
      {showDowngradeModal && selectedPackage && (
        <DowngradeModal
          currentPackage={currentPkgDetails!}
          targetPackage={selectedPackage}
          onConfirm={confirmDowngrade}
          onClose={() => setShowDowngradeModal(false)}
        />
      )}
    </div>
  );
};

// Upgrade Modal
interface UpgradeModalProps {
  currentPackage: PackageDetails;
  targetPackage: PackageDetails;
  onConfirm: () => void;
  onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  currentPackage,
  targetPackage,
  onConfirm,
  onClose,
}) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const priceDifference = targetPackage.price - currentPackage.price;

  const handleProceedToPayment = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    onClose();
    // Reload to reflect new package
    window.location.reload();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full">
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="text-orange-600" size={32} />
              </div>
              <h3 className="text-gray-900 mb-2">Upgrade Your Package</h3>
              <p className="text-gray-600">
                Upgrade from {currentPackage.name} to {targetPackage.name}
              </p>
            </div>

            {/* Comparison */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-gray-700 mb-3">
                    Current: {currentPackage.name}
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      •{" "}
                      {currentPackage.limits.branches === "unlimited"
                        ? "Unlimited"
                        : currentPackage.limits.branches}{" "}
                      branches
                    </p>
                    <p>
                      •{" "}
                      {currentPackage.limits.users === "unlimited"
                        ? "Unlimited"
                        : currentPackage.limits.users}{" "}
                      users
                    </p>
                    <p>
                      •{" "}
                      {currentPackage.limits.products === "unlimited"
                        ? "Unlimited"
                        : currentPackage.limits.products}{" "}
                      products
                    </p>
                    <p className="font-bold text-gray-900">
                      NPR {currentPackage.price.toLocaleString()}/month
                    </p>
                  </div>
                </div>
                <div className="border-l-2 border-indigo-200 pl-6">
                  <h4 className="font-bold text-indigo-700 mb-3">
                    New: {targetPackage.name}
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="text-green-600 font-medium">
                      •{" "}
                      {targetPackage.limits.branches === "unlimited"
                        ? "Unlimited"
                        : targetPackage.limits.branches}{" "}
                      branches
                    </p>
                    <p className="text-green-600 font-medium">
                      •{" "}
                      {targetPackage.limits.users === "unlimited"
                        ? "Unlimited"
                        : targetPackage.limits.users}{" "}
                      users
                    </p>
                    <p className="text-green-600 font-medium">
                      •{" "}
                      {targetPackage.limits.products === "unlimited"
                        ? "Unlimited"
                        : targetPackage.limits.products}{" "}
                      products
                    </p>
                    <p className="font-bold text-indigo-700">
                      NPR {targetPackage.price.toLocaleString()}/month
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">
                    Additional Monthly Cost:
                  </span>
                  <span className="text-xl font-bold text-indigo-700">
                    +NPR {priceDifference.toLocaleString()}/month
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <CreditCard
                  className="text-blue-600 mr-3 flex-shrink-0"
                  size={20}
                />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Payment Required</p>
                  <p>
                    Click the button below to complete your payment. Your plan
                    will be upgraded immediately after successful payment.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleProceedToPayment}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center"
              >
                <CreditCard size={20} className="mr-2" />
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          currentPackage={currentPackage.id}
          targetPackage={targetPackage.id}
          targetPrice={targetPackage.price}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
};

// Downgrade Modal
interface DowngradeModalProps {
  currentPackage: PackageDetails;
  targetPackage: PackageDetails;
  onConfirm: () => void;
  onClose: () => void;
}

const DowngradeModal: React.FC<DowngradeModalProps> = ({
  currentPackage,
  targetPackage,
  onConfirm,
  onClose,
}) => {
  const priceDifference = currentPackage.price - targetPackage.price;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="text-orange-600" size={32} />
            </div>
            <h3 className="text-gray-900 mb-2">Downgrade Your Package</h3>
            <p className="text-gray-600">
              Downgrade from {currentPackage.name} to {targetPackage.name}
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle
                className="text-yellow-600 mr-3 flex-shrink-0"
                size={20}
              />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-2">
                  Important: Please Review Before Downgrading
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Your branch limit will decrease to{" "}
                    {targetPackage.limits.branches === "unlimited"
                      ? "unlimited"
                      : targetPackage.limits.branches}
                  </li>
                  <li>
                    Your user limit will decrease to{" "}
                    {targetPackage.limits.users === "unlimited"
                      ? "unlimited"
                      : targetPackage.limits.users}
                  </li>
                  <li>Some features may become unavailable</li>
                  <li>
                    Make sure you're within the new limits before downgrading
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Comparison */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-gray-700 mb-3">
                  Current: {currentPackage.name}
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    •{" "}
                    {currentPackage.limits.branches === "unlimited"
                      ? "Unlimited"
                      : currentPackage.limits.branches}{" "}
                    branches
                  </p>
                  <p>
                    •{" "}
                    {currentPackage.limits.users === "unlimited"
                      ? "Unlimited"
                      : currentPackage.limits.users}{" "}
                    users
                  </p>
                  <p>
                    •{" "}
                    {currentPackage.limits.products === "unlimited"
                      ? "Unlimited"
                      : currentPackage.limits.products}{" "}
                    products
                  </p>
                  <p className="font-bold text-gray-900">
                    NPR {currentPackage.price.toLocaleString()}/month
                  </p>
                </div>
              </div>
              <div className="border-l-2 border-orange-200 pl-6">
                <h4 className="font-bold text-orange-700 mb-3">
                  New: {targetPackage.name}
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="text-orange-600">
                    •{" "}
                    {targetPackage.limits.branches === "unlimited"
                      ? "Unlimited"
                      : targetPackage.limits.branches}{" "}
                    branches
                  </p>
                  <p className="text-orange-600">
                    •{" "}
                    {targetPackage.limits.users === "unlimited"
                      ? "Unlimited"
                      : targetPackage.limits.users}{" "}
                    users
                  </p>
                  <p className="text-orange-600">
                    •{" "}
                    {targetPackage.limits.products === "unlimited"
                      ? "Unlimited"
                      : targetPackage.limits.products}{" "}
                    products
                  </p>
                  <p className="font-bold text-orange-700">
                    NPR {targetPackage.price.toLocaleString()}/month
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Monthly Savings:</span>
                <span className="text-xl font-bold text-green-700">
                  -NPR {priceDifference.toLocaleString()}/month
                </span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center"
            >
              <ArrowDown size={20} className="mr-2" />
              Confirm Downgrade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
