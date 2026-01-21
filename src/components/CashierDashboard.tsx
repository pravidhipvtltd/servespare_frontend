import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Settings,
  Wrench,
  LogOut,
  Menu,
  X,
  Search,
  Package,
  TrendingUp,
  DollarSign,
  LayoutDashboard,
  History,
  CreditCard,
  Banknote,
  ChevronRight,
  Users,
  Receipt,
  Clock,
  Filter,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Printer,
  Scan,
  Calculator,
  AlertTriangle,
  TrendingDown,
  FileText,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useSync } from "../contexts/SyncContext";
import { usePermissions } from "../contexts/PermissionContext";
import { PermissionGuard } from "./PermissionGuard";
import { InventoryItem, Bill, BillItem, CashTransaction } from "../types";
import { getFromStorage, saveToStorage } from "../utils/mockData";
import { getPermissionForPanel } from "../utils/permissionMapping";
import { CashierCashDrawerPanel } from "./panels/CashierCashDrawerPanel";

type MenuItem = {
  id: string;
  label: string;
  icon: any;
  panel?: string;
};

const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    panel: "dashboard",
  },
  { id: "pos", label: "Billing & POS", icon: ShoppingCart, panel: "pos" },
  { id: "sales", label: "Sales History", icon: History, panel: "sales" },
  { id: "cash", label: "Cash Drawer", icon: Wallet, panel: "cash" },
  { id: "eod", label: "End of Day", icon: FileText, panel: "eod" },
];

