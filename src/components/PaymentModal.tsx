import React, { useState } from "react";
import { X, CreditCard, CheckCircle, Loader, XCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getFromStorage, saveToStorage } from "../utils/mockData";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPackage: string;
  targetPackage: string;
  targetPrice: number;
  onSuccess: () => void;
  redirectToSubscription?: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  currentPackage,
  targetPackage,
  targetPrice,
  onSuccess,
  redirectToSubscription = false,
}) => {
  const { currentUser, updateTenantInfo } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<"esewa" | "fonepay">(
    "esewa",
  );
  const [processing, setProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [error, setError] = useState("");
  const [paymentDetails, setPaymentDetails] = useState({
    accountId: "",
    pin: "",
  });

  if (!isOpen) return null;

  const handlePayment = async () => {
    if (!paymentDetails.accountId || !paymentDetails.pin) {
      setError("Please fill in all payment details");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate payment success (90% success rate for demo)
      const paymentSuccess = true; // Always succeed for demo

      if (paymentSuccess) {
        // Update package
        updatePackage(targetPackage);

        // Record transaction
        recordTransaction();

        setPaymentComplete(true);

        // Wait 2 seconds then close and refresh
        setTimeout(() => {
          setPaymentComplete(false);
          onClose();
          onSuccess();
        }, 2000);
      } else {
        throw new Error("Payment failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Payment processing failed");
      setProcessing(false);
    }
  };

  const updatePackage = (newPackage: string) => {
    // Update user's package
    const users = getFromStorage("users", []);
    const updatedUsers = users.map((u: any) => {
      if (u.id === currentUser?.id) {
        return { ...u, package: newPackage };
      }
      return u;
    });
    saveToStorage("users", updatedUsers);

    // Update subscription
    const subscriptions = getFromStorage("subscriptions", []);
    const existingSubscription = subscriptions.find(
      (s: any) => s.workspaceId === currentUser?.workspaceId,
    );

    if (existingSubscription) {
      const updatedSubscriptions = subscriptions.map((s: any) => {
        if (s.workspaceId === currentUser?.workspaceId) {
          return {
            ...s,
            package: newPackage,
            price: targetPrice,
            updatedAt: new Date().toISOString(),
            lastUpgradeDate: new Date().toISOString(),
          };
        }
        return s;
      });
      saveToStorage("subscriptions", updatedSubscriptions);
    } else {
      // Create new subscription
      const newSubscription = {
        id: `sub_${Date.now()}`,
        workspaceId: currentUser?.workspaceId,
        package: newPackage,
        status: "active",
        startDate: new Date().toISOString(),
        nextBillingDate: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        price: targetPrice,
        createdAt: new Date().toISOString(),
      };
      subscriptions.push(newSubscription);
      saveToStorage("subscriptions", subscriptions);
    }

    // Update tenant info in context
    if (updateTenantInfo) {
      updateTenantInfo({ package: newPackage });
    }
  };

  const recordTransaction = () => {
    const transactions = getFromStorage("transactions", []);
    const newTransaction = {
      id: `txn_${Date.now()}`,
      type: "subscription_upgrade",
      from: currentPackage,
      to: targetPackage,
      amount: targetPrice,
      paymentMethod,
      status: "completed",
      workspaceId: currentUser?.workspaceId,
      userId: currentUser?.id,
      createdAt: new Date().toISOString(),
    };
    transactions.push(newTransaction);
    saveToStorage("transactions", transactions);
  };

  const handleClose = () => {
    if (!processing) {
      onClose();
      setError("");
      setPaymentDetails({ accountId: "", pin: "" });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {paymentComplete ? (
          // Success Screen
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-600" size={48} />
            </div>
            <h2 className="text-gray-900 mb-3">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your package has been upgraded to{" "}
              <span className="font-bold capitalize">{targetPackage}</span>
            </p>
            <div className="flex justify-center">
              <Loader className="animate-spin text-indigo-600" size={32} />
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-gray-900">Complete Payment</h3>
              <button
                onClick={handleClose}
                disabled={processing}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Order Summary */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Upgrading to:</span>
                  <span className="font-bold text-indigo-600 capitalize">
                    {targetPackage}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Amount:</span>
                  <span className="font-bold text-xl text-gray-900">
                    NPR {targetPrice.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 text-right mt-1">
                  per month
                </p>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod("esewa")}
                    disabled={processing}
                    className={`border-2 rounded-lg p-4 transition-all ${
                      paymentMethod === "esewa"
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300"
                    } disabled:opacity-50`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">💰</div>
                      <div className="font-medium text-gray-900 text-sm">
                        eSewa
                      </div>
                      <div className="text-xs text-gray-500">
                        Digital Wallet
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod("fonepay")}
                    disabled={processing}
                    className={`border-2 rounded-lg p-4 transition-all ${
                      paymentMethod === "fonepay"
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300"
                    } disabled:opacity-50`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">📱</div>
                      <div className="font-medium text-gray-900 text-sm">
                        FonePay
                      </div>
                      <div className="text-xs text-gray-500">
                        Mobile Payment
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {paymentMethod === "esewa"
                      ? "eSewa ID / Mobile Number"
                      : "Mobile Number"}
                  </label>
                  <input
                    type="text"
                    value={paymentDetails.accountId}
                    onChange={(e) =>
                      setPaymentDetails({
                        ...paymentDetails,
                        accountId: e.target.value,
                      })
                    }
                    placeholder={
                      paymentMethod === "esewa"
                        ? "98XXXXXXXX or eSewa ID"
                        : "+977-XXXXXXXXXX"
                    }
                    disabled={processing}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {paymentMethod === "esewa" ? "eSewa PIN" : "FonePay PIN"}
                  </label>
                  <input
                    type="password"
                    value={paymentDetails.pin}
                    onChange={(e) =>
                      setPaymentDetails({
                        ...paymentDetails,
                        pin: e.target.value,
                      })
                    }
                    placeholder="Enter your PIN"
                    disabled={processing}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none disabled:bg-gray-100"
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center text-red-800 text-sm">
                    <XCircle size={16} className="mr-2 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Security Notice */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                <div className="flex items-start">
                  <CheckCircle
                    className="text-green-600 mr-2 flex-shrink-0"
                    size={16}
                  />
                  <div className="text-xs text-green-800">
                    <p className="font-medium">Secure Payment</p>
                    <p>Your payment is encrypted and secure</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleClose}
                  disabled={processing}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={
                    processing ||
                    !paymentDetails.accountId ||
                    !paymentDetails.pin
                  }
                  className={`flex-1 py-3 rounded-lg text-white font-medium flex items-center justify-center ${
                    processing ||
                    !paymentDetails.accountId ||
                    !paymentDetails.pin
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  }`}
                >
                  {processing ? (
                    <>
                      <Loader className="animate-spin mr-2" size={20} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard size={20} className="mr-2" />
                      Pay NPR {targetPrice.toLocaleString()}
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
