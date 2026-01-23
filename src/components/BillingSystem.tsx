import React, { useState } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Smartphone,
  Check,
} from "lucide-react";
import { InventoryItem, Transaction } from "../types";
import { getFromStorage, saveToStorage } from "../utils/mockData";
import { useAuth } from "../contexts/AuthContext";

interface BillingSystemProps {
  inventory: InventoryItem[];
  onTransactionComplete: () => void;
}

interface CartItem {
  item: InventoryItem;
  quantity: number;
}

export const BillingSystem: React.FC<BillingSystemProps> = ({
  inventory,
  onTransactionComplete,
}) => {
  const { currentUser } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("+977");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "upi">(
    "cash"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredInventory = inventory.filter(
    (item) =>
      (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.partNumber || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (item: InventoryItem) => {
    const existing = cart.find((c) => c.item.id === item.id);
    if (existing) {
      if (existing.quantity < item.quantity) {
        setCart(
          cart.map((c) =>
            c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
          )
        );
      } else {
        alert("Not enough stock available");
      }
    } else {
      if (item.quantity > 0) {
        setCart([...cart, { item, quantity: 1 }]);
      } else {
        alert("Item out of stock");
      }
    }
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(
      cart.map((c) => {
        if (c.item.id === itemId) {
          const newQuantity = c.quantity + delta;
          if (newQuantity <= 0) return c;
          if (newQuantity > c.item.quantity) {
            alert("Not enough stock available");
            return c;
          }
          return { ...c, quantity: newQuantity };
        }
        return c;
      })
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter((c) => c.item.id !== itemId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    // Create transaction
    const transaction: Transaction = {
      id: `txn${Date.now()}`,
      items: cart.map((c) => ({
        itemId: c.item.id,
        itemName: c.item.name,
        quantity: c.quantity,
        price: c.item.price,
      })),
      total: calculateTotal(),
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      paymentMethod,
      processedBy: currentUser?.id || "",
      workspaceId: currentUser?.workspaceId,
      createdAt: new Date().toISOString(),
    };

    // Update inventory quantities
    const allInventory: InventoryItem[] = getFromStorage("inventory", []);
    const updatedInventory = allInventory.map((item) => {
      const cartItem = cart.find((c) => c.item.id === item.id);
      if (cartItem) {
        return {
          ...item,
          quantity: item.quantity - cartItem.quantity,
          lastUpdated: new Date().toISOString(),
        };
      }
      return item;
    });

    // Save transaction and inventory
    const allTransactions: Transaction[] = getFromStorage("transactions", []);
    saveToStorage("transactions", [...allTransactions, transaction]);
    saveToStorage("inventory", updatedInventory);

    // Reset form
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setSearchQuery("");
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);

    onTransactionComplete();
  };

  const total = calculateTotal();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Side - Item Selection */}
      <div className="lg:col-span-2 space-y-4">
        <div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto">
          {filteredInventory.map((item) => (
            <div
              key={item.id}
              onClick={() => addToCart(item)}
              className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-gray-900">{item.name}</h4>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    item.category === "branded"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {item.category}
                </span>
              </div>
              <p className="text-gray-500 text-sm mb-2">{item.partNumber}</p>
              <div className="flex items-center justify-between">
                <span className="text-gray-900">Rs{item.price}</span>
                <span
                  className={`text-sm ${
                    item.quantity <= item.reorderLevel
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  Stock: {item.quantity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Cart & Checkout */}
      <div className="space-y-4">
        {/* Cart */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-orange-600" />
            <h3 className="text-gray-900">Cart ({cart.length})</h3>
          </div>

          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
            {cart.map((cartItem) => (
              <div key={cartItem.item.id} className="bg-gray-50 p-3 rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="text-gray-900 text-sm">
                      {cartItem.item.name}
                    </div>
                    <div className="text-gray-500 text-xs">
                      Rs{cartItem.item.price} each
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(cartItem.item.id)}
                    className="text-red-600 hover:bg-red-50 p-1 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(cartItem.item.id, -1)}
                      className="w-7 h-7 flex items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-gray-900 w-8 text-center">
                      {cartItem.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(cartItem.item.id, 1)}
                      className="w-7 h-7 flex items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-gray-900">
                    Rs
                    {(cartItem.item.price * cartItem.quantity).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {cart.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Cart is empty</p>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">Rs{total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900 text-2xl">
                Rs{total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="text-gray-900 mb-4">Customer Details (Optional)</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer Name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => {
                const value = e.target.value;
                if (value.startsWith("+977")) {
                  if (value.length <= 14) {
                    setCustomerPhone(value);
                  }
                } else if (value.length <= 10) {
                  setCustomerPhone(value);
                }
              }}
              maxLength={14}
              placeholder="+977"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="text-gray-900 mb-4">Payment Method</h3>
          <div className="space-y-2">
            {[
              { value: "cash", label: "Cash", icon: Banknote },
              { value: "card", label: "Card", icon: CreditCard },
              { value: "upi", label: "UPI", icon: Smartphone },
            ].map((method) => (
              <button
                key={method.value}
                onClick={() => setPaymentMethod(method.value as any)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                  paymentMethod === method.value
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <method.icon
                    className={`w-5 h-5 ${
                      paymentMethod === method.value
                        ? "text-orange-600"
                        : "text-gray-600"
                    }`}
                  />
                  <span
                    className={
                      paymentMethod === method.value
                        ? "text-orange-900"
                        : "text-gray-900"
                    }
                  >
                    {method.label}
                  </span>
                </div>
                {paymentMethod === method.value && (
                  <Check className="w-5 h-5 text-orange-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={cart.length === 0}
          className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          Complete Sale - Rs{total.toLocaleString()}
        </button>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center space-x-3 z-50">
          <Check className="w-6 h-6" />
          <span>Transaction completed successfully!</span>
        </div>
      )}
    </div>
  );
};
