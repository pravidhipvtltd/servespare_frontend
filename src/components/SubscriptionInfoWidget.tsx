import React, { useState, useEffect } from "react";
import {
  Crown,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getCurrentUserSubscription } from "../api/subscription.api";

interface SubscriptionInfo {
  package: string;
  expiryDate: string;
  status: "active" | "expiring" | "expired";
  daysLeft: number;
}

interface SubscriptionInfoWidgetProps {
  onNavigateToSubscription: () => void;
}

export const SubscriptionInfoWidget: React.FC<SubscriptionInfoWidgetProps> = ({
  onNavigateToSubscription,
}) => {
  const { currentUser } = useAuth();
  const [subscriptionInfo, setSubscriptionInfo] =
    useState<SubscriptionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSubscriptionInfo();
  }, [currentUser]);

  const loadSubscriptionInfo = async () => {
    setIsLoading(true);
    try {
      // Use centralized API service
      const userSubscription = await getCurrentUserSubscription(
        currentUser?.workspaceId,
        currentUser?.email
      );

      if (userSubscription && userSubscription.subscription_plan_detail) {
        updateSubscriptionInfo(userSubscription);
        return;
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }

    setIsLoading(false);
  };

  const updateSubscriptionInfo = (userSubscription: any) => {
    // Extract plan name from subscription_plan_detail
    const planName =
      userSubscription.subscription_plan_detail?.plan_name || "basic";

    // Get expiry date from finish_date
    const expiryDate = new Date(userSubscription.finish_date);
    const now = new Date();
    const daysLeft = Math.ceil(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    let status: "active" | "expiring" | "expired" = "active";
    if (daysLeft <= 0) {
      status = "expired";
    } else if (daysLeft <= 10) {
      status = "expiring";
    }

    setSubscriptionInfo({
      package: planName,
      expiryDate: userSubscription.finish_date,
      status,
      daysLeft: Math.max(0, daysLeft),
    });

    setIsLoading(false);
  };

  // Loading state while fetching from API
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-center h-24">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // If no active subscription found, show a friendly placeholder instead of hiding the widget
  if (!subscriptionInfo) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div
              className={`p-2 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600`}
            >
              <Crown className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Subscription</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                Not Found
              </span>
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          No active subscription detected for your tenant. Please renew or
          contact support.
        </div>
        <button
          onClick={onNavigateToSubscription}
          className="mt-3 w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2 rounded-lg text-sm font-medium transition-all"
        >
          Manage Subscription
        </button>
      </div>
    );
  }

  const getPackageColor = () => {
    switch (subscriptionInfo.package) {
      case "basic":
        return "from-gray-500 to-gray-600";
      case "professional":
        return "from-indigo-500 to-purple-600";
      case "enterprise":
        return "from-orange-500 to-red-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getStatusColor = () => {
    switch (subscriptionInfo.status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "expiring":
        return "bg-orange-100 text-orange-700";
      case "expired":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div
            className={`p-2 rounded-lg bg-gradient-to-br ${getPackageColor()}`}
          >
            <Crown className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 capitalize">
              {subscriptionInfo.package} Plan
            </h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor()}`}
            >
              {subscriptionInfo.status === "active"
                ? "Active"
                : subscriptionInfo.status === "expiring"
                ? "Expiring Soon"
                : "Expired"}
            </span>
          </div>
        </div>

        {subscriptionInfo.status === "expiring" && (
          <div className="flex items-center space-x-1 bg-orange-100 px-3 py-1 rounded-full">
            <AlertTriangle size={14} className="text-orange-600" />
            <span className="text-xs font-medium text-orange-700">
              {subscriptionInfo.daysLeft}{" "}
              {subscriptionInfo.daysLeft === 1 ? "day" : "days"} left
            </span>
          </div>
        )}

        {subscriptionInfo.status === "expired" && (
          <div className="flex items-center space-x-1 bg-red-100 px-3 py-1 rounded-full">
            <X size={14} className="text-red-600" />
            <span className="text-xs font-medium text-red-700">Expired</span>
          </div>
        )}

        {subscriptionInfo.status === "active" &&
          subscriptionInfo.daysLeft > 10 && (
            <div className="flex items-center space-x-1 bg-green-100 px-3 py-1 rounded-full">
              <CheckCircle size={14} className="text-green-600" />
              <span className="text-xs font-medium text-green-700">Active</span>
            </div>
          )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar size={14} />
            <span>Expiry Date</span>
          </div>
          <span className="font-semibold text-gray-900">
            {formatDate(subscriptionInfo.expiryDate)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock size={14} />
            <span>Time Left</span>
          </div>
          <span
            className={`font-semibold ${
              subscriptionInfo.status === "expired"
                ? "text-red-600"
                : subscriptionInfo.status === "expiring"
                ? "text-orange-600"
                : "text-green-600"
            }`}
          >
            {subscriptionInfo.daysLeft === 0
              ? "Expired"
              : `${subscriptionInfo.daysLeft} ${
                  subscriptionInfo.daysLeft === 1 ? "day" : "days"
                }`}
          </span>
        </div>
      </div>

      {(subscriptionInfo.status === "expiring" ||
        subscriptionInfo.status === "expired") && (
        <button
          onClick={onNavigateToSubscription}
          className="mt-3 w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2 rounded-lg text-sm font-medium transition-all"
        >
          Renew Now
        </button>
      )}
    </div>
  );
};


interface ExpiryWarningModalProps {
  show: boolean;
  daysLeft: number;
  expiryDate: string;
  packageName: string;
  onClose: () => void;
  onRenew: () => void;
}

export const ExpiryWarningModal: React.FC<ExpiryWarningModalProps> = ({
  show,
  daysLeft,
  expiryDate,
  packageName,
  onClose,
  onRenew,
}) => {
  if (!show) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isExpired = daysLeft <= 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 ">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Header with Warning Icon */}
        <div
          className={`p-6 rounded-t-2xl ${
            isExpired
              ? "bg-gradient-to-br from-red-500 to-red-600"
              : "bg-gradient-to-br from-orange-500 to-orange-600"
          }`}
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <AlertTriangle className="text-white" size={32} />
            </div>
          </div>
          <h2 className="text-white text-center text-2xl font-bold">
            {isExpired
              ? "Subscription Expired!"
              : "Subscription Expiring Soon!"}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            {isExpired ? (
              <p className="text-gray-700 text-lg mb-2">
                Your <span className="font-bold capitalize">{packageName}</span>{" "}
                plan has expired.
              </p>
            ) : (
              <p className="text-gray-700 text-lg mb-2">
                Your <span className="font-bold capitalize">{packageName}</span>{" "}
                plan is about to expire in{" "}
                <span
                  className={`font-bold ${
                    daysLeft <= 3 ? "text-red-600" : "text-orange-600"
                  }`}
                >
                  {daysLeft} {daysLeft === 1 ? "day" : "days"}
                </span>
                !
              </p>
            )}
            <p className="text-gray-500 text-sm">
              Expiry Date:{" "}
              <span className="font-semibold text-gray-700">
                {formatDate(expiryDate)}
              </span>
            </p>
          </div>

          {/* Warning Box */}
          <div
            className={`${
              isExpired
                ? "bg-red-50 border-red-200"
                : "bg-orange-50 border-orange-200"
            } border-2 rounded-xl p-4 mb-6`}
          >
            <div className="flex items-start space-x-3">
              <AlertTriangle
                className={`${
                  isExpired ? "text-red-600" : "text-orange-600"
                } flex-shrink-0 mt-0.5`}
                size={20}
              />
              <div>
                <h3
                  className={`font-semibold ${
                    isExpired ? "text-red-900" : "text-orange-900"
                  } mb-1`}
                >
                  {isExpired
                    ? "Action Required"
                    : "Renew Now to Avoid Interruption"}
                </h3>
                <p
                  className={`text-sm ${
                    isExpired ? "text-red-700" : "text-orange-700"
                  }`}
                >
                  {isExpired
                    ? "Please renew your subscription immediately to continue using all features."
                    : "Renew your subscription now to ensure uninterrupted access to all features and services."}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors"
            >
              Remind Me Later
            </button>
            <button
              onClick={onRenew}
              className={`flex-1 px-4 py-3 rounded-lg font-medium text-white transition-all shadow-lg ${
                isExpired
                  ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                  : "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Crown size={18} />
                <span>Renew Now</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
