import React, { useState, useEffect } from 'react';
import {
  ShoppingCart, LogOut, Menu, X, Search, Plus, Minus, Trash2,
  CreditCard, Banknote, Clock, Users, Receipt, Printer, Scan,
  Calculator, CheckCircle, AlertCircle, DollarSign, TrendingUp,
  Package, Activity, BarChart3, History, RotateCcw, Wallet,
  Smartphone, Building2, ArrowRight, RefreshCw, Eye, Edit2,
  Calendar, FileText, Filter, Download, User, Phone, Mail,
  ArrowUpCircle, ArrowDownCircle, Power, Send, AlertTriangle, FileEdit
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getFromStorage, saveToStorage } from '../utils/mockData';
import { BillCreationPanel } from './panels/BillCreationPanel';

interface BillItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  price: number;
  discount: number;
  tax: number;
  total: number;
}

interface Bill {
  id: string;
  billNumber: string;
  customerName: string;
  customerPhone: string;
  customerType: 'retail' | 'workshop';
  items: BillItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'esewa' | 'fonepay' | 'bank';
  paymentStatus: 'paid' | 'pending';
  bankAccountId?: string;
  createdAt: string;
  createdBy: string;
  cashierId: string;
  workspaceId: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  sellingPrice: number;
  currentStock: number;
  category?: string;
  brand?: string;
}

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
  cashIn: number;
  cashOut: number;
  status: 'active' | 'ended' | 'transferred';
  transferredTo?: string;
}

interface CashInOutTransaction {
  id: string;
  type: 'cash_in' | 'cash_out';
  amount: number;
  reason: string;
  date: string;
  cashierId: string;
  cashierName: string;
  shiftId: string;
}

interface DashboardStats {
  todaySales: number;
  todayOrders: number;
  todayRevenue: number;
  averageOrderValue: number;
}

type MenuItem = {
  id: string;
  label: string;
  icon: any;
};

