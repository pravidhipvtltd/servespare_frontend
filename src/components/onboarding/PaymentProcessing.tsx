import React, { useState } from "react";
import {
  CreditCard,
  Smartphone,
  Check,
  AlertCircle,
  Loader,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface PackageData {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
}

interface PaymentProcessingProps {
  selectedPackage: PackageData;
  adminEmail: string;
  onPaymentComplete: () => void;
  onBack: () => void;
}

type PaymentMethod = "esewa" | "fonepay" | null;

export const PaymentProcessing: React.FC<PaymentProcessingProps> = ({
  selectedPackage,
  adminEmail,
  onPaymentComplete,
  onBack,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<
    "select" | "processing" | "success"
  >("select");

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
  };

  const simulatePayment = async () => {
    if (!selectedMethod) {
      toast.error("Please select a payment method");
      return;
    }

    setIsProcessing(true);
    setPaymentStep("processing");

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Store payment information
      const paymentData = {
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        amount: selectedPackage.price,
        currency: selectedPackage.currency,
        paymentMethod: selectedMethod,
        paymentDate: new Date().toISOString(),
        transactionId: `TXN${Date.now()}`,
        status: "completed",
        trialEndDate: new Date(
          Date.now() + 14 * 24 * 60 * 60 * 1000
        ).toISOString(),
      };

      localStorage.setItem("payment_data", JSON.stringify(paymentData));
      localStorage.setItem("selected_package", selectedPackage.id);
      localStorage.setItem("package_active", "true");
      localStorage.setItem("trial_active", "true");

      // Verify localStorage was set correctly
      console.log("✅ Payment localStorage set:", {
        payment_data: localStorage.getItem("payment_data") ? "SET" : "NOT SET",
        selected_package: localStorage.getItem("selected_package"),
        package_active: localStorage.getItem("package_active"),
        trial_active: localStorage.getItem("trial_active"),
      });

      setPaymentStep("success");
      toast.success("Payment completed successfully!");

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        onPaymentComplete();
      }, 2000);
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
      setPaymentStep("select");
      setIsProcessing(false);
    }
  };

  if (paymentStep === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Payment Successful!
          </h2>
          <p className="text-gray-600 mb-6">
            Your {selectedPackage.name} plan has been activated successfully.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Package:</span>
              <span className="font-semibold text-gray-900">
                {selectedPackage.name}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Amount Paid:</span>
              <span className="font-semibold text-gray-900">
                {selectedPackage.currency}{" "}
                {selectedPackage.price.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Trial Period:</span>
              <span className="font-semibold text-green-600">14 Days Free</span>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (paymentStep === "processing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader className="w-10 h-10 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Processing Payment...
          </h2>
          <p className="text-gray-600 mb-6">
            Please wait while we process your payment through{" "}
            {selectedMethod === "esewa" ? "eSewa" : "FonePay"}
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>✓ Connecting to payment gateway</p>
            <p>✓ Verifying payment details</p>
            <p className="animate-pulse">⟳ Processing transaction...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mb-4">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Complete Payment
          </h1>
          <p className="text-gray-600">
            Choose your preferred payment method to activate your plan
          </p>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Package:</span>
              <span className="font-semibold text-gray-900">
                {selectedPackage.name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Billing Period:</span>
              <span className="text-gray-700">Monthly</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Trial Period:</span>
              <span className="text-green-600 font-semibold">14 Days Free</span>
            </div>
            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">
                  Total Amount:
                </span>
                <span className="text-2xl font-bold text-orange-600">
                  {selectedPackage.currency}{" "}
                  {selectedPackage.price.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-500 text-right mt-1">
                First charge after 14-day trial
              </p>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">
            Select Payment Method
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* eSewa */}
            <div
              onClick={() => handlePaymentMethodSelect("esewa")}
              className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                selectedMethod === "esewa"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-green-300"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                {selectedMethod === "esewa" && (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">eSewa</h4>
              <p className="text-sm text-gray-600">
                Nepal&apos;s leading digital wallet
              </p>
            </div>

            {/* FonePay */}
            <div
              onClick={() => handlePaymentMethodSelect("fonepay")}
              className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                selectedMethod === "fonepay"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                {selectedMethod === "fonepay" && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">FonePay</h4>
              <p className="text-sm text-gray-600">
                Secure bank payment gateway
              </p>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Important Information:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>You will be redirected to the payment gateway</li>
                  <li>
                    Complete the payment using your{" "}
                    {selectedMethod === "esewa"
                      ? "eSewa account"
                      : "bank account"}
                  </li>
                  <li>
                    Your subscription will activate immediately after successful
                    payment
                  </li>
                  <li>Trial period starts from today</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Mode Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Demo Mode Active:</p>
              <p className="text-yellow-700">
                This is a simulated payment for demonstration purposes. In
                production, you will be redirected to the actual payment
                gateway.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            disabled={isProcessing}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <button
            onClick={simulatePayment}
            disabled={!selectedMethod || isProcessing}
            className={`px-8 py-4 rounded-lg font-semibold transition-all flex items-center space-x-2 ${
              selectedMethod && !isProcessing
                ? "bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-lg"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <span>{isProcessing ? "Processing..." : "Complete Payment"}</span>
            {!isProcessing && <ExternalLink className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
