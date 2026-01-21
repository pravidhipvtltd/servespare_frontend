import React, { useState } from "react";
import { motion } from "motion/react";
import {
  MapPin,
  Phone,
  User,
  CreditCard,
  ArrowLeft,
  Check,
  Package,
  AlertCircle,
  Smartphone,
  Mail,
  Home,
  Building,
  Truck,
  Shield,
  ChevronRight,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

interface CheckoutPageProps {
  cartItems: any[];
  customerData: any;
  onOrderComplete: () => void;
  onBack: () => void;
}

type PaymentMethod = "cash" | "card" | "bank_transfer";

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  cartItems,
  customerData,
  onOrderComplete,
  onBack,
}) => {
  const [step, setStep] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState(
    customerData?.address || "",
  );
  const [phone, setPhone] = useState(customerData?.phone || "+977");
  const [city, setCity] = useState("Pokhara");
  const [deliveryState, setDeliveryState] = useState("Province 3");
  const [zipCode, setZipCode] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping = city === "Pokhara" ? 0 : 150;
  const tax = Math.round(subtotal * 0.13); // 13% VAT
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = async () => {
    if (!deliveryAddress || !phone) {
      toast.error("Please fill in all delivery details");
      return;
    }

    // Safety check for customerData
    if (!customerData || !customerData.id) {
      toast.error("Customer information is missing. Please log in again.");
      return;
    }

    setIsProcessing(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Please log in to place an order");
        return;
      }

      const checkoutPayload = {
        payment_method: paymentMethod,
        delivery_address: deliveryAddress,
        delivery_city: city,
        delivery_state: deliveryState,
        delivery_pincode: zipCode,
        notes: notes,
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/carts/cart/checkout/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify(checkoutPayload),
        },
      );

      if (!response.ok) {
        let errorMessage = "Failed to place order";
        try {
          const errorText = await response.text();
          try {
            const errorData = JSON.parse(errorText);
            if (typeof errorData === "string") {
              errorMessage = errorData;
            } else if (Array.isArray(errorData)) {
              errorMessage = errorData.join(", ");
            } else if (typeof errorData === "object" && errorData) {
              if (errorData.detail) errorMessage = errorData.detail;
              else if (errorData.message) errorMessage = errorData.message;
              else if (errorData.error) errorMessage = String(errorData.error);
              else if (
                errorData.non_field_errors &&
                Array.isArray(errorData.non_field_errors)
              ) {
                errorMessage = errorData.non_field_errors.join(", ");
              } else {
                const fieldErrors = Object.entries(errorData)
                  .filter(([key]) => key !== "status" && key !== "code")
                  .map(([field, errors]) => {
                    const errorStr = Array.isArray(errors)
                      ? errors.join(", ")
                      : String(errors);
                    const fieldName =
                      field.charAt(0).toUpperCase() +
                      field.slice(1).replace(/_/g, " ");
                    return `${fieldName}: ${errorStr}`;
                  });
                if (fieldErrors.length > 0)
                  errorMessage = fieldErrors.join("\n");
              }
            }
          } catch {
            if (errorText && errorText.length < 500) errorMessage = errorText;
          }
        } catch (e) {
          console.error("Error parsing response:", e);
        }
        throw new Error(errorMessage);
      }

      const orderData = await response.json();
      toast.success("Order placed successfully!");
      onOrderComplete();
    } catch (error: any) {
      console.error("Order error:", error);
      toast.error(error.message || "Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentMethods = [
    {
      id: "cash" as PaymentMethod,
      name: "Cash on Delivery",
      icon: Package,
      description: "Pay when you receive",
      color: "from-gray-700 to-gray-800",
    },
    {
      id: "card" as PaymentMethod,
      name: "Debit/Credit Card",
      icon: CreditCard,
      description: "Pay securely with card",
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "bank_transfer" as PaymentMethod,
      name: "Bank Transfer",
      icon: Building,
      description: "Direct bank transfer",
      color: "from-purple-500 to-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-amber-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Cart</span>
          </button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            {[
              { num: 1, label: "Delivery" },
              { num: 2, label: "Payment" },
              { num: 3, label: "Review" },
            ].map((s, index) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      step >= s.num
                        ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step > s.num ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <span className="text-lg">{s.num}</span>
                    )}
                  </div>
                  <span className="text-sm text-gray-600 mt-2">{s.label}</span>
                </div>
                {index < 2 && (
                  <div
                    className={`w-24 h-1 mx-4 ${
                      step > s.num ? "bg-amber-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Delivery Information */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg p-8"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl text-gray-900">
                      Delivery Information
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Where should we deliver your order?
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={customerData.email}
                      disabled
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+977"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      <Home className="w-4 h-4 inline mr-2" />
                      Street Address *
                    </label>
                    <textarea
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="House/Apartment number, Street name"
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* City & State & Zip */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        State *
                      </label>
                      <select
                        value={deliveryState}
                        onChange={(e) => setDeliveryState(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="Province 1">Province 1</option>
                        <option value="Province 2">Province 2</option>
                        <option value="Province 3">Province 3</option>
                        <option value="Gandaki">Gandaki</option>
                        <option value="Province 5">Province 5</option>
                        <option value="Karnali">Karnali</option>
                        <option value="Sudurpashchim">Sudurpashchim</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        <Building className="w-4 h-4 inline mr-2" />
                        City *
                      </label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="Pokhara">Pokhara</option>
                        <option value="Lalitpur">Lalitpur</option>
                        <option value="Bhaktapur">Bhaktapur</option>
                        <option value="Pokhara">Pokhara</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Zip Code
                      </label>
                      <input
                        type="text"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        placeholder="44600"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Delivery Notes */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Delivery Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special instructions for delivery..."
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!deliveryAddress || !phone) {
                      toast.error("Please fill in all required fields");
                      return;
                    }
                    setStep(2);
                  }}
                  className="w-full mt-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 rounded-xl hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-lg"
                >
                  <span>Continue to Payment</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg p-8"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl text-gray-900">Payment Method</h2>
                    <p className="text-gray-600 text-sm">
                      Choose your preferred payment option
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`w-full p-6 rounded-xl border-2 transition-all ${
                          paymentMethod === method.id
                            ? "border-amber-500 bg-amber-50"
                            : "border-gray-200 hover:border-amber-300"
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-14 h-14 bg-gradient-to-r ${method.color} rounded-xl flex items-center justify-center flex-shrink-0`}
                          >
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1 text-left">
                            <h3 className="text-lg text-gray-900 mb-1">
                              {method.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {method.description}
                            </p>
                          </div>
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              paymentMethod === method.id
                                ? "border-amber-500 bg-amber-500"
                                : "border-gray-300"
                            }`}
                          >
                            {paymentMethod === method.id && (
                              <Check className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 rounded-xl hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Review Order</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Review Order */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Delivery Details */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h3 className="text-xl text-gray-900 mb-4 flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-amber-600" />
                    <span>Delivery Address</span>
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-900 mb-1">{customerData.name}</p>
                    <p className="text-gray-600 text-sm mb-1">{phone}</p>
                    <p className="text-gray-600 text-sm mb-1">
                      {deliveryAddress}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {city}, {deliveryState} {zipCode && `- ${zipCode}`}
                    </p>
                    {notes && (
                      <p className="text-gray-500 text-sm mt-2 italic">
                        Note: {notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h3 className="text-xl text-gray-900 mb-4 flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-amber-600" />
                    <span>Payment Method</span>
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-900">
                      {paymentMethods.find((m) => m.id === paymentMethod)?.name}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {
                        paymentMethods.find((m) => m.id === paymentMethod)
                          ?.description
                      }
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 rounded-xl hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center space-x-2 text-lg"
                  >
                    <Lock className="w-5 h-5" />
                    <span>
                      {isProcessing ? "Processing..." : "Place Order"}
                    </span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-24">
              <h3 className="text-xl text-gray-900 mb-6">Order Summary</h3>

              {/* Items */}
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 text-sm line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-gray-500 text-xs">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-gray-900">
                      NPR {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>NPR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "FREE" : `NPR ${shipping}`}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (13%)</span>
                  <span>NPR {tax.toLocaleString()}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-xl text-gray-900">Total</span>
                <span className="text-3xl text-transparent bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text">
                  NPR {total.toLocaleString()}
                </span>
              </div>

              {/* Trust Badges */}
              <div className="space-y-3 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <span>Fast delivery</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Check className="w-5 h-5 text-amber-600" />
                  <span>100% authentic products</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
