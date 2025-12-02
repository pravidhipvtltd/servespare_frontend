import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Settings, Wrench, LogOut, Menu, X, Search, 
  Package, TrendingUp, DollarSign, LayoutDashboard, History,
  CreditCard, Banknote, ChevronRight, Users, Receipt, Clock,
  Filter, Plus, Minus, Trash2, CheckCircle, AlertCircle, Printer,
  Scan, Calculator, AlertTriangle, TrendingDown, FileText, Wallet,
  ArrowUpCircle, ArrowDownCircle, BarChart3, RefreshCw, RotateCcw,
  ArrowRight, Activity, TrendingRight, Calendar, Smartphone
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { InventoryItem, Bill, BillItem, CashTransaction } from '../types';
import { getFromStorage, saveToStorage } from '../utils/mockData';

interface ShiftData {
  id: string;
  date: string;
  startTime: string;
  endTime?: string;
  startCash: number;
  endCash?: number;
  cashierId: string;
  cashierName: string;
  totalSales: number;
  totalTransactions: number;
  status: 'active' | 'ended' | 'transferred';
  transferredTo?: string;
}

type MenuItem = {
  id: string;
  label: string;
  icon: any;
  panel?: string;
};

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, panel: 'dashboard' },
  { id: 'pos', label: 'Billing & POS', icon: ShoppingCart, panel: 'pos' },
  { id: 'sales', label: 'Sales History', icon: History, panel: 'sales' },
  { id: 'cash', label: 'Cash Drawer', icon: Wallet, panel: 'cash' },
];

