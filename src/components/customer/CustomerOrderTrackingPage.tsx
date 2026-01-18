import React, { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Package,
  MapPin,
  Phone,
  Mail,
  Download,
  RotateCcw,
  RefreshCw,
  Truck,
  ExternalLink,
  Copy,
  CreditCard,
  Wallet,
  Banknote,
  Clock,
  User,
  Home,
  FileText,
  CheckCircle,
  Shield,
  Award,
} from "lucide-react";
import { CustomerOrderNav } from "./CustomerOrderNav";
import { OrderTimeline } from "./OrderTimeline";
import { CustomerFooter } from "./CustomerFooter";
import { toast } from "react-toastify";

interface CustomerOrderTrackingPageProps {
  orderId?: string;
  onBack?: () => void;
  onNavigate?: (page: string) => void;
}

export const CustomerOrderTrackingPage: React.FC<
  CustomerOrderTrackingPageProps
> = ({ orderId = "ORD-2024-001", onBack, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<"tracking" | "items" | "activity">(
    "tracking"
  );
  const [showDetailedTracking, setShowDetailedTracking] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({ subject: "", message: "" });

  // Mock order data
  const orderData = {
    orderId: "ORD-2024-001",
    orderDate: "December 8, 2024, 10:30 AM",
    status: "shipped",
    currentStep: 4,
    expectedDelivery: "December 12, 2024",
    totalAmount: 9000,
    paymentMethod: "eSewa",
    paymentStatus: "Paid",
    courier: {
      name: "Pravidhi Express Cargo",
      logo: "🚚",
      awbNumber: "PEC123456789",
      trackingUrl: "https://pravidhiexpress.com.np/track?awb=PEC123456789",
    },
    customer: {
      name: "Rajesh Kumar",
      phone: "+977 9841234567",
      email: "rajesh.kumar@email.com",
      address: "Thamel, Pokhara-29, Nepal",
      landmark: "Near Pokhara Guest House",
    },
    items: [
      {
        id: "1",
        name: "Premium Brake Pads Set",
        sku: "BP-001",
        category: "Brakes",
        quantity: 2,
        unitPrice: 4500,
        totalPrice: 9000,
        image:
          "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=200&h=200&fit=crop",
        warranty: "12 months",
        brand: "Brembo",
      },
    ],
    activityLog: [
      {
        id: "1",
        timestamp: "Dec 9, 9:00 AM",
        event: "Package shipped from warehouse",
        actor: "Warehouse",
        icon: "truck",
      },
      {
        id: "2",
        timestamp: "Dec 8, 4:45 PM",
        event: "Package packed and ready to ship",
        actor: "Warehouse",
        icon: "package",
      },
      {
        id: "3",
        timestamp: "Dec 8, 2:30 PM",
        event: "Item picked from inventory",
        actor: "Warehouse",
        icon: "package",
      },
      {
        id: "4",
        timestamp: "Dec 8, 11:15 AM",
        event: "Order confirmed by seller",
        actor: "Seller",
        icon: "check",
      },
      {
        id: "5",
        timestamp: "Dec 8, 10:30 AM",
        event: "Order placed successfully",
        actor: "Customer",
        icon: "user",
      },
      {
        id: "6",
        timestamp: "Dec 8, 10:28 AM",
        event: "Payment received via eSewa",
        actor: "System",
        icon: "credit",
      },
    ],
  };

  const copyToClipboard = (text: string) => {
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          toast.success("Copied to clipboard!");
        })
        .catch(() => {
          // Fallback method
          fallbackCopyToClipboard(text);
        });
    } else {
      // Use fallback method
      fallbackCopyToClipboard(text);
    }
  };

  const fallbackCopyToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      toast.success("Copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy");
    }
    document.body.removeChild(textArea);
  };

  const getPaymentIcon = (method: string) => {
    if (
      method.toLowerCase().includes("esewa") ||
      method.toLowerCase().includes("fonepay")
    )
      return Wallet;
    if (method.toLowerCase().includes("cash")) return Banknote;
    return CreditCard;
  };

  const PaymentIcon = getPaymentIcon(orderData.paymentMethod);

  // Download Invoice Function
  const downloadInvoice = () => {
    const invoiceData = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       AUTO PARTS INVENTORY SYSTEM
            TAX INVOICE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Order Number: ${orderData.orderId}
Date: ${orderData.orderDate}

BILL TO:
${orderData.customer.name}
${orderData.customer.address}
Phone: ${orderData.customer.phone}
Email: ${orderData.customer.email}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ITEMS:

${orderData.items
  .map(
    (item) => `
${item.name}
SKU: ${item.sku} | Brand: ${item.brand}
Quantity: ${item.quantity} x NPR ${item.unitPrice.toLocaleString()}
Warranty: ${item.warranty}
                                    NPR ${item.totalPrice.toLocaleString()}
`
  )
  .join("\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Subtotal:                   NPR ${orderData.totalAmount.toLocaleString()}
Shipping:                   FREE
VAT (13%):                  NPR ${Math.round(
      orderData.totalAmount * 0.13
    ).toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL:                      NPR ${(
      orderData.totalAmount + Math.round(orderData.totalAmount * 0.13)
    ).toLocaleString()}

Payment Method: ${orderData.paymentMethod}
Payment Status: ${orderData.paymentStatus}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SHIPPING INFORMATION:

Courier: ${orderData.courier.name}
AWB Number: ${orderData.courier.awbNumber}
Expected Delivery: ${orderData.expectedDelivery}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Thank you for your business!

For support, contact us at:
Email: support@autoparts.com.np
Phone: +977 1-5555555
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();

    const blob = new Blob([invoiceData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Invoice_${orderData.orderId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Invoice downloaded successfully!");
  };

  // Reorder Items Function
  const reorderItems = () => {
    // Add items back to cart
    const cart = JSON.parse(localStorage.getItem("customerCart") || "[]");

    orderData.items.forEach((item) => {
      const existingItemIndex = cart.findIndex(
        (cartItem: any) => cartItem.id === item.id
      );

      if (existingItemIndex >= 0) {
        // Item already in cart, increase quantity
        cart[existingItemIndex].quantity += item.quantity;
      } else {
        // Add new item to cart
        cart.push({
          id: item.id,
          name: item.name,
          price: item.unitPrice,
          quantity: item.quantity,
          image: item.image,
          category: item.category,
          brand: item.brand,
          sku: item.sku,
        });
      }
    });

    localStorage.setItem("customerCart", JSON.stringify(cart));
    toast.success(`${orderData.items.length} item(s) added to cart!`);

    // Navigate to cart
    if (onNavigate) {
      setTimeout(() => {
        onNavigate("cart");
      }, 1000);
    }
  };

  // Track with Courier Function
  const trackWithCourier = () => {
    if (orderData.courier.trackingUrl) {
      window.open(orderData.courier.trackingUrl, "_blank");
      toast.info(`Opening ${orderData.courier.name} tracking page...`);
    } else {
      toast.error("Tracking URL not available");
    }
  };

  // Submit Contact Support Form
  const handleContactSupport = () => {
    if (!contactForm.subject || !contactForm.message) {
      toast.error("Please fill in all fields");
      return;
    }

    // Simulate sending support request
    console.log("Support Request:", {
      orderId: orderData.orderId,
      customerEmail: orderData.customer.email,
      subject: contactForm.subject,
      message: contactForm.message,
      timestamp: new Date().toISOString(),
    });

    toast.success(
      "Support request submitted successfully! We'll get back to you within 24 hours."
    );
    setShowContactModal(false);
    setContactForm({ subject: "", message: "" });
  };

  const tabs = [
    { id: "tracking", label: "Tracking", icon: MapPin },
    { id: "items", label: "Items", icon: Package },
    { id: "activity", label: "Activity", icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50/30">
      {/* Premium Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onBack}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-8 transition-all group"
          >
            <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm group-hover:bg-white/20 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="text-sm">Back to Orders</span>
          </motion.button>

          {/* Order Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30 shadow-2xl">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl lg:text-4xl text-white">
                    Order #{orderData.orderId}
                  </h1>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-sm text-white">
                    {orderData.status.charAt(0).toUpperCase() +
                      orderData.status.slice(1)}
                  </span>
                </div>
                <p className="text-white/80 text-sm mb-3">
                  {orderData.orderDate}
                </p>
                <div className="flex items-center gap-2 text-white/90">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">
                    Expected delivery:{" "}
                    <span className="font-medium">
                      {orderData.expectedDelivery}
                    </span>
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap gap-3"
            >
              <button
                onClick={downloadInvoice}
                className="flex items-center gap-2 px-5 py-3 bg-white/20 backdrop-blur-xl hover:bg-white/30 border border-white/30 rounded-xl text-white transition-all group"
              >
                <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm">Download Invoice</span>
              </button>
              <button
                onClick={reorderItems}
                className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-white/95 rounded-xl text-gray-900 transition-all shadow-lg group"
              >
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                <span className="text-sm">Reorder Items</span>
              </button>
            </motion.div>
          </div>
        </div>

        {/* Decorative Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            className="w-full h-8 fill-current text-gray-50"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-16">
        {/* Clean Simple Tracking View */}
        {!showDetailedTracking ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Quick Status Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
              {/* Status Header */}
              <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center animate-pulse">
                      <Truck className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-white/90 text-sm mb-1">
                        Current Status
                      </p>
                      <h2 className="text-3xl text-white">In Transit</h2>
                      <p className="text-white/80 text-sm mt-1">
                        On the way to you
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-sm text-white">Live</span>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Estimated Delivery */}
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-green-500 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      Estimated Delivery
                    </p>
                    <p className="text-xl text-gray-900">
                      {orderData.expectedDelivery}
                    </p>
                    <p className="text-sm text-green-600 mt-2">
                      In 2 days, 15 hours
                    </p>
                  </div>

                  {/* Current Location */}
                  <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-amber-500 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      Current Location
                    </p>
                    <p className="text-lg text-gray-900">Pokhara</p>
                    <p className="text-sm text-amber-600 mt-2">
                      Distribution Center
                    </p>
                  </div>

                  {/* Courier */}
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                    <div className="text-4xl mb-2">
                      {orderData.courier.logo}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      Courier Partner
                    </p>
                    <p className="text-lg text-gray-900">
                      {orderData.courier.name}
                    </p>
                    <p className="text-sm text-blue-600 mt-2 font-mono">
                      {orderData.courier.awbNumber}
                    </p>
                  </div>
                </div>

                {/* Simple Timeline */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg text-gray-900">Tracking Progress</h3>
                    <span className="text-sm text-gray-600">Step 3 of 5</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "60%" }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-600"
                      />
                    </div>
                  </div>

                  {/* Simple Steps */}
                  <div className="grid grid-cols-5 gap-2 mt-4">
                    <div className="text-center">
                      <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-green-500 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-xs text-gray-600">Placed</p>
                    </div>
                    <div className="text-center">
                      <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-green-500 flex items-center justify-center">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-xs text-gray-600">Packed</p>
                    </div>
                    <div className="text-center">
                      <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-amber-500 flex items-center justify-center animate-pulse">
                        <Truck className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-xs text-amber-700">In Transit</p>
                    </div>
                    <div className="text-center">
                      <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gray-200 flex items-center justify-center">
                        <Truck className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-400">Out for Delivery</p>
                    </div>
                    <div className="text-center">
                      <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gray-200 flex items-center justify-center">
                        <Home className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-400">Delivered</p>
                    </div>
                  </div>
                </div>

                {/* Latest Update */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <Truck className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 mb-1">
                        Latest Update
                      </p>
                      <p className="text-sm text-gray-600">
                        Package shipped from warehouse
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Dec 9, 2024 at 9:00 AM
                      </p>
                    </div>
                  </div>
                </div>

                {/* View More Button */}
                <button
                  onClick={() => setShowDetailedTracking(true)}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:shadow-xl hover:shadow-amber-500/30 rounded-xl text-white transition-all text-lg group"
                >
                  <span>View Detailed Tracking</span>
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Order Items Summary */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-600" />
                  Order Items ({orderData.items.length})
                </h3>
                <div className="space-y-3">
                  {orderData.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="w-16 h-16 rounded-lg bg-white border border-gray-200 overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm text-gray-900 mb-1">
                          {item.name}
                        </h4>
                        <p className="text-xs text-gray-600">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-900">
                          NPR {item.totalPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Info */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={downloadInvoice}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <Download className="w-5 h-5 text-gray-600 group-hover:text-amber-600 transition-colors" />
                      <span className="text-sm text-gray-900">
                        Download Invoice
                      </span>
                    </div>
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={trackWithCourier}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <ExternalLink className="w-5 h-5 text-gray-600 group-hover:text-amber-600 transition-colors" />
                      <span className="text-sm text-gray-900">
                        Track with Courier
                      </span>
                    </div>
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={() => setShowContactModal(true)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-600 group-hover:text-amber-600 transition-colors" />
                      <span className="text-sm text-gray-900">
                        Contact Support
                      </span>
                    </div>
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={reorderItems}
                    className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 hover:border-amber-300 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <RefreshCw className="w-5 h-5 text-amber-600 group-hover:rotate-180 transition-transform duration-500" />
                      <span className="text-sm text-gray-900">
                        Reorder Items
                      </span>
                    </div>
                    <svg
                      className="w-4 h-4 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Detailed Tracking View */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Back to Simple View Button */}
            <button
              onClick={() => setShowDetailedTracking(false)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
              <span className="text-sm">Show Less Details</span>
            </button>

            {/* Delivery Countdown Card */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl p-6 mb-6 shadow-2xl"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-white/90 text-sm mb-1">Arriving Soon</p>
                    <h3 className="text-2xl text-white">
                      {orderData.expectedDelivery}
                    </h3>
                    <p className="text-white/80 text-sm mt-1">
                      Your package is on its way!
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center px-6 py-3 bg-white/20 backdrop-blur-xl rounded-xl border border-white/30">
                    <div className="text-3xl text-white">2</div>
                    <div className="text-xs text-white/80 mt-1">Days Left</div>
                  </div>
                  <div className="text-center px-6 py-3 bg-white/20 backdrop-blur-xl rounded-xl border border-white/30">
                    <div className="text-3xl text-white">15</div>
                    <div className="text-xs text-white/80 mt-1">Hours</div>
                  </div>
                  <div className="text-center px-6 py-3 bg-white/20 backdrop-blur-xl rounded-xl border border-white/30">
                    <div className="text-3xl text-white">30</div>
                    <div className="text-xs text-white/80 mt-1">Minutes</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Timeline & Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Package Journey Map */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg"
                >
                  {/* Map Header */}
                  <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xl flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl text-white">Package Journey</h2>
                        <p className="text-sm text-white/80">
                          Track your order in real-time
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Journey Visualization */}
                  <div className="p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                    <div className="relative">
                      {/* Route Line */}
                      <div className="absolute left-8 top-12 bottom-12 w-1 bg-gradient-to-b from-amber-500 via-orange-500 to-green-500 rounded-full" />

                      {/* Journey Points */}
                      <div className="space-y-8 relative">
                        {/* Point 1: Order Placed */}
                        <div className="flex items-start gap-4">
                          <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-xl">
                            <CheckCircle className="w-8 h-8 text-white" />
                          </div>
                          <div className="flex-1 bg-white rounded-xl p-4 shadow-md">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-gray-900">Order Placed</h4>
                              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                Completed
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              Your order has been confirmed and payment received
                            </p>
                            <p className="text-xs text-gray-500">
                              Dec 8, 2024 at 10:30 AM
                            </p>
                          </div>
                        </div>

                        {/* Point 2: Processing */}
                        <div className="flex items-start gap-4">
                          <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-xl">
                            <Package className="w-8 h-8 text-white" />
                          </div>
                          <div className="flex-1 bg-white rounded-xl p-4 shadow-md">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-gray-900">
                                Order Processing
                              </h4>
                              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                Completed
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              Items picked from warehouse and packaged securely
                            </p>
                            <p className="text-xs text-gray-500">
                              Dec 8, 2024 at 4:45 PM
                            </p>
                          </div>
                        </div>

                        {/* Point 3: Shipped */}
                        <div className="flex items-start gap-4">
                          <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl animate-pulse">
                            <Truck className="w-8 h-8 text-white" />
                          </div>
                          <div className="flex-1 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-4 shadow-md">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-gray-900">In Transit</h4>
                              <span className="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded-full flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                                Active Now
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              Package is on the way to your location via
                              Pravidhi Express Cargo
                            </p>
                            <p className="text-xs text-gray-500 mb-3">
                              Dec 9, 2024 at 9:00 AM
                            </p>
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-amber-600" />
                              <span className="text-gray-700">
                                Current Location:{" "}
                                <span className="text-amber-700">
                                  Pokhara Distribution Center
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Point 4: Out for Delivery */}
                        <div className="flex items-start gap-4">
                          <div className="relative z-10 w-16 h-16 rounded-2xl bg-gray-200 flex items-center justify-center">
                            <Truck className="w-8 h-8 text-gray-400" />
                          </div>
                          <div className="flex-1 bg-white rounded-xl p-4 shadow-md opacity-60">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-gray-900">
                                Out for Delivery
                              </h4>
                              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                Pending
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              Package will be delivered to your address
                            </p>
                            <p className="text-xs text-gray-500">
                              Expected: Dec 12, 2024
                            </p>
                          </div>
                        </div>

                        {/* Point 5: Delivered */}
                        <div className="flex items-start gap-4">
                          <div className="relative z-10 w-16 h-16 rounded-2xl bg-gray-200 flex items-center justify-center">
                            <Home className="w-8 h-8 text-gray-400" />
                          </div>
                          <div className="flex-1 bg-white rounded-xl p-4 shadow-md opacity-60">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-gray-900">Delivered</h4>
                              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                Pending
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              Package delivered successfully
                            </p>
                            <p className="text-xs text-gray-500">
                              Expected: Dec 12, 2024 by 6:00 PM
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Live Updates Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg"
                >
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-purple-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl text-gray-900">Live Updates</h2>
                        <p className="text-sm text-gray-600">
                          Real-time tracking events
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Desktop: Horizontal Timeline */}
                    <div className="hidden md:block">
                      <OrderTimeline
                        currentStep={orderData.currentStep}
                        orientation="horizontal"
                        orderStatus={orderData.status as any}
                      />
                    </div>

                    {/* Mobile: Vertical Timeline */}
                    <div className="md:hidden">
                      <OrderTimeline
                        currentStep={orderData.currentStep}
                        orientation="vertical"
                        orderStatus={orderData.status as any}
                      />
                    </div>
                  </div>

                  {/* Estimated Delivery Banner */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-t border-green-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Estimated Delivery
                        </p>
                        <p className="text-lg text-gray-900">
                          {orderData.expectedDelivery}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Courier Information */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg text-gray-900 mb-1">
                        Courier Information
                      </h3>
                      <p className="text-sm text-gray-600">
                        Track your package with our courier partner
                      </p>
                    </div>
                    <div className="text-4xl">{orderData.courier.logo}</div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm text-gray-600">
                        Courier Partner
                      </span>
                      <span className="text-sm text-gray-900">
                        {orderData.courier.name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm text-gray-600">AWB Number</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900 font-mono">
                          {orderData.courier.awbNumber}
                        </span>
                        <button
                          onClick={() =>
                            copyToClipboard(orderData.courier.awbNumber)
                          }
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <Copy className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm text-gray-600">
                        Expected Delivery
                      </span>
                      <span className="text-sm text-amber-600">
                        {orderData.expectedDelivery}
                      </span>
                    </div>

                    <button className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-lg hover:shadow-amber-500/25 rounded-xl text-white transition-all">
                      <ExternalLink className="w-4 h-4" />
                      <span>Track with {orderData.courier.name}</span>
                    </button>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-amber-600" />
                    Order Items
                  </h3>

                  <div className="space-y-4">
                    {orderData.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                      >
                        <div className="w-20 h-20 rounded-xl bg-white border border-gray-200 overflow-hidden flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-gray-900 mb-1">{item.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">
                            SKU: {item.sku} • {item.brand}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 text-xs">
                            <span className="px-2 py-1 bg-amber-50 border border-amber-200 rounded text-amber-700">
                              {item.category}
                            </span>
                            <span className="flex items-center gap-1 text-gray-600">
                              <Shield className="w-3 h-3" />
                              {item.warranty} warranty
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-gray-600 mb-1">
                            Qty: {item.quantity}
                          </p>
                          <p className="text-lg text-gray-900">
                            NPR {item.totalPrice.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity Log */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-600" />
                    Activity Log
                  </h3>

                  <div className="space-y-3">
                    {orderData.activityLog.map((activity, index) => (
                      <div
                        key={activity.id}
                        className="flex gap-3 pb-3 border-b border-gray-200 last:border-0 last:pb-0"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          {activity.icon === "truck" && (
                            <Truck className="w-4 h-4 text-amber-600" />
                          )}
                          {activity.icon === "package" && (
                            <Package className="w-4 h-4 text-blue-600" />
                          )}
                          {activity.icon === "check" && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                          {activity.icon === "user" && (
                            <User className="w-4 h-4 text-orange-600" />
                          )}
                          {activity.icon === "credit" && (
                            <CreditCard className="w-4 h-4 text-purple-600" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 mb-1">
                            {activity.event}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{activity.timestamp}</span>
                            <span>•</span>
                            <span>{activity.actor}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Summary & Shipping */}
              <div className="space-y-6">
                {/* Order Summary */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg text-gray-900 mb-4">Order Summary</h3>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Subtotal</span>
                      <span className="text-sm text-gray-900">
                        NPR {orderData.totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Shipping</span>
                      <span className="text-sm text-green-600">Free</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <span className="text-gray-900">Total</span>
                      <span className="text-xl text-gray-900">
                        NPR {orderData.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <PaymentIcon className="w-4 h-4 text-amber-600" />
                      <span className="text-sm text-gray-600">
                        Payment Method
                      </span>
                    </div>
                    <p className="text-gray-900">{orderData.paymentMethod}</p>
                    <span className="inline-block mt-2 px-2 py-1 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                      {orderData.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Shipping Details */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-amber-600" />
                    Shipping Details
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Recipient</p>
                      <p className="text-gray-900">{orderData.customer.name}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Delivery Address
                      </p>
                      <p className="text-gray-900 text-sm">
                        {orderData.customer.address}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Landmark: {orderData.customer.landmark}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gray-200 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-900">
                          {orderData.customer.phone}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-900">
                          {orderData.customer.email}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Need Help? */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
                  <h3 className="text-lg text-gray-900 mb-2">Need Help?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Our support team is here to assist you with any questions
                    about your order.
                  </p>
                  <button className="w-full py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl text-gray-900 transition-all">
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <CustomerFooter />
    </div>
  );
};