export const CashierDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { hasPermission } = usePermissions();
  const [activePanel, setActivePanel] = useState("pos");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // POS State
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [cart, setCart] = useState<BillItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("+977");
  const [customerType, setCustomerType] = useState<"retail" | "workshop">(
    "retail"
  );
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "esewa" | "khalti" | "card" | "bank"
  >("cash");
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
    "percentage"
  );
  const [taxRate, setTaxRate] = useState(13); // 13% VAT in Nepal
  const [amountReceived, setAmountReceived] = useState(0);
  const [showChangeCalculator, setShowChangeCalculator] = useState(false);

  // Cash Drawer State
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>(
    []
  );
  const [shiftStartCash, setShiftStartCash] = useState(0);
  const [shiftStarted, setShiftStarted] = useState(false);

  useEffect(() => {
    loadData();
    loadShiftData();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadData = () => {
    const allInventory: InventoryItem[] = getFromStorage("inventory", []);
    const allBills: Bill[] = getFromStorage("bills", []);
    const allCashTransactions: CashTransaction[] = getFromStorage(
      "cashTransactions",
      []
    );

    setInventory(
      allInventory.filter((i) => i.workspaceId === currentUser?.workspaceId)
    );
    setBills(
      allBills.filter((b) => b.workspaceId === currentUser?.workspaceId)
    );
    setCashTransactions(
      allCashTransactions.filter(
        (c) => c.workspaceId === currentUser?.workspaceId
      )
    );
  };

  const loadShiftData = () => {
    const shiftData = getFromStorage(`shift_${currentUser?.id}`, null);
    if (shiftData && shiftData.date === new Date().toDateString()) {
      setShiftStarted(true);
      setShiftStartCash(shiftData.startCash);
    }
  };

  const startShift = (startingCash: number) => {
    const shiftData = {
      date: new Date().toDateString(),
      startCash: startingCash,
      startTime: new Date().toISOString(),
      cashierId: currentUser?.id,
      cashierName: currentUser?.name,
    };
    saveToStorage(`shift_${currentUser?.id}`, shiftData);
    setShiftStartCash(startingCash);
    setShiftStarted(true);
  };

  const addToCart = (item: InventoryItem) => {
    // Check stock availability
    if (item.quantity === 0) {
      alert("⚠️ Out of Stock! Please inform the storekeeper.");
      return;
    }

    const existingItem = cart.find((c) => c.itemId === item.id);

    if (existingItem) {
      const newQuantity = existingItem.quantity + 1;
      if (newQuantity > item.quantity) {
        alert(`⚠️ Only ${item.quantity} units available in stock!`);
        return;
      }
      setCart(
        cart.map((c) =>
          c.itemId === item.id
            ? { ...c, quantity: newQuantity, total: newQuantity * c.price }
            : c
        )
      );
    } else {
      const newItem: BillItem = {
        itemId: item.id,
        itemName: item.name,
        quantity: 1,
        price: item.retailPrice || item.price,
        total: item.retailPrice || item.price,
      };
      setCart([...cart, newItem]);
    }

    // Check for low stock and alert
    if (item.quantity <= item.minStockLevel) {
      alert(
        `⚠️ Low Stock Alert: ${item.name} is running low (${item.quantity} units). Please inform storekeeper!`
      );
    }
  };

  const updateCartQuantity = (itemId: string, change: number) => {
    const inventoryItem = inventory.find((i) => i.id === itemId);
    if (!inventoryItem) return;

    setCart(
      cart.map((c) => {
        if (c.itemId === itemId) {
          const newQuantity = Math.max(1, c.quantity + change);
          if (newQuantity > inventoryItem.quantity) {
            alert(`⚠️ Only ${inventoryItem.quantity} units available!`);
            return c;
          }
          return { ...c, quantity: newQuantity, total: newQuantity * c.price };
        }
        return c;
      })
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter((c) => c.itemId !== itemId));
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const discountAmount =
      discountType === "percentage" ? (subtotal * discount) / 100 : discount;
    const afterDiscount = subtotal - discountAmount;
    const tax = (afterDiscount * taxRate) / 100;
    const total = afterDiscount + tax;

    return { subtotal, discountAmount, tax, total };
  };

  const handleCheckout = () => {
    if (!shiftStarted) {
      alert("⚠️ Please start your shift first!");
      return;
    }

    if (cart.length === 0) {
      alert("⚠️ Cart is empty!");
      return;
    }

    const { subtotal, total, discountAmount, tax } = calculateTotals();

    // Show change calculator for cash payments
    if (paymentMethod === "cash") {
      setShowChangeCalculator(true);
      return;
    }

    completeSale(total);
  };

  const completeSale = (total: number) => {
    const { subtotal, discountAmount, tax } = calculateTotals();

    const newBill: Bill = {
      id: `bill${Date.now()}`,
      billNumber: `BIL-${Date.now()}`,
      customerName: customerName || "Walk-in Customer",
      customerPhone,
      customerType,
      items: cart,
      subtotal,
      tax,
      discount: discountAmount,
      discountType,
      total,
      paymentMethod,
      paymentStatus: "paid",
      workspaceId: currentUser?.workspaceId,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.id,
      cashierName: currentUser?.name,
    };

    // Update inventory - reduce stock
    const allInventory: InventoryItem[] = getFromStorage("inventory", []);
    const updatedInventory = allInventory.map((item) => {
      const cartItem = cart.find((c) => c.itemId === item.id);
      if (cartItem) {
        return { ...item, quantity: item.quantity - cartItem.quantity };
      }
      return item;
    });
    saveToStorage("inventory", updatedInventory);

    // Save bill
    const allBills: Bill[] = getFromStorage("bills", []);
    saveToStorage("bills", [...allBills, newBill]);

    // Emit billCreated event for cash drawer tracking
    const billCreatedEvent = new CustomEvent("billCreated", {
      detail: newBill,
    });
    window.dispatchEvent(billCreatedEvent);

    // Record cash transaction if cash payment
    if (paymentMethod === "cash") {
      const cashTxn: CashTransaction = {
        id: `cash${Date.now()}`,
        type: "in",
        amount: total,
        description: `Sale - ${newBill.billNumber}`,
        category: "Sales",
        workspaceId: currentUser?.workspaceId,
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.id,
      };
      const allCashTxns: CashTransaction[] = getFromStorage(
        "cashTransactions",
        []
      );
      saveToStorage("cashTransactions", [...allCashTxns, cashTxn]);
    }

    // Reset
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setDiscount(0);
    setAmountReceived(0);
    setShowChangeCalculator(false);
    loadData();

    alert("✅ Sale completed successfully!\n\nReceipt printed.");

    // Print receipt (in real app, would connect to printer)
    printReceipt(newBill);
  };

  const printReceipt = (bill: Bill) => {
    console.log("Printing receipt:", bill);
    // In real implementation, would send to POS printer
  };

  const filteredInventory = inventory.filter(
    (item) =>
      (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.partNumber || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (item.barcode || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const todayBills = bills.filter(
    (b) =>
      new Date(b.createdAt).toDateString() === new Date().toDateString() &&
      b.createdBy === currentUser?.id
  );

  const todayRevenue = todayBills.reduce((sum, b) => sum + b.total, 0);
  const todayCashSales = todayBills
    .filter((b) => b.paymentMethod === "cash")
    .reduce((sum, b) => sum + b.total, 0);

  const renderPanel = () => {
    const panelContent = (() => {
      switch (activePanel) {
        case "dashboard":
          return (
            <DashboardView
              bills={todayBills}
              todayRevenue={todayRevenue}
              todayCashSales={todayCashSales}
              inventory={inventory}
              onNavigate={setActivePanel}
              shiftStarted={shiftStarted}
              currentUser={currentUser}
            />
          );
        case "pos":
          return (
            <POSView
              inventory={filteredInventory}
              cart={cart}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              customerName={customerName}
              setCustomerName={setCustomerName}
              customerPhone={customerPhone}
              setCustomerPhone={setCustomerPhone}
              customerType={customerType}
              setCustomerType={setCustomerType}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              discount={discount}
              setDiscount={setDiscount}
              discountType={discountType}
              setDiscountType={setDiscountType}
              taxRate={taxRate}
              setTaxRate={setTaxRate}
              addToCart={addToCart}
              updateCartQuantity={updateCartQuantity}
              removeFromCart={removeFromCart}
              calculateTotals={calculateTotals}
              handleCheckout={handleCheckout}
              shiftStarted={shiftStarted}
              showChangeCalculator={showChangeCalculator}
              setShowChangeCalculator={setShowChangeCalculator}
              amountReceived={amountReceived}
              setAmountReceived={setAmountReceived}
              completeSale={completeSale}
            />
          );
        case "sales":
          return <SalesHistoryView bills={todayBills} />;
        case "cash":
          return <CashierCashDrawerPanel />;
        case "eod":
          return (
            <EndOfDayView
              todayBills={todayBills}
              todayRevenue={todayRevenue}
              todayCashSales={todayCashSales}
              cashTransactions={cashTransactions}
              shiftStartCash={shiftStartCash}
              shiftStarted={shiftStarted}
            />
          );
        default:
          return (
            <POSView
              inventory={filteredInventory}
              cart={cart}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              customerName={customerName}
              setCustomerName={setCustomerName}
              customerPhone={customerPhone}
              setCustomerPhone={setCustomerPhone}
              customerType={customerType}
              setCustomerType={setCustomerType}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              discount={discount}
              setDiscount={setDiscount}
              discountType={discountType}
              setDiscountType={setDiscountType}
              taxRate={taxRate}
              setTaxRate={setTaxRate}
              addToCart={addToCart}
              updateCartQuantity={updateCartQuantity}
              removeFromCart={removeFromCart}
              calculateTotals={calculateTotals}
              handleCheckout={handleCheckout}
              shiftStarted={shiftStarted}
              showChangeCalculator={showChangeCalculator}
              setShowChangeCalculator={setShowChangeCalculator}
              amountReceived={amountReceived}
              setAmountReceived={setAmountReceived}
              completeSale={completeSale}
            />
          );
      }
    })();

    const permissionKey = getPermissionForPanel(activePanel);

    return (
      <PermissionGuard permission={permissionKey}>
        {panelContent}
      </PermissionGuard>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } bg-gray-900 text-white transition-all duration-300 overflow-hidden flex flex-col fixed lg:relative h-full z-20`}
      >
        {/* Logo & Brand */}
        <div className="p-6 flex items-center space-x-3 border-b border-gray-700">
          <div className="relative">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-yellow-400 to-red-500 rounded-2xl blur-2xl opacity-40 animate-pulse"></div>
              <div
                className="absolute inset-0 bg-gradient-to-br from-orange-400 via-yellow-300 to-red-400 rounded-2xl blur-xl opacity-60 animate-pulse"
                style={{ animationDelay: "150ms" }}
              ></div>

              <div className="relative z-10 w-14 h-14 bg-gradient-to-br from-orange-600 via-yellow-500 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/60 ring-2 ring-yellow-400/50 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-1 left-1 w-3 h-3 border border-white/40 rotate-45"></div>
                  <div className="absolute bottom-1 right-1 w-3 h-3 border border-white/40 rotate-45"></div>
                </div>

                <Settings
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-white/30 animate-spin"
                  style={{ animationDuration: "20s" }}
                />
                <Wrench className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-white/50 rotate-45 drop-shadow-lg" />
                <Settings
                  className="relative w-5 h-5 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.9)] animate-spin z-10"
                  style={{
                    animationDuration: "15s",
                    animationDirection: "reverse",
                  }}
                />

                <div className="absolute -top-2 -right-2 w-3 h-3 bg-white rounded-full animate-ping opacity-75"></div>
                <div
                  className="absolute -bottom-1 -left-1 w-2 h-2 bg-yellow-200 rounded-full animate-pulse opacity-90"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-white relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-orange-400 via-yellow-300 to-orange-500 bg-clip-text text-transparent font-bold text-xl tracking-wide animate-pulse">
                Serve Spares
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-600 blur-lg opacity-50 animate-pulse"></span>
            </h1>
            <p className="text-gray-400 text-xs relative inline-block">
              <span
                className="relative z-10 bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent font-semibold tracking-wide animate-pulse"
                style={{ animationDelay: "200ms" }}
              >
                Inventory System
              </span>
            </p>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePanel(item.panel || item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all group ${
                activePanel === (item.panel || item.id)
                  ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <item.icon
                className={`w-5 h-5 ${
                  activePanel === (item.panel || item.id)
                    ? "text-white"
                    : "text-gray-400 group-hover:text-white"
                }`}
              />
              <span className="font-medium">{item.label}</span>
              {activePanel === (item.panel || item.id) && (
                <ChevronRight className="w-4 h-4 ml-auto" />
              )}
            </button>
          ))}
        </nav>

        {/* Shift Status */}
        {shiftStarted && (
          <div className="px-4 pb-2">
            <div className="bg-green-900/30 border border-green-700 rounded-xl p-3">
              <div className="flex items-center space-x-2 text-green-400 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span className="font-semibold">Shift Active</span>
              </div>
              <p className="text-green-300 text-xs mt-1">
                Start: NPR {shiftStartCash.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* User Profile */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {currentUser?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <div className="text-white text-sm font-semibold">
                {currentUser?.name}
              </div>
              <div className="text-gray-400 text-xs">Cashier</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl transition-all text-white"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            <div>
              <h2 className="text-gray-900 text-xl font-bold">
                {
                  menuItems.find(
                    (m) => m.panel === activePanel || m.id === activePanel
                  )?.label
                }
              </h2>
              <p className="text-gray-500 text-sm">
                {currentTime.toLocaleString("en-NP", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </p>
            </div>
          </div>

          {!shiftStarted && activePanel === "pos" && (
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg px-4 py-2 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span className="text-yellow-800 font-semibold">
                Shift Not Started
              </span>
            </div>
          )}
        </header>

        {/* Panel Content */}
        <main className="flex-1 overflow-y-auto p-6">{renderPanel()}</main>
      </div>
    </div>
  );
};

// Dashboard View
const DashboardView: React.FC<any> = ({
  bills,
  todayRevenue,
  todayCashSales,
  inventory,
  onNavigate,
  shiftStarted,
  currentUser,
}) => {
  const lowStockItems = inventory.filter(
    (item: InventoryItem) => item.quantity <= item.minStockLevel
  );
  const outOfStockItems = inventory.filter(
    (item: InventoryItem) => item.quantity === 0
  );

  const stats = [
    {
      label: "Today's Sales",
      value: bills.length,
      icon: ShoppingCart,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      label: "Today's Revenue",
      value: `NPR ${todayRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      label: "Cash Sales",
      value: `NPR ${todayCashSales.toLocaleString()}`,
      icon: Banknote,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Low Stock Alerts",
      value: lowStockItems.length,
      icon: AlertTriangle,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Shift Status Alert */}
      {!shiftStarted && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6">
          <div className="flex items-start space-x-4">
            <AlertTriangle className="w-8 h-8 text-yellow-600 mt-1" />
            <div className="flex-1">
              <h3 className="text-yellow-900 font-bold text-lg mb-2">
                Start Your Shift
              </h3>
              <p className="text-yellow-800 mb-4">
                Please start your shift and enter opening cash before processing
                any sales.
              </p>
              <button
                onClick={() => onNavigate("cash")}
                className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-semibold transition-all"
              >
                Go to Cash Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`${stat.bgColor} w-12 h-12 rounded-xl flex items-center justify-center`}
              >
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className="text-gray-900 text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Stock Alerts */}
      {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-gray-900 font-bold text-lg mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            Stock Alerts - Inform Storekeeper!
          </h3>
          <div className="space-y-3">
            {outOfStockItems.map((item: InventoryItem) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <div className="text-gray-900 font-semibold">
                      {item.name}
                    </div>
                    <div className="text-red-600 text-sm font-semibold">
                      OUT OF STOCK
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {lowStockItems.map((item: InventoryItem) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <TrendingDown className="w-5 h-5 text-yellow-600" />
                  <div>
                    <div className="text-gray-900 font-semibold">
                      {item.name}
                    </div>
                    <div className="text-yellow-600 text-sm">
                      Low Stock: {item.quantity} units remaining
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => onNavigate("pos")}
          className="group bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-8 text-white hover:shadow-2xl hover:shadow-orange-500/50 transition-all text-left"
        >
          <ShoppingCart className="w-12 h-12 mb-4" />
          <h3 className="text-xl font-bold mb-2">Start Billing</h3>
          <p className="text-orange-100 text-sm mb-4">
            Process customer purchase and create invoice
          </p>
          <div className="flex items-center text-white font-semibold">
            <span>Go to POS</span>
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => onNavigate("eod")}
          className="group bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white hover:shadow-2xl hover:shadow-blue-500/50 transition-all text-left"
        >
          <FileText className="w-12 h-12 mb-4" />
          <h3 className="text-xl font-bold mb-2">End of Day Report</h3>
          <p className="text-blue-100 text-sm mb-4">
            View sales summary and cash reconciliation
          </p>
          <div className="flex items-center text-white font-semibold">
            <span>View Report</span>
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* Recent Sales */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-gray-900 font-bold text-lg mb-4">
          Recent Sales (Your Transactions)
        </h3>
        <div className="space-y-3">
          {bills.slice(0, 5).map((bill: Bill) => (
            <div
              key={bill.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
            >
              <div>
                <div className="text-gray-900 font-semibold">
                  {bill.customerName}
                </div>
                <div className="text-gray-500 text-sm">
                  {new Date(bill.createdAt).toLocaleTimeString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-gray-900 font-bold text-lg">
                  NPR {bill.total.toLocaleString()}
                </div>
                <div className="text-gray-500 text-xs">
                  {bill.paymentMethod.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// POS View Component
const POSView: React.FC<any> = ({
  inventory,
  cart,
  searchQuery,
  setSearchQuery,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerType,
  setCustomerType,
  paymentMethod,
  setPaymentMethod,
  discount,
  setDiscount,
  discountType,
  setDiscountType,
  taxRate,
  setTaxRate,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  calculateTotals,
  handleCheckout,
  shiftStarted,
  showChangeCalculator,
  setShowChangeCalculator,
  amountReceived,
  setAmountReceived,
  completeSale,
}) => {
  const { subtotal, discountAmount, tax, total } = calculateTotals();
  const change = amountReceived - total;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Products Section */}
      <div className="lg:col-span-2 space-y-4">
        {/* Search with Barcode Scanner */}
        <div className="relative">
          <Scan className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Scan barcode or search product name/part number..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            autoFocus
          />
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
          {inventory.map((item: InventoryItem) => (
            <button
              key={item.id}
              onClick={() => addToCart(item)}
              disabled={item.quantity === 0}
              className={`bg-white rounded-xl p-4 text-left hover:shadow-lg transition-all border-2 ${
                item.quantity === 0
                  ? "border-red-200 opacity-50 cursor-not-allowed"
                  : item.quantity <= item.minStockLevel
                  ? "border-yellow-400 hover:border-orange-500"
                  : "border-gray-200 hover:border-orange-500"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
                  item.quantity === 0
                    ? "bg-red-100"
                    : item.quantity <= item.minStockLevel
                    ? "bg-yellow-100"
                    : "bg-orange-100"
                }`}
              >
                <Package
                  className={`w-6 h-6 ${
                    item.quantity === 0
                      ? "text-red-600"
                      : item.quantity <= item.minStockLevel
                      ? "text-yellow-600"
                      : "text-orange-600"
                  }`}
                />
              </div>
              <h4 className="text-gray-900 font-semibold text-sm mb-1 line-clamp-2">
                {item.name}
              </h4>
              <p className="text-orange-600 font-bold text-lg mb-2">
                NPR {(item.retailPrice || item.price).toLocaleString()}
              </p>
              <div className="flex items-center justify-between text-xs">
                <span
                  className={`font-semibold ${
                    item.quantity === 0
                      ? "text-red-600"
                      : item.quantity <= item.minStockLevel
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {item.quantity === 0
                    ? "Out of Stock"
                    : `Stock: ${item.quantity}`}
                </span>
              </div>
              {item.quantity <= item.minStockLevel && item.quantity > 0 && (
                <div className="mt-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-semibold">
                  Low Stock!
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Cart Section */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 h-full flex flex-col">
        <h3 className="text-gray-900 font-bold text-xl mb-4">Create Invoice</h3>

        {/* Customer Info */}
        <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Customer Name (Optional)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="Phone +977"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <div className="flex space-x-2">
            <button
              onClick={() => setCustomerType("retail")}
              className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                customerType === "retail"
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Retail
            </button>
            <button
              onClick={() => setCustomerType("workshop")}
              className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                customerType === "workshop"
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Workshop
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
          {cart.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <ShoppingCart className="w-16 h-16 mx-auto mb-3 opacity-50" />
              <p>Cart is empty</p>
              <p className="text-xs mt-2">Scan or select products to add</p>
            </div>
          ) : (
            cart.map((item: BillItem) => (
              <div key={item.itemId} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h5 className="text-gray-900 font-semibold text-sm">
                      {item.itemName}
                    </h5>
                    <p className="text-gray-600 text-xs">
                      NPR {item.price.toLocaleString()} each
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.itemId)}
                    className="text-red-600 hover:bg-red-50 p-1 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateCartQuantity(item.itemId, -1)}
                      className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-bold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.itemId, 1)}
                      className="w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-gray-900 font-bold">
                    NPR {item.total.toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Discount & Tax */}
        <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              placeholder="Discount"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="percentage">%</option>
              <option value="fixed">NPR</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-gray-700 text-sm font-semibold">VAT:</label>
            <input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <span className="text-gray-600">%</span>
          </div>
        </div>

        {/* Totals */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal:</span>
            <span className="font-semibold">
              NPR {subtotal.toLocaleString()}
            </span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount:</span>
              <span className="font-semibold">
                - NPR {discountAmount.toLocaleString()}
              </span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>VAT ({taxRate}%):</span>
            <span className="font-semibold">NPR {tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-900 text-xl font-bold pt-2 border-t border-gray-200">
            <span>Total:</span>
            <span>NPR {total.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Payment Method
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "cash", label: "Cash", icon: Banknote },
              { id: "card", label: "Card", icon: CreditCard },
              { id: "esewa", label: "eSewa", icon: DollarSign },
              { id: "khalti", label: "Khalti", icon: DollarSign },
              { id: "bank", label: "Bank", icon: CreditCard },
            ].map((method) => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id as any)}
                className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center space-x-1 ${
                  paymentMethod === method.id
                    ? "bg-orange-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <method.icon className="w-4 h-4" />
                <span>{method.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={cart.length === 0 || !shiftStarted}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            cart.length === 0 || !shiftStarted
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-orange-600 to-red-600 text-white hover:shadow-xl hover:shadow-orange-500/50"
          }`}
        >
          {!shiftStarted ? "Start Shift First" : "Complete Sale & Print"}
        </button>
      </div>

      {/* Change Calculator Modal */}
      {showChangeCalculator && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Calculator className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-gray-900 font-bold text-xl">Cash Payment</h3>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-gray-600 text-sm mb-1">Total Amount</div>
                <div className="text-gray-900 font-bold text-3xl">
                  NPR {total.toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Amount Received
                </label>
                <input
                  type="number"
                  value={amountReceived}
                  onChange={(e) =>
                    setAmountReceived(parseFloat(e.target.value) || 0)
                  }
                  placeholder="Enter amount received"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-2xl font-bold"
                  autoFocus
                />
              </div>

              {amountReceived > 0 && (
                <div
                  className={`rounded-xl p-4 ${
                    change >= 0
                      ? "bg-green-50 border-2 border-green-200"
                      : "bg-red-50 border-2 border-red-200"
                  }`}
                >
                  <div
                    className={`text-sm mb-1 ${
                      change >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {change >= 0 ? "Change to Return" : "Insufficient Amount"}
                  </div>
                  <div
                    className={`font-bold text-3xl ${
                      change >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    NPR {Math.abs(change).toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowChangeCalculator(false);
                  setAmountReceived(0);
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => completeSale(total)}
                disabled={change < 0}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold ${
                  change < 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                Complete Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sales History View
const SalesHistoryView: React.FC<{ bills: Bill[] }> = ({ bills }) => {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-gray-900 font-bold text-lg mb-4">
          Your Sales Today
        </h3>
        <div className="space-y-3">
          {bills.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <History className="w-16 h-16 mx-auto mb-3 opacity-50" />
              <p>No sales yet today</p>
            </div>
          ) : (
            bills
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .map((bill) => (
                <div key={bill.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-gray-900 font-bold">
                        {bill.billNumber}
                      </div>
                      <div className="text-gray-600 text-sm">
                        {bill.customerName} • {bill.customerType}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {new Date(bill.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-900 text-2xl font-bold">
                        NPR {bill.total.toLocaleString()}
                      </div>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          bill.paymentMethod === "cash"
                            ? "bg-green-100 text-green-700"
                            : bill.paymentMethod === "esewa"
                            ? "bg-blue-100 text-blue-700"
                            : bill.paymentMethod === "khalti"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {bill.paymentMethod.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="text-gray-600 text-sm font-semibold mb-2">
                      Items:
                    </div>
                    {bill.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between text-sm text-gray-700 mb-1"
                      >
                        <span>
                          {item.itemName} × {item.quantity}
                        </span>
                        <span className="font-semibold">
                          NPR {item.total.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

// Cash Drawer View
const CashDrawerView: React.FC<any> = ({
  cashTransactions,
  todayCashSales,
  shiftStartCash,
  shiftStarted,
  startShift,
  currentUser,
  onUpdate,
}) => {
  const [showStartShiftModal, setShowStartShiftModal] = useState(false);
  const [startingCash, setStartingCash] = useState(0);
  const [showCashInOutModal, setShowCashInOutModal] = useState(false);
  const [txnType, setTxnType] = useState<"in" | "out">("in");
  const [txnAmount, setTxnAmount] = useState(0);
  const [txnDescription, setTxnDescription] = useState("");

  const todayCashTransactions = cashTransactions.filter(
    (txn: CashTransaction) =>
      new Date(txn.createdAt).toDateString() === new Date().toDateString()
  );

  const totalCashIn = todayCashTransactions
    .filter((t: CashTransaction) => t.type === "in")
    .reduce((sum: number, t: CashTransaction) => sum + t.amount, 0);

  const totalCashOut = todayCashTransactions
    .filter((t: CashTransaction) => t.type === "out")
    .reduce((sum: number, t: CashTransaction) => sum + t.amount, 0);

  const currentCashInDrawer = shiftStartCash + totalCashIn - totalCashOut;

  const handleStartShift = () => {
    startShift(startingCash);
    setShowStartShiftModal(false);
    setStartingCash(0);
  };

  const handleCashTransaction = () => {
    const newTxn: CashTransaction = {
      id: `cash${Date.now()}`,
      type: txnType,
      amount: txnAmount,
      description: txnDescription,
      category: txnType === "in" ? "Other Income" : "Expense",
      workspaceId: currentUser?.workspaceId,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.id,
    };

    const allTxns: CashTransaction[] = getFromStorage("cashTransactions", []);
    saveToStorage("cashTransactions", [...allTxns, newTxn]);

    setShowCashInOutModal(false);
    setTxnAmount(0);
    setTxnDescription("");
    onUpdate();
  };

  return (
    <div className="space-y-6">
      {!shiftStarted ? (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-yellow-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-yellow-700" />
          </div>
          <h3 className="text-yellow-900 font-bold text-xl mb-2">
            Start Your Shift
          </h3>
          <p className="text-yellow-800 mb-6">
            Please count and enter the opening cash in drawer
          </p>
          <button
            onClick={() => setShowStartShiftModal(true)}
            className="px-8 py-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-bold text-lg transition-all"
          >
            Start Shift
          </button>
        </div>
      ) : (
        <>
          {/* Cash Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
              <Wallet className="w-8 h-8 text-blue-600 mb-3" />
              <h4 className="text-blue-700 font-semibold mb-1">Opening Cash</h4>
              <p className="text-blue-600 text-3xl font-bold">
                NPR {shiftStartCash.toLocaleString()}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
              <ArrowUpCircle className="w-8 h-8 text-green-600 mb-3" />
              <h4 className="text-green-700 font-semibold mb-1">
                Cash In (Sales)
              </h4>
              <p className="text-green-600 text-3xl font-bold">
                NPR {todayCashSales.toLocaleString()}
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border-2 border-orange-200">
              <DollarSign className="w-8 h-8 text-orange-600 mb-3" />
              <h4 className="text-orange-700 font-semibold mb-1">
                Current in Drawer
              </h4>
              <p className="text-orange-600 text-3xl font-bold">
                NPR {currentCashInDrawer.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Cash In/Out Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setTxnType("in");
                setShowCashInOutModal(true);
              }}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl p-4 font-semibold transition-all flex items-center justify-center space-x-2"
            >
              <ArrowUpCircle className="w-5 h-5" />
              <span>Cash In</span>
            </button>
            <button
              onClick={() => {
                setTxnType("out");
                setShowCashInOutModal(true);
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl p-4 font-semibold transition-all flex items-center justify-center space-x-2"
            >
              <ArrowDownCircle className="w-5 h-5" />
              <span>Cash Out</span>
            </button>
          </div>

          {/* Transactions List */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-gray-900 font-bold text-lg mb-4">
              Today's Cash Transactions
            </h3>
            <div className="space-y-3">
              {todayCashTransactions.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <p>No transactions yet</p>
                </div>
              ) : (
                todayCashTransactions
                  .sort(
                    (a: CashTransaction, b: CashTransaction) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  )
                  .map((txn: CashTransaction) => (
                    <div
                      key={txn.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            txn.type === "in" ? "bg-green-100" : "bg-red-100"
                          }`}
                        >
                          {txn.type === "in" ? (
                            <ArrowUpCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <ArrowDownCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <div className="text-gray-900 font-semibold">
                            {txn.description}
                          </div>
                          <div className="text-gray-500 text-sm">
                            {new Date(txn.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`font-bold text-lg ${
                          txn.type === "in" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {txn.type === "in" ? "+" : "-"} NPR{" "}
                        {txn.amount.toLocaleString()}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Start Shift Modal */}
      {showStartShiftModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-gray-900 font-bold text-xl mb-6">
              Start Your Shift
            </h3>
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Opening Cash in Drawer
              </label>
              <input
                type="number"
                value={startingCash}
                onChange={(e) =>
                  setStartingCash(parseFloat(e.target.value) || 0)
                }
                placeholder="Enter amount"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 text-2xl font-bold"
                autoFocus
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowStartShiftModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleStartShift}
                className="flex-1 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-semibold"
              >
                Start Shift
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cash In/Out Modal */}
      {showCashInOutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-gray-900 font-bold text-xl mb-6">
              {txnType === "in" ? "Cash In" : "Cash Out"}
            </h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  value={txnAmount}
                  onChange={(e) =>
                    setTxnAmount(parseFloat(e.target.value) || 0)
                  }
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-xl font-bold"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={txnDescription}
                  onChange={(e) => setTxnDescription(e.target.value)}
                  placeholder="Enter description"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCashInOutModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCashTransaction}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold text-white ${
                  txnType === "in"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                Record {txnType === "in" ? "Cash In" : "Cash Out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// End of Day View
const EndOfDayView: React.FC<any> = ({
  todayBills,
  todayRevenue,
  todayCashSales,
  cashTransactions,
  shiftStartCash,
  shiftStarted,
}) => {
  const [actualCashCount, setActualCashCount] = useState(0);
  const [showCountModal, setShowCountModal] = useState(false);

  const todayCashTransactions = cashTransactions.filter(
    (txn: CashTransaction) =>
      new Date(txn.createdAt).toDateString() === new Date().toDateString()
  );

  const totalCashIn = todayCashTransactions
    .filter((t: CashTransaction) => t.type === "in")
    .reduce((sum: number, t: CashTransaction) => sum + t.amount, 0);

  const totalCashOut = todayCashTransactions
    .filter((t: CashTransaction) => t.type === "out")
    .reduce((sum: number, t: CashTransaction) => sum + t.amount, 0);

  const expectedCash = shiftStartCash + totalCashIn - totalCashOut;
  const variance = actualCashCount - expectedCash;

  const paymentBreakdown = [
    {
      method: "Cash",
      amount: todayBills
        .filter((b) => b.paymentMethod === "cash")
        .reduce((sum, b) => sum + b.total, 0),
    },
    {
      method: "eSewa",
      amount: todayBills
        .filter((b) => b.paymentMethod === "esewa")
        .reduce((sum, b) => sum + b.total, 0),
    },
    {
      method: "Khalti",
      amount: todayBills
        .filter((b) => b.paymentMethod === "khalti")
        .reduce((sum, b) => sum + b.total, 0),
    },
    {
      method: "Card",
      amount: todayBills
        .filter((b) => b.paymentMethod === "card")
        .reduce((sum, b) => sum + b.total, 0),
    },
    {
      method: "Bank",
      amount: todayBills
        .filter((b) => b.paymentMethod === "bank")
        .reduce((sum, b) => sum + b.total, 0),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">End of Day Report</h2>
        <p className="text-blue-100">
          {new Date().toLocaleDateString("en-NP", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Sales Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h4 className="text-gray-600 mb-2">Total Sales</h4>
          <p className="text-gray-900 text-3xl font-bold">
            {todayBills.length}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h4 className="text-gray-600 mb-2">Total Revenue</h4>
          <p className="text-green-600 text-3xl font-bold">
            NPR {todayRevenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h4 className="text-gray-600 mb-2">Cash Sales</h4>
          <p className="text-orange-600 text-3xl font-bold">
            NPR {todayCashSales.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Payment Breakdown */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-gray-900 font-bold text-lg mb-4">
          Payment Method Breakdown
        </h3>
        <div className="space-y-3">
          {paymentBreakdown.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center p-4 bg-gray-50 rounded-xl"
            >
              <span className="text-gray-700 font-semibold">{item.method}</span>
              <span className="text-gray-900 font-bold text-lg">
                NPR {item.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Cash Reconciliation */}
      {shiftStarted && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-gray-900 font-bold text-lg mb-4">
            Cash Reconciliation
          </h3>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between p-4 bg-blue-50 rounded-xl">
              <span className="text-gray-700">Opening Cash</span>
              <span className="text-gray-900 font-bold">
                NPR {shiftStartCash.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between p-4 bg-green-50 rounded-xl">
              <span className="text-gray-700">Cash Sales</span>
              <span className="text-green-600 font-bold">
                + NPR {todayCashSales.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between p-4 bg-red-50 rounded-xl">
              <span className="text-gray-700">Cash Out</span>
              <span className="text-red-600 font-bold">
                - NPR {totalCashOut.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between p-4 bg-orange-50 border-2 border-orange-300 rounded-xl">
              <span className="text-gray-900 font-semibold">Expected Cash</span>
              <span className="text-orange-600 font-bold text-xl">
                NPR {expectedCash.toLocaleString()}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowCountModal(true)}
            className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold hover:shadow-xl transition-all"
          >
            Count Cash & Submit Report
          </button>

          {actualCashCount > 0 && (
            <div
              className={`mt-6 p-6 rounded-xl border-2 ${
                variance === 0
                  ? "bg-green-50 border-green-300"
                  : Math.abs(variance) <= 100
                  ? "bg-yellow-50 border-yellow-300"
                  : "bg-red-50 border-red-300"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-semibold">
                  Actual Cash Count
                </span>
                <span className="text-gray-900 font-bold text-xl">
                  NPR {actualCashCount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span
                  className={`font-bold ${
                    variance === 0
                      ? "text-green-700"
                      : variance > 0
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  Variance
                </span>
                <span
                  className={`font-bold text-2xl ${
                    variance === 0
                      ? "text-green-600"
                      : variance > 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {variance >= 0 ? "+" : ""} NPR {variance.toLocaleString()}
                </span>
              </div>
              {variance !== 0 && (
                <div
                  className={`mt-3 p-3 rounded-lg ${
                    Math.abs(variance) <= 100 ? "bg-yellow-100" : "bg-red-100"
                  }`}
                >
                  <p
                    className={`text-sm ${
                      Math.abs(variance) <= 100
                        ? "text-yellow-800"
                        : "text-red-800"
                    }`}
                  >
                    {Math.abs(variance) <= 100
                      ? "⚠️ Minor variance detected. Report to manager."
                      : "❌ Significant variance! Report to manager immediately."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Count Cash Modal */}
      {showCountModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-gray-900 font-bold text-xl mb-6">
              Count Cash in Drawer
            </h3>
            <div className="mb-6">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
                <div className="text-orange-700 text-sm mb-1">
                  Expected Amount
                </div>
                <div className="text-orange-600 font-bold text-2xl">
                  NPR {expectedCash.toLocaleString()}
                </div>
              </div>
              <label className="block text-gray-700 font-semibold mb-2">
                Actual Cash Count
              </label>
              <input
                type="number"
                value={actualCashCount}
                onChange={(e) =>
                  setActualCashCount(parseFloat(e.target.value) || 0)
                }
                placeholder="Enter counted amount"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-2xl font-bold"
                autoFocus
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCountModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowCountModal(false);
                  alert(
                    "✅ Cash count recorded. Report saved for manager review."
                  );
                }}
                className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