export const CashierDashboardNew: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { t } = useLanguage();

  const [activePanel, setActivePanel] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Shift Management
  const [currentShift, setCurrentShift] = useState<ShiftData | null>(null);
  const [allShifts, setAllShifts] = useState<ShiftData[]>([]);
  const [showStartShift, setShowStartShift] = useState(false);
  const [showEndShift, setShowEndShift] = useState(false);
  const [showTransferShift, setShowTransferShift] = useState(false);
  const [startingCash, setStartingCash] = useState(0);
  const [endingCash, setEndingCash] = useState(0);
  const [transferToName, setTransferToName] = useState('');

  // Cash In/Out
  const [showCashIn, setShowCashIn] = useState(false);
  const [showCashOut, setShowCashOut] = useState(false);
  const [showTransferToBank, setShowTransferToBank] = useState(false);
  const [cashInAmount, setCashInAmount] = useState(0);
  const [cashOutAmount, setCashOutAmount] = useState(0);
  const [cashInReason, setCashInReason] = useState('');
  const [cashOutReason, setCashOutReason] = useState('');
  const [cashTransactions, setCashTransactions] = useState<CashInOutTransaction[]>([]);
  const [transferBankAmount, setTransferBankAmount] = useState(0);
  const [selectedTransferBank, setSelectedTransferBank] = useState('');

  // POS State
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<BillItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerType, setCustomerType] = useState<'retail' | 'workshop'>('retail');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'esewa' | 'fonepay' | 'bank'>('cash');
  const [selectedBankAccount, setSelectedBankAccount] = useState('');
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');

  // Bills and Stats
  const [myBills, setMyBills] = useState<Bill[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    todayOrders: 0,
    todayRevenue: 0,
    averageOrderValue: 0,
  });

  // Sales Returns State
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedBillForReturn, setSelectedBillForReturn] = useState<Bill | null>(null);
  const [returnItems, setReturnItems] = useState<BillItem[]>([]);
  const [returnReason, setReturnReason] = useState('');

  // Bank accounts
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    loadShiftData();
    loadCashTransactions();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
      loadData(); // Real-time sync
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadData = () => {
    // Load products
    const allProducts = getFromStorage('products', [])
      .filter((p: any) => p.workspaceId === currentUser?.workspaceId);
    setProducts(allProducts);

    // Load bills (fetch entire dataset as admin does - no cashierId filter)
    const allBills = getFromStorage('bills', [])
      .filter((b: Bill) => b.workspaceId === currentUser?.workspaceId);
    setMyBills(allBills);

    // Calculate today's stats
    const today = new Date().toISOString().split('T')[0];
    const todayBills = allBills.filter((b: Bill) => 
      b.createdAt.startsWith(today) && b.paymentStatus === 'paid'
    );

    const todayRevenue = todayBills.reduce((sum: number, b: Bill) => sum + b.total, 0);
    const avgOrderValue = todayBills.length > 0 ? todayRevenue / todayBills.length : 0;

    setStats({
      todaySales: todayBills.length,
      todayOrders: allBills.filter((b: Bill) => b.createdAt.startsWith(today)).length,
      todayRevenue,
      averageOrderValue: avgOrderValue,
    });

    // Load bank accounts
    const accounts = getFromStorage('bankAccounts', [])
      .filter((a: any) => a.workspaceId === currentUser?.workspaceId && a.isActive);
    setBankAccounts(accounts);
  };

  const loadShiftData = () => {
    const shifts: ShiftData[] = getFromStorage('cashier_shifts', []);
    setAllShifts(shifts);
    
    const activeShift = shifts.find(
      s => s.cashierId === currentUser?.id && s.status === 'active'
    );
    setCurrentShift(activeShift || null);
  };

  const loadCashTransactions = () => {
    const transactions: CashInOutTransaction[] = getFromStorage('cash_in_out_transactions', []);
    setCashTransactions(transactions.filter(t => 
      t.cashierId === currentUser?.id && 
      (currentShift ? t.shiftId === currentShift.id : true)
    ));
  };

  // Shift Management Functions
  const startShift = () => {
    if (startingCash < 0) {
      alert('Please enter a valid starting cash amount!');
      return;
    }

    const newShift: ShiftData = {
      id: `shift_${Date.now()}`,
      date: new Date().toISOString(),
      startTime: new Date().toISOString(),
      startCash: startingCash,
      cashierId: currentUser?.id || '',
      cashierName: currentUser?.name || '',
      totalSales: 0,
      totalTransactions: 0,
      cashIn: 0,
      cashOut: 0,
      status: 'active'
    };

    const shifts = getFromStorage('cashier_shifts', []);
    shifts.push(newShift);
    saveToStorage('cashier_shifts', shifts);
    
    setCurrentShift(newShift);
    setAllShifts(shifts);
    setShowStartShift(false);
    setStartingCash(0);
    alert('Shift started successfully!');
  };

  const endShift = () => {
    if (!currentShift) return;

    if (endingCash < 0) {
      alert('Please enter a valid ending cash amount!');
      return;
    }

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
    setEndingCash(0);
    alert('Shift ended successfully!');
  };

  const transferShift = () => {
    if (!currentShift) return;

    if (!transferToName.trim()) {
      alert('Please enter the name of the person you are transferring to!');
      return;
    }

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
    setTransferToName('');
    alert('Shift transferred successfully!');
  };

  // Cash In/Out Functions
  const handleCashIn = () => {
    if (!currentShift) {
      alert('Please start a shift first!');
      return;
    }

    if (cashInAmount <= 0 || !cashInReason.trim()) {
      alert('Please fill all fields!');
      return;
    }

    const transaction: CashInOutTransaction = {
      id: `cashin_${Date.now()}`,
      type: 'cash_in',
      amount: cashInAmount,
      reason: cashInReason,
      date: new Date().toISOString(),
      cashierId: currentUser?.id || '',
      cashierName: currentUser?.name || '',
      shiftId: currentShift.id
    };

    const allTransactions = getFromStorage('cash_in_out_transactions', []);
    allTransactions.push(transaction);
    saveToStorage('cash_in_out_transactions', allTransactions);

    // Update shift
    const updatedShift = { ...currentShift, cashIn: currentShift.cashIn + cashInAmount };
    const shifts = allShifts.map(s => s.id === currentShift.id ? updatedShift : s);
    saveToStorage('cashier_shifts', shifts);
    setCurrentShift(updatedShift);

    setCashInAmount(0);
    setCashInReason('');
    setShowCashIn(false);
    loadCashTransactions();
    alert('Cash In recorded successfully!');
  };

  const handleCashOut = () => {
    if (!currentShift) {
      alert('Please start a shift first!');
      return;
    }

    if (cashOutAmount <= 0 || !cashOutReason.trim()) {
      alert('Please fill all fields!');
      return;
    }

    const transaction: CashInOutTransaction = {
      id: `cashout_${Date.now()}`,
      type: 'cash_out',
      amount: cashOutAmount,
      reason: cashOutReason,
      date: new Date().toISOString(),
      cashierId: currentUser?.id || '',
      cashierName: currentUser?.name || '',
      shiftId: currentShift.id
    };

    const allTransactions = getFromStorage('cash_in_out_transactions', []);
    allTransactions.push(transaction);
    saveToStorage('cash_in_out_transactions', allTransactions);

    // Update shift
    const updatedShift = { ...currentShift, cashOut: currentShift.cashOut + cashOutAmount };
    const shifts = allShifts.map(s => s.id === currentShift.id ? updatedShift : s);
    saveToStorage('cashier_shifts', shifts);
    setCurrentShift(updatedShift);

    setCashOutAmount(0);
    setCashOutReason('');
    setShowCashOut(false);
    loadCashTransactions();
    alert('Cash Out recorded successfully!');
  };

  const handleTransferToBank = () => {
    if (!currentShift) {
      alert('Please start a shift first!');
      return;
    }

    if (transferBankAmount <= 0 || !selectedTransferBank) {
      alert('Please select bank and enter amount!');
      return;
    }

    // Record cash out transaction
    const transaction: CashInOutTransaction = {
      id: `bank_transfer_${Date.now()}`,
      type: 'cash_out',
      amount: transferBankAmount,
      reason: `Bank transfer to ${bankAccounts.find(b => b.id === selectedTransferBank)?.accountName}`,
      date: new Date().toISOString(),
      cashierId: currentUser?.id || '',
      cashierName: currentUser?.name || '',
      shiftId: currentShift.id
    };

    const allTransactions = getFromStorage('cash_in_out_transactions', []);
    allTransactions.push(transaction);
    saveToStorage('cash_in_out_transactions', allTransactions);

    // Update bank account balance
    const accounts = getFromStorage('bankAccounts', []);
    const updatedAccounts = accounts.map((a: any) => {
      if (a.id === selectedTransferBank) {
        return {
          ...a,
          currentBalance: (a.currentBalance || 0) + transferBankAmount,
          totalReceived: (a.totalReceived || 0) + transferBankAmount,
        };
      }
      return a;
    });
    saveToStorage('bankAccounts', updatedAccounts);

    // Update shift
    const updatedShift = { ...currentShift, cashOut: currentShift.cashOut + transferBankAmount };
    const shifts = allShifts.map(s => s.id === currentShift.id ? updatedShift : s);
    saveToStorage('cashier_shifts', shifts);
    setCurrentShift(updatedShift);

    setTransferBankAmount(0);
    setSelectedTransferBank('');
    setShowTransferToBank(false);
    loadCashTransactions();
    alert('Cash transferred to bank successfully!');
  };

  const handleAddToCart = (product: Product) => {
    if (!currentShift) {
      alert('Please start a shift first!');
      return;
    }

    if (product.currentStock <= 0) {
      alert('This product is out of stock!');
      return;
    }

    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.currentStock) {
        alert('Cannot add more than available stock!');
        return;
      }
      handleUpdateQuantity(existingItem.id, existingItem.quantity + 1);
    } else {
      const newItem: BillItem = {
        id: `ITEM${Date.now()}${Math.random()}`,
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: 1,
        price: product.sellingPrice,
        discount: 0,
        tax: 13,
        total: product.sellingPrice * 1.13,
      };
      setCart([...cart, newItem]);
    }
    setSearchQuery('');
  };

  const handleBarcodeSearch = (barcode: string) => {
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      handleAddToCart(product);
      setBarcodeInput('');
    } else {
      alert('Product not found with this barcode!');
    }
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== itemId));
      return;
    }

    const item = cart.find(i => i.id === itemId);
    if (item) {
      const product = products.find(p => p.id === item.productId);
      if (product && newQuantity > product.currentStock) {
        alert('Cannot exceed available stock!');
        return;
      }
    }

    setCart(cart.map(item => {
      if (item.id === itemId) {
        const subtotal = item.price * newQuantity;
        const taxAmount = (subtotal * item.tax) / 100;
        return {
          ...item,
          quantity: newQuantity,
          total: subtotal + taxAmount - item.discount,
        };
      }
      return item;
    }));
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = discountType === 'percentage' 
      ? (subtotal * discount) / 100 
      : discount;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * 13) / 100;
    const total = taxableAmount + taxAmount;

    return { subtotal, discountAmount, taxAmount, total };
  };

  const handleCompleteSale = () => {
    if (!currentShift) {
      alert('Please start a shift first!');
      return;
    }

    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    if (!customerName.trim()) {
      alert('Please enter customer name!');
      return;
    }

    if (paymentMethod === 'bank' && !selectedBankAccount) {
      alert('Please select a bank account!');
      return;
    }

    const { subtotal, discountAmount, taxAmount, total } = calculateTotals();

    // Create bill
    const newBill: Bill = {
      id: `BILL${Date.now()}`,
      billNumber: `INV-${Date.now()}`,
      customerName,
      customerPhone,
      customerType,
      items: cart,
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      total,
      paymentMethod,
      paymentStatus: 'paid',
      bankAccountId: paymentMethod === 'bank' ? selectedBankAccount : undefined,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.name || '',
      cashierId: currentUser?.id || '',
      workspaceId: currentUser?.workspaceId || '',
    };

    // Save bill
    const allBills = getFromStorage('bills', []);
    allBills.push(newBill);
    saveToStorage('bills', allBills);

    // Update product stock
    const allProducts = getFromStorage('products', []);
    const updatedProducts = allProducts.map((p: Product) => {
      const cartItem = cart.find(item => item.productId === p.id);
      if (cartItem) {
        return {
          ...p,
          currentStock: p.currentStock - cartItem.quantity,
        };
      }
      return p;
    });
    saveToStorage('products', updatedProducts);

    // Handle payment method specific logic
    if (paymentMethod === 'cash') {
      // Add to cash transactions
      const cashTxns = getFromStorage('cashTransactions', []);
      cashTxns.push({
        id: `CASH${Date.now()}`,
        type: 'cash_in',
        amount: total,
        source: 'bill_payment',
        billId: newBill.billNumber,
        description: `Payment from ${customerName}`,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.id,
        workspaceId: currentUser?.workspaceId,
      });
      saveToStorage('cashTransactions', cashTxns);

      // Update shift sales
      const updatedShift = {
        ...currentShift!,
        totalSales: currentShift!.totalSales + total,
        totalTransactions: currentShift!.totalTransactions + 1
      };
      const shifts = allShifts.map(s => s.id === currentShift!.id ? updatedShift : s);
      saveToStorage('cashier_shifts', shifts);
      setCurrentShift(updatedShift);
    } else if (paymentMethod === 'bank' && selectedBankAccount) {
      // Update bank account balance
      const accounts = getFromStorage('bankAccounts', []);
      const updatedAccounts = accounts.map((a: any) => {
        if (a.id === selectedBankAccount) {
          return {
            ...a,
            currentBalance: (a.currentBalance || 0) + total,
            totalReceived: (a.totalReceived || 0) + total,
          };
        }
        return a;
      });
      saveToStorage('bankAccounts', updatedAccounts);
    }

    alert('Sale completed successfully!');
    
    // Reset cart and customer info
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setDiscount(0);
    setSelectedBankAccount('');
    
    loadData();
  };

  const handlePrintBill = (bill: Bill) => {
    window.print();
  };

  const handleInitiateReturn = (bill: Bill) => {
    setSelectedBillForReturn(bill);
    setReturnItems(bill.items.map(item => ({ ...item, quantity: 0 })));
    setShowReturnModal(true);
  };

  const handleProcessReturn = () => {
    if (!selectedBillForReturn) return;

    const itemsToReturn = returnItems.filter(item => item.quantity > 0);
    if (itemsToReturn.length === 0) {
      alert('Please select items to return!');
      return;
    }

    if (!returnReason.trim()) {
      alert('Please provide a reason for return!');
      return;
    }

    // Calculate return totals
    const returnSubtotal = itemsToReturn.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const returnTax = (returnSubtotal * 13) / 100;
    const returnTotal = returnSubtotal + returnTax;

    // Create return record
    const salesReturn = {
      id: `RET${Date.now()}`,
      billId: selectedBillForReturn.id,
      billNumber: selectedBillForReturn.billNumber,
      returnDate: new Date().toISOString(),
      items: itemsToReturn,
      subtotal: returnSubtotal,
      discount: 0,
      tax: returnTax,
      total: returnTotal,
      reason: returnReason,
      returnedBy: currentUser?.name || '',
      cashierId: currentUser?.id || '',
      workspaceId: currentUser?.workspaceId || '',
    };

    // Save return
    const allReturns = getFromStorage('salesReturns', []);
    allReturns.push(salesReturn);
    saveToStorage('salesReturns', allReturns);

    // Restore product stock
    const allProducts = getFromStorage('products', []);
    const updatedProducts = allProducts.map((p: Product) => {
      const returnItem = itemsToReturn.find(item => item.productId === p.id);
      if (returnItem) {
        return {
          ...p,
          currentStock: p.currentStock + returnItem.quantity,
        };
      }
      return p;
    });
    saveToStorage('products', updatedProducts);

    alert('Return processed successfully!');
    setShowReturnModal(false);
    setSelectedBillForReturn(null);
    setReturnItems([]);
    setReturnReason('');
    loadData();
  };

  const calculateCurrentCash = () => {
    if (!currentShift) return 0;
    return currentShift.startCash + currentShift.totalSales + currentShift.cashIn - currentShift.cashOut;
  };

  const { subtotal, discountAmount, taxAmount, total } = calculateTotals();

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'pos', label: 'POS / Billing', icon: ShoppingCart },
    { id: 'bill-creation', label: 'Create Bill', icon: FileEdit },
    { id: 'cash-drawer', label: 'Cash Drawer', icon: Wallet },
    { id: 'sales', label: 'Sales History', icon: History },
    { id: 'returns', label: 'Sales Returns', icon: RotateCcw },
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Shift Status Banner */}
      {!currentShift ? (
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <AlertTriangle className="w-12 h-12" />
              <div>
                <h3 className="text-2xl font-bold">No Active Shift</h3>
                <p className="text-red-100 mt-1">Please start your shift to begin taking orders</p>
              </div>
            </div>
            <button
              onClick={() => setShowStartShift(true)}
              className="px-6 py-3 bg-white text-red-600 rounded-xl hover:bg-red-50 transition-all font-bold flex items-center space-x-2"
            >
              <Power className="w-5 h-5" />
              <span>Start Shift</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Active Shift</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                {[
                  { key: 'started', label: 'Started At', value: new Date(currentShift.startTime).toLocaleTimeString('en-NP', { hour: '2-digit', minute: '2-digit' }) },
                  { key: 'startcash', label: 'Starting Cash', value: `रू${currentShift.startCash.toLocaleString()}` },
                  { key: 'totalsales', label: 'Total Sales', value: `रू${currentShift.totalSales.toLocaleString()}` },
                  { key: 'currentcash', label: 'Current Cash', value: `रू${calculateCurrentCash().toLocaleString()}` }
                ].map(item => (
                  <div key={item.key}>
                    <p className="text-green-100 text-sm">{item.label}</p>
                    <p className="text-lg font-bold">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowEndShift(true)}
                className="px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-all font-semibold"
              >
                End Shift
              </button>
              <button
                onClick={() => setShowTransferShift(true)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all font-semibold"
              >
                Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Welcome, {currentUser?.name || 'Cashier'} 👋
            </h2>
            <p className="text-blue-100">
              Ready to serve customers and process sales
            </p>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm">Current Date & Time</p>
            <p className="text-2xl font-bold">
              {currentTime.toLocaleDateString('en-NP')}
            </p>
            <p className="text-lg">
              {currentTime.toLocaleTimeString('en-NP')}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { key: 'revenue', icon: DollarSign, secondIcon: TrendingUp, label: "Today's Revenue", value: `रू${stats.todayRevenue.toLocaleString()}`, gradient: 'from-green-500 to-green-600', textColor: 'text-green-100' },
          { key: 'sales', icon: ShoppingCart, secondIcon: Activity, label: "Today's Sales", value: stats.todaySales, gradient: 'from-blue-500 to-blue-600', textColor: 'text-blue-100' },
          { key: 'orders', icon: Receipt, secondIcon: CheckCircle, label: "Total Orders", value: stats.todayOrders, gradient: 'from-purple-500 to-purple-600', textColor: 'text-purple-100' },
          { key: 'avg', icon: Calculator, secondIcon: BarChart3, label: "Avg Order Value", value: `रू${Math.round(stats.averageOrderValue).toLocaleString()}`, gradient: 'from-orange-500 to-orange-600', textColor: 'text-orange-100' }
        ].map(stat => {
          const Icon = stat.icon;
          const SecondIcon = stat.secondIcon;
          return (
            <div key={stat.key} className={`bg-gradient-to-br ${stat.gradient} rounded-xl p-6 text-white shadow-lg`}>
              <div className="flex items-center justify-between mb-4">
                <Icon className="w-12 h-12 opacity-80" />
                <SecondIcon className="w-6 h-6" />
              </div>
              <p className={`${stat.textColor} text-sm mb-1`}>{stat.label}</p>
              <p className="text-4xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <button
            onClick={() => setActivePanel('pos')}
            disabled={!currentShift}
            className="flex flex-col items-center space-y-2 p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all border-2 border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-10 h-10 text-blue-600" />
            <span className="font-semibold text-gray-900">New Sale</span>
          </button>

          <button
            onClick={() => setActivePanel('bill-creation')}
            className="flex flex-col items-center space-y-2 p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl hover:from-indigo-100 hover:to-indigo-200 transition-all border-2 border-indigo-200"
          >
            <FileEdit className="w-10 h-10 text-indigo-600" />
            <span className="font-semibold text-gray-900">Create Bill</span>
          </button>

          <button
            onClick={() => setActivePanel('cash-drawer')}
            className="flex flex-col items-center space-y-2 p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all border-2 border-green-200"
          >
            <Wallet className="w-10 h-10 text-green-600" />
            <span className="font-semibold text-gray-900">Cash Drawer</span>
          </button>

          <button
            onClick={() => setActivePanel('returns')}
            className="flex flex-col items-center space-y-2 p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl hover:from-orange-100 hover:to-orange-200 transition-all border-2 border-orange-200"
          >
            <RotateCcw className="w-10 h-10 text-orange-600" />
            <span className="font-semibold text-gray-900">Process Return</span>
          </button>

          <button
            onClick={() => setActivePanel('sales')}
            className="flex flex-col items-center space-y-2 p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all border-2 border-purple-200"
          >
            <History className="w-10 h-10 text-purple-600" />
            <span className="font-semibold text-gray-900">Sales History</span>
          </button>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <History className="w-6 h-6 text-white" />
            <h3 className="text-white font-bold text-lg">Recent Sales</h3>
          </div>
          <button
            onClick={() => setActivePanel('sales')}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm transition-colors"
          >
            View All
          </button>
        </div>
        <div className="p-4">
          {myBills.slice(0, 5).length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No sales yet today</p>
            </div>
          ) : (
            <div className="space-y-2">
              {myBills.slice(0, 5).map((bill) => (
                <div key={bill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <p className="font-semibold text-gray-900">{bill.billNumber}</p>
                    <p className="text-sm text-gray-500">{bill.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">रू{bill.total.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(bill.createdAt).toLocaleTimeString('en-NP', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCashDrawer = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-900 text-2xl flex items-center space-x-3">
            <Wallet className="w-8 h-8 text-green-600" />
            <span>Cash Drawer Management</span>
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Manage cash in, cash out, and bank transfers
          </p>
        </div>
      </div>

      {/* Current Cash Status */}
      {currentShift && (
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { key: 'starting', label: 'Starting Cash', value: `रू${currentShift.startCash.toLocaleString()}` },
              { key: 'salestoday', label: 'Sales Today', value: `रू${currentShift.totalSales.toLocaleString()}` },
              { key: 'cashinout', label: 'Cash In/Out', value: `रू${(currentShift.cashIn - currentShift.cashOut).toLocaleString()}` },
              { key: 'currenttotal', label: 'Current Total', value: `रू${calculateCurrentCash().toLocaleString()}` }
            ].map(item => (
              <div key={item.key}>
                <p className="text-green-100 text-sm mb-1">{item.label}</p>
                <p className="text-3xl font-bold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cash Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setShowCashIn(true)}
          disabled={!currentShift}
          className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all border-2 border-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowDownCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <p className="font-bold text-gray-900 text-lg">Cash In</p>
          <p className="text-sm text-gray-600 mt-1">Add cash to drawer</p>
        </button>

        <button
          onClick={() => setShowCashOut(true)}
          disabled={!currentShift}
          className="p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl hover:from-red-100 hover:to-red-200 transition-all border-2 border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowUpCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
          <p className="font-bold text-gray-900 text-lg">Cash Out</p>
          <p className="text-sm text-gray-600 mt-1">Remove cash from drawer</p>
        </button>

        <button
          onClick={() => setShowTransferToBank(true)}
          disabled={!currentShift}
          className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all border-2 border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <p className="font-bold text-gray-900 text-lg">Transfer to Bank</p>
          <p className="text-sm text-gray-600 mt-1">Deposit cash to bank</p>
        </button>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-4">
          <h3 className="text-white font-bold text-lg">Transaction History</h3>
        </div>
        <div className="p-4">
          {cashTransactions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cashTransactions.map((txn) => (
                <div key={txn.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                  txn.type === 'cash_in' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    {txn.type === 'cash_in' ? (
                      <ArrowDownCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <ArrowUpCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">
                        {txn.type === 'cash_in' ? 'Cash In' : 'Cash Out'}
                      </p>
                      <p className="text-sm text-gray-500">{txn.reason}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(txn.date).toLocaleString('en-NP')}
                      </p>
                    </div>
                  </div>
                  <p className={`font-bold text-lg ${
                    txn.type === 'cash_in' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {txn.type === 'cash_in' ? '+' : '-'}रू{txn.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPOS = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Product Selection */}
      <div className="lg:col-span-2 space-y-4">
        {!currentShift && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
            <p className="text-yellow-800 font-semibold">Please start your shift to begin taking orders</p>
          </div>
        )}

        {/* Search and Barcode */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name or SKU..."
                disabled={!currentShift}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>
            <div className="relative">
              <Scan className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && barcodeInput.trim()) {
                    handleBarcodeSearch(barcodeInput.trim());
                  }
                }}
                placeholder="Scan or enter barcode..."
                disabled={!currentShift}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Product List */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
            <Package className="w-5 h-5 text-blue-600" />
            <span>Available Products</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
            {products
              .filter(p => 
                searchQuery === '' || 
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.sku.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleAddToCart(product)}
                  disabled={product.currentStock <= 0 || !currentShift}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    product.currentStock <= 0 || !currentShift
                      ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                      : 'border-blue-200 hover:border-blue-400 hover:shadow-md bg-blue-50'
                  }`}
                >
                  <p className="font-semibold text-gray-900 text-sm mb-1 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500 mb-2">{product.sku}</p>
                  <p className="text-lg font-bold text-blue-600">रू{product.sellingPrice}</p>
                  <p className={`text-xs mt-1 ${product.currentStock <= 10 ? 'text-orange-600' : 'text-green-600'}`}>
                    Stock: {product.currentStock}
                  </p>
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Right: Cart and Checkout */}
      <div className="space-y-4">
        {/* Cart */}
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden sticky top-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5" />
                <span>Cart ({cart.length})</span>
              </h3>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Cart Items */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Cart is empty</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">{item.productName}</p>
                        <p className="text-xs text-gray-500">{item.sku}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="text-red-600 hover:bg-red-100 p-1 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="p-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-gray-900 w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="p-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="font-bold text-blue-600">रू{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Customer Info */}
            <div className="space-y-2 border-t pt-4">
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer Name *"
                disabled={!currentShift}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Customer Phone (Optional)"
                disabled={!currentShift}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            {/* Discount */}
            <div className="space-y-2 border-t pt-4">
              <label className="text-sm font-semibold text-gray-700">Discount</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  disabled={!currentShift}
                  className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                  disabled={!currentShift}
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="percentage">%</option>
                  <option value="fixed">रू</option>
                </select>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2 border-t pt-4">
              <label className="text-sm font-semibold text-gray-700">Payment Method</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'cash', label: 'Cash', icon: Banknote },
                  { value: 'esewa', label: 'eSewa', icon: Smartphone },
                  { value: 'fonepay', label: 'FonePay', icon: Smartphone },
                  { value: 'bank', label: 'Bank', icon: Building2 },
                ].map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.value}
                      onClick={() => setPaymentMethod(method.value as any)}
                      disabled={!currentShift}
                      className={`p-2 rounded-lg border-2 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 ${
                        paymentMethod === method.value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-semibold">{method.label}</span>
                    </button>
                  );
                })}
              </div>

              {paymentMethod === 'bank' && (
                <select
                  value={selectedBankAccount}
                  onChange={(e) => setSelectedBankAccount(e.target.value)}
                  disabled={!currentShift}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="">Select Bank Account</option>
                  {bankAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.accountName} - {acc.bankName || acc.accountType.toUpperCase()}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Totals */}
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold text-gray-900">रू{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount:</span>
                <span className="font-semibold text-orange-600">-रू{discountAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (13%):</span>
                <span className="font-semibold text-gray-900">रू{taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg border-t pt-2">
                <span className="font-bold text-gray-900">Total:</span>
                <span className="font-bold text-blue-600">रू{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Complete Sale Button */}
            <button
              onClick={handleCompleteSale}
              disabled={cart.length === 0 || !customerName.trim() || !currentShift}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Complete Sale</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSalesHistory = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-900 text-2xl flex items-center space-x-3">
            <History className="w-8 h-8 text-blue-600" />
            <span>Sales History</span>
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            View all sales transactions from all cashiers
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
        {myBills.length === 0 ? (
          <div className="text-center py-16">
            <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-900 text-xl mb-2">No Sales Yet</h3>
            <p className="text-gray-500">Start selling to see your sales history</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-900">Bill No.</th>
                  <th className="px-6 py-4 text-left text-gray-900">Customer</th>
                  <th className="px-6 py-4 text-left text-gray-900">Items</th>
                  <th className="px-6 py-4 text-left text-gray-900">Total</th>
                  <th className="px-6 py-4 text-left text-gray-900">Payment</th>
                  <th className="px-6 py-4 text-left text-gray-900">Date</th>
                  <th className="px-6 py-4 text-left text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {myBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-900">{bill.billNumber}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{bill.customerName}</p>
                      {bill.customerPhone && (
                        <p className="text-sm text-gray-500">{bill.customerPhone}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-900">{bill.items.length}</td>
                    <td className="px-6 py-4 font-bold text-green-600">रू{bill.total.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold uppercase">
                        {bill.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900 text-sm">
                      {new Date(bill.createdAt).toLocaleDateString('en-NP')}
                      <br />
                      {new Date(bill.createdAt).toLocaleTimeString('en-NP', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePrintBill(bill)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          title="Print"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleInitiateReturn(bill)}
                          className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
                          title="Return"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderReturns = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-900 text-2xl flex items-center space-x-3">
            <RotateCcw className="w-8 h-8 text-orange-600" />
            <span>Sales Returns</span>
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Process and track product returns
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border-2 border-orange-200 p-8 text-center">
        <RotateCcw className="w-16 h-16 text-orange-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Process Returns from Sales History</h3>
        <p className="text-gray-600 mb-4">
          Go to Sales History and click the return button on any bill to process a return
        </p>
        <button
          onClick={() => setActivePanel('sales')}
          className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          Go to Sales History
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Top Navigation Bar */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Serve Spares</h1>
                <p className="text-xs text-gray-300">Point of Sale</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-right">
              <p className="text-sm text-gray-300">{currentUser?.name}</p>
              <p className="text-xs text-gray-400">Cashier</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-72 bg-white border-r-2 border-gray-200 min-h-screen sticky top-[73px] shadow-lg">
            <div className="p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePanel === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePanel(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-semibold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activePanel === 'dashboard' && renderDashboard()}
          {activePanel === 'pos' && renderPOS()}
          {activePanel === 'bill-creation' && <BillCreationPanel />}
          {activePanel === 'cash-drawer' && renderCashDrawer()}
          {activePanel === 'sales' && renderSalesHistory()}
          {activePanel === 'returns' && renderReturns()}
        </div>
      </div>

      {/* Start Shift Modal */}
      {showStartShift && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Power className="w-8 h-8" />
                  <h3 className="text-2xl font-bold">Start Shift</h3>
                </div>
                <button
                  onClick={() => setShowStartShift(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Starting Cash Amount *
                </label>
                <input
                  type="number"
                  value={startingCash}
                  onChange={(e) => setStartingCash(Number(e.target.value))}
                  placeholder="Enter starting cash..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={startShift}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-semibold"
                >
                  Start Shift
                </button>
                <button
                  onClick={() => setShowStartShift(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* End Shift Modal */}
      {showEndShift && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Power className="w-8 h-8" />
                  <h3 className="text-2xl font-bold">End Shift</h3>
                </div>
                <button
                  onClick={() => setShowEndShift(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Expected Cash:</span>
                  <span className="font-bold text-gray-900">रू{calculateCurrentCash().toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Actual Ending Cash *
                </label>
                <input
                  type="number"
                  value={endingCash}
                  onChange={(e) => setEndingCash(Number(e.target.value))}
                  placeholder="Enter actual cash in drawer..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {endingCash > 0 && (
                <div className={`p-3 rounded-lg ${
                  Math.abs(endingCash - calculateCurrentCash()) > 0 
                    ? 'bg-yellow-50 border border-yellow-200'
                    : 'bg-green-50 border border-green-200'
                }`}>
                  <p className="text-sm font-semibold">
                    Difference: रू{(endingCash - calculateCurrentCash()).toLocaleString()}
                  </p>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <button
                  onClick={endShift}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-semibold"
                >
                  End Shift
                </button>
                <button
                  onClick={() => setShowEndShift(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Shift Modal */}
      {showTransferShift && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Send className="w-8 h-8" />
                  <h3 className="text-2xl font-bold">Transfer Shift</h3>
                </div>
                <button
                  onClick={() => setShowTransferShift(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Transfer To (Name) *
                </label>
                <input
                  type="text"
                  value={transferToName}
                  onChange={(e) => setTransferToName(e.target.value)}
                  placeholder="Enter name of person..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-blue-800">
                  Current cash: <span className="font-bold">रू{calculateCurrentCash().toLocaleString()}</span>
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={transferShift}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold"
                >
                  Transfer Shift
                </button>
                <button
                  onClick={() => setShowTransferShift(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cash In Modal */}
      {showCashIn && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ArrowDownCircle className="w-8 h-8" />
                  <h3 className="text-2xl font-bold">Cash In</h3>
                </div>
                <button
                  onClick={() => setShowCashIn(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Amount *</label>
                <input
                  type="number"
                  value={cashInAmount}
                  onChange={(e) => setCashInAmount(Number(e.target.value))}
                  placeholder="Enter amount..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reason *</label>
                <textarea
                  value={cashInReason}
                  onChange={(e) => setCashInReason(e.target.value)}
                  placeholder="Enter reason..."
                  rows={3}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleCashIn}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-semibold"
                >
                  Record Cash In
                </button>
                <button
                  onClick={() => setShowCashIn(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cash Out Modal */}
      {showCashOut && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ArrowUpCircle className="w-8 h-8" />
                  <h3 className="text-2xl font-bold">Cash Out</h3>
                </div>
                <button
                  onClick={() => setShowCashOut(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Amount *</label>
                <input
                  type="number"
                  value={cashOutAmount}
                  onChange={(e) => setCashOutAmount(Number(e.target.value))}
                  placeholder="Enter amount..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reason *</label>
                <textarea
                  value={cashOutReason}
                  onChange={(e) => setCashOutReason(e.target.value)}
                  placeholder="Enter reason..."
                  rows={3}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleCashOut}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-semibold"
                >
                  Record Cash Out
                </button>
                <button
                  onClick={() => setShowCashOut(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transfer to Bank Modal */}
      {showTransferToBank && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Send className="w-8 h-8" />
                  <h3 className="text-2xl font-bold">Transfer to Bank</h3>
                </div>
                <button
                  onClick={() => setShowTransferToBank(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Bank Account *</label>
                <select
                  value={selectedTransferBank}
                  onChange={(e) => setSelectedTransferBank(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Bank Account</option>
                  {bankAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.accountName} - {acc.bankName || acc.accountType.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Amount *</label>
                <input
                  type="number"
                  value={transferBankAmount}
                  onChange={(e) => setTransferBankAmount(Number(e.target.value))}
                  placeholder="Enter amount to transfer..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-blue-800">
                  Available cash: <span className="font-bold">रू{calculateCurrentCash().toLocaleString()}</span>
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleTransferToBank}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold"
                >
                  Transfer to Bank
                </button>
                <button
                  onClick={() => setShowTransferToBank(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && selectedBillForReturn && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Process Return</h3>
                  <p className="text-orange-100 mt-1">Bill: {selectedBillForReturn.billNumber}</p>
                </div>
                <button
                  onClick={() => {
                    setShowReturnModal(false);
                    setSelectedBillForReturn(null);
                    setReturnItems([]);
                    setReturnReason('');
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Customer: <span className="font-semibold text-gray-900">{selectedBillForReturn.customerName}</span></p>
                <p className="text-sm text-gray-600">Date: <span className="font-semibold text-gray-900">{new Date(selectedBillForReturn.createdAt).toLocaleString('en-NP')}</span></p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Items to Return</label>
                <div className="space-y-2">
                  {selectedBillForReturn.items.map((item, idx) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{item.productName}</p>
                        <p className="text-sm text-gray-500">Sold: {item.quantity} units @ रू{item.price}</p>
                      </div>
                      <input
                        type="number"
                        min="0"
                        max={item.quantity}
                        value={returnItems[idx]?.quantity || 0}
                        onChange={(e) => {
                          const newReturnItems = [...returnItems];
                          newReturnItems[idx] = {
                            ...item,
                            quantity: Math.min(Number(e.target.value), item.quantity),
                          };
                          setReturnItems(newReturnItems);
                        }}
                        className="w-20 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Return *</label>
                <textarea
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="Enter reason for return..."
                  rows={3}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleProcessReturn}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all font-semibold"
                >
                  Process Return
                </button>
                <button
                  onClick={() => {
                    setShowReturnModal(false);
                    setSelectedBillForReturn(null);
                    setReturnItems([]);
                    setReturnReason('');
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
