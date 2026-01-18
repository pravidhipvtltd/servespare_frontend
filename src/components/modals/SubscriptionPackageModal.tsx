import React, { useState, useEffect } from "react";
import { X, Calendar, Package, Crown, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  getSubscriptionPlans,
  SubscriptionPlanDetail,
} from "../../api/subscription.api";

type SubscriptionPlan = SubscriptionPlanDetail;

interface SubscriptionPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (subscriptionData: any) => Promise<void>;
  tenantName?: string;
}

const SubscriptionPackageModal: React.FC<SubscriptionPackageModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  tenantName = "Tenant",
}) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [subscriptionDate, setSubscriptionDate] = useState("");
  const [finishDate, setFinishDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingPlans, setIsFetchingPlans] = useState(false);

  // Fetch subscription plans on modal open
  useEffect(() => {
    if (isOpen) {
      fetchSubscriptionPlans();
      // Set default dates
      const today = new Date().toISOString().split("T")[0];
      setSubscriptionDate(today);

      // Set finish date to one year from today
      const oneYearLater = new Date();
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      setFinishDate(oneYearLater.toISOString().split("T")[0]);
    }
  }, [isOpen]);

  const fetchSubscriptionPlans = async () => {
    setIsFetchingPlans(true);
    try {
      const plansData = await getSubscriptionPlans();
      console.log("Subscription Plans Fetched:", plansData);

      setPlans(plansData);

      // Auto-select first plan if available
      if (plansData.length > 0) {
        setSelectedPlanId(plansData[0].id);
      }
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      toast.error("Failed to fetch subscription plans");

      // Mock data for development/fallback
      const mockPlans: SubscriptionPlan[] = [
        {
          id: 1,
          plan_name: "Basic",
          plan_price: "2500",
          no_of_user: "5",
          no_of_branch: "2",
          no_of_product: "1000",
          is_active: true,
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
        },
        {
          id: 2,
          plan_name: "Professional",
          plan_price: "5000",
          no_of_user: "20",
          no_of_branch: "5",
          no_of_product: "5000",
          is_active: true,
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
        },
        {
          id: 3,
          plan_name: "Enterprise",
          plan_price: "10000",
          no_of_user: "999",
          no_of_branch: "999",
          no_of_product: "10000",
          is_active: true,
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
        },
      ];

      setPlans(mockPlans);
      if (mockPlans.length > 0) {
        setSelectedPlanId(mockPlans[0].id);
      }
    } finally {
      setIsFetchingPlans(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPlanId) {
      toast.error("Please select a subscription plan");
      return;
    }

    if (!subscriptionDate) {
      toast.error("Please select subscription start date");
      return;
    }

    if (!finishDate) {
      toast.error("Please select subscription end date");
      return;
    }

    if (new Date(subscriptionDate) >= new Date(finishDate)) {
      toast.error("End date must be after start date");
      return;
    }

    try {
      setIsLoading(true);

      await onSubmit({
        subscription_plan: selectedPlanId,
        subscription_date: subscriptionDate,
        finish_date: finishDate,
      });

      // Reset form
      setSelectedPlanId(null);
      setSubscriptionDate("");
      setFinishDate("");
    } catch (error) {
      console.error("Error submitting subscription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Select Subscription Package
              </h2>
              <p className="text-sm text-gray-500">for {tenantName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Plans Section */}
          <div className="p-6 space-y-6">
            {/* Subscription Plans Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-4">
                Choose Your Plan
              </label>

              {isFetchingPlans ? (
                <div className="text-center py-8 text-gray-500">
                  Loading subscription plans...
                </div>
              ) : plans.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plans.map((plan, idx) => {
                    // Determine icon based on plan index or name
                    const getIcon = () => {
                      const planName = plan.plan_name.toLowerCase();
                      if (planName.includes("enterprise")) {
                        return <Sparkles className="w-8 h-8 text-orange-500" />;
                      } else if (planName.includes("professional")) {
                        return <Crown className="w-8 h-8 text-purple-500" />;
                      } else {
                        return <Package className="w-8 h-8 text-blue-500" />;
                      }
                    };

                    const isSelected = selectedPlanId === plan.id;

                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`relative p-8 rounded-2xl border-2 transition-all transform hover:scale-105 ${
                          isSelected
                            ? "border-orange-500 bg-orange-50 shadow-lg shadow-orange-200"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        {/* Selection Indicator */}
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center border-2 border-white">
                            <div className="w-3 h-3 bg-white rounded-full" />
                          </div>
                        )}

                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                          {getIcon()}
                        </div>

                        {/* Plan Name */}
                        <h3 className="font-bold text-gray-900 text-xl mb-2 text-center">
                          {plan.plan_name}
                        </h3>

                        {/* Price */}
                        <p className="text-center text-3xl font-bold text-gray-900 mb-1">
                          NPR{" "}
                          {parseInt(plan.plan_price || "0").toLocaleString()}
                        </p>
                        <p className="text-center text-sm text-gray-500 mb-6">
                          /month
                        </p>

                        {/* Features */}
                        <div className="space-y-2 text-sm text-gray-600 text-center border-t border-gray-200 pt-4">
                          <div>✓ {plan.no_of_user} Users</div>
                          <div>✓ {plan.no_of_branch} Branches</div>
                          <div>✓ {plan.no_of_product} Products</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No subscription plans available
                </div>
              )}
            </div>

            {/* Date Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t">
              {/* Subscription Start Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Subscription Start Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    value={subscriptionDate}
                    onChange={(e) => setSubscriptionDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Subscription End Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Subscription End Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    value={finishDate}
                    onChange={(e) => setFinishDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 flex justify-end gap-3 p-6 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedPlanId}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? "Creating Subscription..."
                : "Continue to Admin Setup"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubscriptionPackageModal;