export const CashierDashboardEnhanced: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [activePanel, setActivePanel] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // POS State
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [cart, setCart] = useState<BillItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerType, setCustomerType] = useState<'retail' | 'workshop'>('retail');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'esewa' | 'khalti' | 'card' | 'bank'>('cash');
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [taxRate, setTaxRate] = useState(13);
  const [amountReceived, setAmountReceived] = useState(0);
  const [showChangeCalculator, setShowChangeCalculator] = useState(false);

  // Shift State
  const [currentShift, setCurrentShift] = useState<ShiftData | null>(null);
  const [allShifts, setAllShifts] = useState<ShiftData[]>([]);
  const [showStartShift, setShowStartShift] = useState(false);
  const [showEndShift, setShowEndShift] = useState(false);
  const [showTransferShift, setShowTransferShift] = useState(false);
  const [startingCash, setStartingCash] = useState(0);

  useEffect(() => {
    loadData();
    loadShiftData();
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const loadData = () => {
    const allInventory: InventoryItem[] = getFromStorage('inventory', []);
    const allBills: Bill[] = getFromStorage('bills', []);

    setInventory(allInventory.filter(i => i.workspaceId === currentUser?.workspaceId));
    setBills(allBills.filter(b => b.workspaceId === currentUser?.workspaceId));
  };

  const loadShiftData = () => {
    const shifts: ShiftData[] = getFromStorage('cashier_shifts', []);
    setAllShifts(shifts);
    
    // Find active shift for current cashier
    const activeShift = shifts.find(
      s => s.cashierId === currentUser?.id && s.status === 'active'
    );
    setCurrentShift(activeShift || null);
  };

  const startShift = () => {
    const newShift: ShiftData = {
      id: `shift_${Date.now()}`,
      date: new Date().toISOString(),
      startTime: new Date().toISOString(),
      startCash: startingCash,
      cashierId: currentUser?.id || '',
      cashierName: currentUser?.name || '',
      totalSales: 0,
      totalTransactions: 0,
      status: 'active'
    };

    const shifts = getFromStorage('cashier_shifts', []);
    shifts.push(newShift);
    saveToStorage('cashier_shifts', shifts);
    
    setCurrentShift(newShift);
    setAllShifts(shifts);
    setShowStartShift(false);
    setStartingCash(0);
  };

  const endShift = (endingCash: number) => {
    if (!currentShift) return;

    const updatedShift: ShiftData = {
      ...currentShift,
      endTime: new Date().toISOString(),
      endCash: endingCash,
      status: 'ended'
    };

    const shifts = allShifts.map(s => s.id === currentShift.id ? updatedShift : s);
    saveToStorage('cashier_shifts', shifts);
    
    setCurrentShift(null);
    setAllShifts(shifts);
    setShowEndShift(false);
  };

  const transferShift = (transferToName: string) => {
    if (!currentShift) return;

    const updatedShift: ShiftData = {
      ...currentShift,
      status: 'transferred',
      transferredTo: transferToName
    };

    const shifts = allShifts.map(s => s.id === currentShift.id ? updatedShift : s);
    saveToStorage('cashier_shifts', shifts);
    
    setCurrentShift(null);
    setAllShifts(shifts);
    setShowTransferShift(false);
  };

  const addToCart = (item: InventoryItem) => {
    if (item.quantity === 0) {
      alert('⚠️ Out of Stock!');
      return;
    }

    const existingItem = cart.find(c => c.itemId === item.id);
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + 1;
      if (newQuantity > item.quantity) {
        alert(`⚠️ Only ${item.quantity} units available!`);
        return;
      }
      setCart(cart.map(c => 
        c.itemId === item.id 
          ? { ...c, quantity: newQuantity, total: newQuantity * c.price }
          : c
      ));
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

    if (item.quantity <= item.minStockLevel) {
      alert(`⚠️ Low Stock Alert: ${item.name} (${item.quantity} units)`);
    }
  };

  const updateCartQuantity = (itemId: string, change: number) => {
    const inventoryItem = inventory.find(i => i.id === itemId);
    if (!inventoryItem) return;

    setCart(cart.map(c => {
      if (c.itemId === itemId) {
        const newQuantity = Math.max(1, c.quantity + change);
        if (newQuantity > inventoryItem.quantity) {
          alert(`⚠️ Only ${inventoryItem.quantity} units available!`);
          return c;
        }
        return { ...c, quantity: newQuantity, total: newQuantity * c.price };
      }
      return c;
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(c => c.itemId !== itemId));
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = discountType === 'percentage' 
      ? (subtotal * discount) / 100 
      : discount;
    const afterDiscount = subtotal - discountAmount;
    const tax = (afterDiscount * taxRate) / 100;
    const total = afterDiscount + tax;
    
    return { subtotal, discountAmount, tax, total };
  };

  const handleCheckout = () => {
    if (!currentShift) {
      alert('⚠️ Please start your shift first!');
      setShowStartShift(true);
      return;
    }

    if (cart.length === 0) {
      alert('⚠️ Cart is empty!');
      return;
    }

    if (paymentMethod === 'cash') {
      setShowChangeCalculator(true);
      return;
    }

    completeSale(calculateTotals().total);
  };

  const completeSale = (total: number) => {
    const { subtotal, discountAmount, tax } = calculateTotals();
    
    const newBill: Bill = {
      id: `bill_${Date.now()}`,
      billNumber: `BIL-${Date.now()}`,
      createdAt: new Date().toISOString(),
      customerName: customerName || 'Walk-in Customer',
      customerPhone: customerPhone || '',
      customerType,
      items: cart,
      subtotal,
      discount: discountAmount,
      tax,
      total,
      paymentMethod,
      paymentStatus: 'paid',
      createdBy: currentUser?.name || '',
      workspaceId: currentUser?.workspaceId || '',
      status: 'completed'
    };

    // Update inventory
    const updatedInventory = inventory.map(item => {
      const cartItem = cart.find(c => c.itemId === item.id);
      if (cartItem) {
        return { ...item, quantity: item.quantity - cartItem.quantity };
      }
      return item;
    });

    // Update shift
    if (currentShift) {
      const updatedShift = {
        ...currentShift,
        totalSales: currentShift.totalSales + total,
        totalTransactions: currentShift.totalTransactions + 1
      };
      
      const shifts = allShifts.map(s => s.id === currentShift.id ? updatedShift : s);
      saveToStorage('cashier_shifts', shifts);
      setCurrentShift(updatedShift);
      setAllShifts(shifts);
    }

    const allBills = getFromStorage('bills', []);
    allBills.push(newBill);
    saveToStorage('bills', allBills);
    saveToStorage('inventory', [...getFromStorage('inventory', []).filter((i: InventoryItem) => i.workspaceId !== currentUser?.workspaceId), ...updatedInventory]);

    setBills([...bills, newBill]);
    setInventory(updatedInventory);
    
    // Reset
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setDiscount(0);
    setAmountReceived(0);
    setShowChangeCalculator(false);

    alert('✅ Sale completed successfully!');
    
    // Print receipt (simplified)
    printReceipt(newBill);
  };

  const printReceipt = (bill: Bill) => {
    const printWindow = window.open('', '', 'height=600,width=400');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${bill.billNumber}</title>
          <style>
            body { font-family: monospace; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px dashed #000; padding-bottom: 10px; }
            .item { display: flex; justify-content: space-between; margin: 5px 0; }
            .total { border-top: 2px solid #000; margin-top: 10px; padding-top: 10px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Serve Spares</h2>
            <p>Bill: ${bill.billNumber}</p>
            <p>${new Date(bill.date).toLocaleString()}</p>
          </div>
          <p>Customer: ${bill.customerName}</p>
          <p>Payment: ${bill.paymentMethod}</p>
          <hr>
          ${bill.items.map(item => `
            <div class="item">
              <span>${item.itemName} x${item.quantity}</span>
              <span>NPR ${item.total.toLocaleString()}</span>
            </div>
          `).join('')}
          <div class="total">
            <div class="item"><span>Subtotal:</span><span>NPR ${bill.subtotal.toLocaleString()}</span></div>
            ${bill.discount > 0 ? `<div class="item"><span>Discount:</span><span>-NPR ${bill.discount.toLocaleString()}</span></div>` : ''}
            <div class="item"><span>Tax:</span><span>NPR ${bill.tax.toLocaleString()}</span></div>
            <div class="item" style="font-size: 1.2em;"><span>TOTAL:</span><span>NPR ${bill.total.toLocaleString()}</span></div>
          </div>
          <p style="text-align: center; margin-top: 20px;">Thank you for your business!</p>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  const renderPanel = () => {
    switch (activePanel) {
      case 'dashboard':
        return <DashboardPanel bills={bills} inventory={inventory} currentShift={currentShift} />;
      case 'pos':
        return renderPOS();
      case 'sales':
        return <SalesHistoryPanel bills={bills} />;
      case 'cash':
        return <CashDrawerPanel currentShift={currentShift} bills={bills} />;
      default:
        return <DashboardPanel bills={bills} inventory={inventory} currentShift={currentShift} />;
    }
  };

  const renderPOS = () => {
    const { subtotal, discountAmount, tax, total } = calculateTotals();
    const change = amountReceived - total;
    const filteredInventory = inventory.filter(item =>
      (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.partNumber || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Products Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name or part number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
            {filteredInventory.map((item) => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                disabled={item.quantity === 0}
                className={`group text-left p-4 rounded-xl border-2 transition-all ${
                  item.quantity === 0
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                    : item.quantity <= item.minStockLevel
                    ? 'border-orange-200 bg-orange-50 hover:border-orange-400 hover:shadow-lg'
                    : 'border-gray-200 bg-white hover:border-orange-500 hover:shadow-lg hover:-translate-y-1'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <Package className={`w-8 h-8 ${
                    item.quantity === 0 ? 'text-gray-300' :
                    item.quantity <= item.minStockLevel ? 'text-orange-500' : 'text-gray-400'
                  }`} />
                  {item.quantity <= item.minStockLevel && item.quantity > 0 && (
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                  )}
                </div>
                <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{item.name}</h4>
                <p className="text-xs text-gray-500 mb-2">{item.partNumber}</p>
                <div className="flex items-center justify-between">
                  <span className="text-orange-600 font-bold">NPR {(item.retailPrice || item.price).toLocaleString()}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.quantity === 0 ? 'bg-red-100 text-red-700' :
                    item.quantity <= item.minStockLevel ? 'bg-orange-100 text-orange-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {item.quantity === 0 ? 'Out' : `${item.quantity} pcs`}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {filteredInventory.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No products found</p>
            </div>
          )}
        </div>

        {/* Cart Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex flex-col">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <ShoppingCart className="w-6 h-6 mr-2" />
            Current Sale
          </h3>

          {/* Customer Info */}
          <div className="space-y-2 mb-4">
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer Name (Optional)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="text"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Phone +977-XXXXXXXXXX"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <div className="flex space-x-2">
              <button
                onClick={() => setCustomerType('retail')}
                className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                  customerType === 'retail'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Retail
              </button>
              <button
                onClick={() => setCustomerType('workshop')}
                className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                  customerType === 'workshop'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.itemId} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h5 className="text-gray-900 font-semibold text-sm">{item.itemName}</h5>
                      <p className="text-gray-600 text-xs">NPR {item.price.toLocaleString()} each</p>
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
                      <span className="w-12 text-center font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.itemId, 1)}
                        className="w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-gray-900 font-bold">NPR {item.total.toLocaleString()}</span>
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
          </div>

          {/* Totals */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span className="font-semibold">NPR {subtotal.toLocaleString()}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span className="font-semibold">- NPR {discountAmount.toLocaleString()}</span>
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
            <label className="block text-gray-700 font-semibold mb-2">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'cash', label: 'Cash', icon: Banknote },
                { id: 'card', label: 'Card', icon: CreditCard },
                { id: 'esewa', label: 'eSewa', icon: Smartphone },
                { id: 'khalti', label: 'Khalti', icon: Smartphone },
                { id: 'bank', label: 'Bank', icon: CreditCard },
              ].map(method => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={`px-2 py-2 rounded-lg font-semibold text-xs transition-all flex items-center justify-center space-x-1 ${
                    paymentMethod === method.id
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
            disabled={cart.length === 0 || !currentShift}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              cart.length === 0 || !currentShift
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:shadow-xl'
            }`}
          >
            {!currentShift ? 'Start Shift First' : 'Complete Sale & Print'}
          </button>
        </div>
      </div>
    );
  };

  const { subtotal, discountAmount, tax, total } = calculateTotals();
  const change = amountReceived - total;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-gray-900 text-white transition-all duration-300 overflow-hidden flex flex-col fixed lg:relative h-full z-20`}>
        {/* Logo */}
        <div className="p-6 flex items-center space-x-3 border-b border-gray-700">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <div className="relative z-10 w-14 h-14 bg-gradient-to-br from-orange-600 via-yellow-500 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <Settings className="absolute w-8 h-8 text-white/30 animate-spin" style={{ animationDuration: '20s' }} />
              <Wrench className="absolute w-6 h-6 text-white/50 rotate-45" />
              <Settings className="relative w-5 h-5 text-white animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
            </div>
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-orange-400 via-yellow-300 to-orange-500 bg-clip-text text-transparent font-bold text-xl">
              Serve Spares
            </h1>
            <p className="text-gray-400 text-xs">Cashier Panel</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePanel(item.panel || 'dashboard')}
              className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-all hover:bg-gray-800 ${
                activePanel === item.panel ? 'bg-gradient-to-r from-orange-600 to-red-600 border-l-4 border-yellow-400' : ''
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-semibold">{currentUser?.name}</p>
              <p className="text-gray-400 text-xs">Cashier</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center space-x-2 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {menuItems.find(m => m.panel === activePanel)?.label || 'Dashboard'}
                </h2>
                <p className="text-sm text-gray-500">
                  {currentTime.toLocaleTimeString()} • {currentTime.toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Shift Status */}
              {currentShift ? (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-700 font-semibold">Shift Active</span>
                  </div>
                  <button
                    onClick={() => setShowTransferShift(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold flex items-center space-x-1"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>Transfer</span>
                  </button>
                  <button
                    onClick={() => setShowEndShift(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold flex items-center space-x-1"
                  >
                    <Clock className="w-4 h-4" />
                    <span>End Shift</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowStartShift(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center space-x-2"
                >
                  <Clock className="w-5 h-5" />
                  <span>Start Shift</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Panel Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderPanel()}
        </main>
      </div>

      {/* Start Shift Modal */}
      {showStartShift && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-gray-900 font-bold text-xl">Start Shift</h3>
                <p className="text-gray-500 text-sm">Enter starting cash amount</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Starting Cash (NPR)</label>
              <input
                type="number"
                value={startingCash}
                onChange={(e) => setStartingCash(parseFloat(e.target.value) || 0)}
                placeholder="Enter starting cash"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                autoFocus
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowStartShift(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={startShift}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                Start Shift
              </button>
            </div>
          </div>
        </div>
      )}

      {/* End Shift Modal */}
      {showEndShift && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-gray-900 font-bold text-xl">End Shift</h3>
                <p className="text-gray-500 text-sm">Enter ending cash amount</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-gray-600 text-sm mb-1">Starting Cash</div>
                <div className="text-gray-900 font-bold text-2xl">NPR {currentShift?.startCash.toLocaleString()}</div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <div className="text-blue-600 text-sm mb-1">Total Sales</div>
                <div className="text-blue-900 font-bold text-2xl">NPR {currentShift?.totalSales.toLocaleString()}</div>
                <div className="text-blue-600 text-xs">{currentShift?.totalTransactions} transactions</div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Ending Cash (NPR)</label>
                <input
                  type="number"
                  placeholder="Enter ending cash"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      endShift(parseFloat((e.target as HTMLInputElement).value) || 0);
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowEndShift(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  const input = document.querySelector('input[placeholder="Enter ending cash"]') as HTMLInputElement;
                  endShift(parseFloat(input.value) || 0);
                }}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                End Shift
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Shift Modal */}
      {showTransferShift && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-gray-900 font-bold text-xl">Transfer Shift</h3>
                <p className="text-gray-500 text-sm">Transfer to another cashier</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Transfer To</label>
              <input
                type="text"
                placeholder="Enter cashier name"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    transferShift((e.target as HTMLInputElement).value);
                  }
                }}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowTransferShift(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Enter cashier name"]') as HTMLInputElement;
                  transferShift(input.value);
                }}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Transfer
              </button>
            </div>
          </div>
        </div>
      )}

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
                <div className="text-gray-900 font-bold text-3xl">NPR {total.toLocaleString()}</div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Amount Received</label>
                <input
                  type="number"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(parseFloat(e.target.value) || 0)}
                  placeholder="Enter amount received"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-2xl font-bold"
                  autoFocus
                />
              </div>

              {amountReceived > 0 && (
                <div className={`rounded-xl p-4 ${
                  change >= 0 ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
                }`}>
                  <div className={`text-sm mb-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {change >= 0 ? 'Change to Return' : 'Insufficient Amount'}
                  </div>
                  <div className={`font-bold text-3xl ${change >= 0 ? 'text-green-700' : 'text-red-700'}`}>
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
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => completeSale(total)}
                disabled={change < 0}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-colors ${
                  change < 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
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

// Dashboard Panel Component
const DashboardPanel: React.FC<{ bills: Bill[]; inventory: InventoryItem[]; currentShift: ShiftData | null }> = ({ 
  bills, 
  inventory, 
  currentShift 
}) => {
  const today = new Date().toDateString();
  const todayBills = bills.filter(b => new Date(b.date).toDateString() === today);
  
  // Calculate metrics
  const totalSalesToday = todayBills.reduce((sum, b) => sum + b.total, 0);
  const totalReturnsToday = todayBills.filter(b => b.status === 'returned').length;
  
  const cashSales = todayBills.filter(b => b.paymentMethod === 'cash');
  const cashSalesAmount = cashSales.reduce((sum, b) => sum + b.total, 0);
  const cashSalesQuantity = cashSales.length;
  
  const onlineSales = todayBills.filter(b => ['esewa', 'khalti', 'card', 'bank'].includes(b.paymentMethod));
  const onlineSalesAmount = onlineSales.reduce((sum, b) => sum + b.total, 0);
  const onlineSalesQuantity = onlineSales.length;
  
  const lowStockItems = inventory.filter(i => i.quantity <= i.minStockLevel && i.quantity > 0);
  const outOfStockItems = inventory.filter(i => i.quantity === 0);
  
  // Last 7 days data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toDateString();
  }).reverse();
  
  const salesByDay = last7Days.map(day => {
    const dayBills = bills.filter(b => new Date(b.date).toDateString() === day);
    return {
      day: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
      date: day,
      sales: dayBills.reduce((sum, b) => sum + b.total, 0),
      count: dayBills.length
    };
  });
  
  const maxSales = Math.max(...salesByDay.map(d => d.sales));

  const stats = [
    {
      label: 'Total Sales Today',
      value: `NPR ${totalSalesToday.toLocaleString()}`,
      icon: DollarSign,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      count: `${todayBills.length} transactions`,
      trend: '+12%'
    },
    {
      label: 'Total Returns',
      value: totalReturnsToday,
      icon: RotateCcw,
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      count: 'today',
    },
    {
      label: 'Cash Sales',
      value: `NPR ${cashSalesAmount.toLocaleString()}`,
      icon: Banknote,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      count: `${cashSalesQuantity} transactions`,
    },
    {
      label: 'Online Sales',
      value: `NPR ${onlineSalesAmount.toLocaleString()}`,
      icon: Smartphone,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      count: `${onlineSalesQuantity} transactions`,
    },
    {
      label: 'Low Stock Alert',
      value: lowStockItems.length,
      icon: AlertTriangle,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      count: `${outOfStockItems.length} out of stock`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Shift Info Banner */}
      {currentShift && (
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Clock className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-1">Active Shift</h3>
                <p className="text-green-100">Started at {new Date(currentShift.startTime).toLocaleTimeString()}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-green-100 text-sm mb-1">Shift Sales</div>
              <div className="text-3xl font-bold">NPR {currentShift.totalSales.toLocaleString()}</div>
              <div className="text-green-100 text-sm">{currentShift.totalTransactions} transactions</div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bgColor} w-12 h-12 rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              {stat.trend && (
                <span className="text-green-600 text-sm font-semibold flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {stat.trend}
                </span>
              )}
            </div>
            <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
            <p className="text-gray-900 text-2xl font-bold mb-1">{stat.value}</p>
            <p className="text-gray-500 text-xs">{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Sales Graph */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Daily Sales Trend
            </h3>
            <p className="text-sm text-gray-500">Last 7 days comparison</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Peak Day</p>
            <p className="text-lg font-bold text-gray-900">NPR {maxSales.toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-3">
          {salesByDay.map((day, idx) => {
            const percentage = maxSales > 0 ? (day.sales / maxSales) * 100 : 0;
            const isToday = day.date === today;
            
            return (
              <div key={idx} className={`${isToday ? 'bg-orange-50 p-3 rounded-lg' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className={`text-sm font-semibold ${isToday ? 'text-orange-600' : 'text-gray-600'}`}>
                      {day.day}
                    </span>
                    {isToday && (
                      <span className="text-xs bg-orange-600 text-white px-2 py-1 rounded-full">Today</span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${isToday ? 'text-orange-900' : 'text-gray-900'}`}>
                      NPR {day.sales.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">{day.count} sales</p>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isToday ? 'bg-gradient-to-r from-orange-500 to-red-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-orange-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
            Low Stock Alerts ({lowStockItems.length})
          </h3>
          <div className="space-y-3">
            {lowStockItems.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Package className="w-8 h-8 text-orange-600" />
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.partNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-orange-600 font-bold">{item.quantity} units</p>
                  <p className="text-xs text-gray-500">Min: {item.minStockLevel}</p>
                </div>
              </div>
            ))}
          </div>
          {lowStockItems.length > 5 && (
            <p className="text-center text-sm text-gray-500 mt-3">
              +{lowStockItems.length - 5} more items
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// Sales History Panel
const SalesHistoryPanel: React.FC<{ bills: Bill[] }> = ({ bills }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('today');
  
  const getFilteredBills = () => {
    const now = new Date();
    let filtered = bills;
    
    if (filterDate === 'today') {
      filtered = bills.filter(b => new Date(b.date).toDateString() === now.toDateString());
    } else if (filterDate === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = bills.filter(b => new Date(b.date) >= weekAgo);
    } else if (filterDate === 'month') {
      filtered = bills.filter(b => {
        const billDate = new Date(b.date);
        return billDate.getMonth() === now.getMonth() && billDate.getFullYear() === now.getFullYear();
      });
    }
    
    if (searchTerm) {
      filtered = filtered.filter(b => 
        b.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const filteredBills = getFilteredBills();

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by bill number or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-2">
            {['today', 'week', 'month', 'all'].map(period => (
              <button
                key={period}
                onClick={() => setFilterDate(period)}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                  filterDate === period
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bills List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Bill #</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date & Time</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Items</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Payment</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900">{bill.billNumber}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{new Date(bill.date).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">{new Date(bill.date).toLocaleTimeString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-gray-900">{bill.customerName}</p>
                    {bill.customerPhone && <p className="text-xs text-gray-500">{bill.customerPhone}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{bill.items.length} items</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                      bill.paymentMethod === 'cash' ? 'bg-green-100 text-green-700' :
                      bill.paymentMethod === 'card' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {bill.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-gray-900">NPR {bill.total.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredBills.length === 0 && (
        <div className="text-center py-12">
          <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No sales found</p>
        </div>
      )}
    </div>
  );
};

// Cash Drawer Panel
const CashDrawerPanel: React.FC<{ currentShift: ShiftData | null; bills: Bill[] }> = ({ currentShift, bills }) => {
  if (!currentShift) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 border border-gray-100 text-center">
        <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No active shift</p>
        <p className="text-sm text-gray-400 mt-2">Start a shift to manage cash drawer</p>
      </div>
    );
  }

  const shiftBills = bills.filter(b => new Date(b.date) >= new Date(currentShift.startTime));
  const cashSales = shiftBills.filter(b => b.paymentMethod === 'cash');
  const totalCashSales = cashSales.reduce((sum, b) => sum + b.total, 0);
  const expectedCash = currentShift.startCash + totalCashSales;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Wallet className="w-10 h-10 opacity-80" />
            <span className="text-3xl font-bold">{cashSales.length}</span>
          </div>
          <h3 className="text-xl font-bold mb-1">Starting Cash</h3>
          <p className="text-blue-100 text-2xl font-bold">NPR {currentShift.startCash.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-10 h-10 opacity-80" />
            <span className="text-3xl font-bold">{cashSales.length}</span>
          </div>
          <h3 className="text-xl font-bold mb-1">Cash Sales</h3>
          <p className="text-green-100 text-2xl font-bold">NPR {totalCashSales.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Calculator className="w-10 h-10 opacity-80" />
          </div>
          <h3 className="text-xl font-bold mb-1">Expected Cash</h3>
          <p className="text-orange-100 text-2xl font-bold">NPR {expectedCash.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Cash Transactions</h3>
        <div className="space-y-2">
          {cashSales.map((bill) => (
            <div key={bill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">{bill.billNumber}</p>
                <p className="text-sm text-gray-500">{new Date(bill.date).toLocaleTimeString()}</p>
              </div>
              <span className="font-bold text-green-600">+NPR {bill.total.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CashierDashboardEnhanced;
