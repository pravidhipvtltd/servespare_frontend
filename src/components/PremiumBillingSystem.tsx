import React, { useState, useEffect } from 'react';
import {
  Search, X, Plus, Minus, Trash2, ShoppingCart, User, Building2,
  Phone, Mail, MapPin, CreditCard, Banknote, Smartphone, Calendar,
  Tag, Percent, Calculator, Printer, Download, Check, AlertCircle,
  TrendingUp, Award, Clock, ChevronDown, ChevronRight, Users, Briefcase,
  Package, DollarSign, FileText, Save, Send, Eye, Edit, Star, History,
  Zap, Sparkles, BadgeCheck, Gift, ArrowRight, Info
} from 'lucide-react';
import { Party, InventoryItem, BillItem, Bill } from '../types';
import { getFromStorage, saveToStorage } from '../utils/mockData';
import { useAuth } from '../contexts/AuthContext';

interface PremiumBillingSystemProps {
  inventory: InventoryItem[];
  onBillComplete: (bill: Bill) => void;
  currentShift?: any;
}

export const PremiumBillingSystem: React.FC<PremiumBillingSystemProps> = ({
  inventory,
  onBillComplete,
  currentShift
}) => {
  const { currentUser } = useAuth();
  
  // Party Management
  const [parties, setParties] = useState<Party[]>([]);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [partySearch, setPartySearch] = useState('');
  const [showPartySelector, setShowPartySelector] = useState(false);
  const [recentParties, setRecentParties] = useState<Party[]>([]);
  
  // Cart & Products
  const [cart, setCart] = useState<BillItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Billing Details
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [taxRate, setTaxRate] = useState(13);
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  
  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit' | 'esewa' | 'khalti' | 'card' | 'bank'>('cash');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'partial' | 'unpaid'>('paid');
  const [amountPaid, setAmountPaid] = useState(0);
  
  // UI States
  const [showProductGrid, setShowProductGrid] = useState(true);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'cart' | 'payment'>('products');

  useEffect(() => {
    loadParties();
    loadRecentParties();
  }, []);

  const loadParties = () => {
    const allParties: Party[] = getFromStorage('parties', []);
    setParties(allParties.filter(p => p.workspaceId === currentUser?.workspaceId));
  };

  const loadRecentParties = () => {
    const recent = getFromStorage('recent_parties', []);
    setRecentParties(recent.slice(0, 5));
  };

  const selectParty = (party: Party) => {
    setSelectedParty(party);
    setShowPartySelector(false);
    setPartySearch('');
    
    // Apply automatic discount based on party type
    if (party.discount) {
      setDiscount(party.discount);
      setDiscountType('percentage');
    }
    
    // Set payment terms
    if (party.creditLimit && party.creditLimit > 0) {
      setPaymentStatus('credit');
      const days = party.creditDays || 30;
      const future = new Date();
      future.setDate(future.getDate() + days);
      setDueDate(future.toISOString().split('T')[0]);
    }
    
    // Update recent parties
    const updated = [party, ...recentParties.filter(p => p.id !== party.id)].slice(0, 5);
    setRecentParties(updated);
    saveToStorage('recent_parties', updated);
  };

  const getPartyStats = (party: Party) => {
    const bills: Bill[] = getFromStorage('bills', []);
    const partyBills = bills.filter(b => 
      b.customerName === party.name || b.customerPhone === party.phone
    );
    
    const totalPurchases = partyBills.reduce((sum, b) => sum + b.total, 0);
    const totalDue = partyBills
      .filter(b => b.paymentStatus !== 'paid')
      .reduce((sum, b) => sum + (b.total - (b.amountPaid || 0)), 0);
    
    return {
      totalPurchases,
      totalDue,
      transactionCount: partyBills.length,
      lastPurchase: partyBills.length > 0 ? partyBills[0].date : null
    };
  };

  const addToCart = (item: InventoryItem) => {
    if (item.quantity === 0) {
      alert('⚠️ Out of Stock!');
      return;
    }

    const existingItem = cart.find(c => c.itemId === item.id);
    
    if (existingItem) {
      updateCartQuantity(item.id, 1);
    } else {
      const price = selectedParty?.type === 'supplier' 
        ? item.price 
        : (item.retailPrice || item.price);
      
      const newItem: BillItem = {
        itemId: item.id,
        itemName: item.name,
        quantity: 1,
        price: price,
        total: price,
      };
      setCart([...cart, newItem]);
    }
  };

  const updateCartQuantity = (itemId: string, change: number) => {
    const inventoryItem = inventory.find(i => i.id === itemId);
    if (!inventoryItem) return;

    setCart(cart.map(c => {
      if (c.itemId === itemId) {
        const newQuantity = Math.max(0, c.quantity + change);
        if (newQuantity > inventoryItem.quantity) {
          alert(`⚠️ Only ${inventoryItem.quantity} units available!`);
          return c;
        }
        if (newQuantity === 0) return c;
        return { ...c, quantity: newQuantity, total: newQuantity * c.price };
      }
      return c;
    }).filter(c => c.quantity > 0));
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

  const completeBill = () => {
    if (!currentShift) {
      alert('⚠️ Please start your shift first!');
      return;
    }

    if (cart.length === 0) {
      alert('⚠️ Cart is empty!');
      return;
    }

    const { subtotal, discountAmount, tax, total } = calculateTotals();
    
    const newBill: Bill = {
      id: `bill_${Date.now()}`,
      billNumber: `BIL-${Date.now()}`,
      createdAt: new Date().toISOString(),
      customerName: selectedParty?.name || 'Walk-in Customer',
      customerPhone: selectedParty?.phone || '',
      customerType: selectedParty?.type === 'supplier' ? 'workshop' : 'retail',
      items: cart,
      subtotal,
      discount: discountAmount,
      tax,
      total,
      paymentMethod,
      paymentStatus,
      amountPaid: paymentStatus === 'paid' ? total : amountPaid,
      dueAmount: paymentStatus === 'paid' ? 0 : total - amountPaid,
      dueDate: dueDate || undefined,
      notes: notes || undefined,
      referenceNumber: referenceNumber || undefined,
      createdBy: currentUser?.name || '',
      workspaceId: currentUser?.workspaceId || '',
      status: 'completed',
      partyId: selectedParty?.id
    };

    onBillComplete(newBill);
    
    // Reset form
    setCart([]);
    setSelectedParty(null);
    setDiscount(0);
    setNotes('');
    setDueDate('');
    setReferenceNumber('');
    setAmountPaid(0);
    setActiveTab('products');
  };

  const { subtotal, discountAmount, tax, total } = calculateTotals();
  
  const filteredParties = parties.filter(p => 
    p.name.toLowerCase().includes(partySearch.toLowerCase()) ||
    p.phone?.includes(partySearch) ||
    p.email?.toLowerCase().includes(partySearch.toLowerCase())
  );

  const categories = ['all', ...new Set(inventory.map(i => i.category).filter(Boolean))];
  
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                         item.partNumber?.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Premium Billing</h2>
              <p className="text-orange-100 text-sm">Professional invoice system</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <p className="text-xs text-orange-100">Cart Items</p>
              <p className="text-xl font-bold">{cart.length}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <p className="text-xs text-orange-100">Total Amount</p>
              <p className="text-xl font-bold">NPR {total.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          
          {/* Left Section - Party & Products */}
          <div className="lg:col-span-2 space-y-6 overflow-y-auto">
            
            {/* Party Selection */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Customer / Supplier</h3>
                      <p className="text-xs text-gray-600">Select from your parties database</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPartySelector(!showPartySelector)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm flex items-center space-x-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>Browse Parties</span>
                  </button>
                </div>
              </div>

              {selectedParty ? (
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                        selectedParty.type === 'customer' ? 'bg-green-100' : 'bg-purple-100'
                      }`}>
                        {selectedParty.type === 'customer' ? (
                          <User className={`w-8 h-8 ${selectedParty.type === 'customer' ? 'text-green-600' : 'text-purple-600'}`} />
                        ) : (
                          <Building2 className="w-8 h-8 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-xl font-bold text-gray-900">{selectedParty.name}</h4>
                          {selectedParty.isVIP && (
                            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                              <Star className="w-3 h-3" />
                              <span>VIP</span>
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 capitalize">
                          {selectedParty.type} • ID: {selectedParty.id.substring(0, 8)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedParty(null)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-red-600" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {selectedParty.phone && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{selectedParty.phone}</span>
                      </div>
                    )}
                    {selectedParty.email && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{selectedParty.email}</span>
                      </div>
                    )}
                    {selectedParty.address && (
                      <div className="flex items-center space-x-2 text-sm col-span-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{selectedParty.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-blue-50 rounded-xl p-3">
                      <p className="text-xs text-blue-600 mb-1">Total Purchases</p>
                      <p className="text-lg font-bold text-blue-900">NPR {getPartyStats(selectedParty).totalPurchases.toLocaleString()}</p>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-3">
                      <p className="text-xs text-orange-600 mb-1">Outstanding</p>
                      <p className="text-lg font-bold text-orange-900">NPR {getPartyStats(selectedParty).totalDue.toLocaleString()}</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-3">
                      <p className="text-xs text-green-600 mb-1">Transactions</p>
                      <p className="text-lg font-bold text-green-900">{getPartyStats(selectedParty).transactionCount}</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-3">
                      <p className="text-xs text-purple-600 mb-1">Credit Limit</p>
                      <p className="text-lg font-bold text-purple-900">NPR {(selectedParty.creditLimit || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  {selectedParty.discount && selectedParty.discount > 0 && (
                    <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 flex items-center space-x-3">
                      <Gift className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-semibold text-green-900">Special Discount Applied</p>
                        <p className="text-xs text-green-600">{selectedParty.discount}% automatic discount for this party</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-semibold mb-2">No party selected</p>
                  <p className="text-sm text-gray-400 mb-4">Select a customer or supplier to continue</p>
                  <button
                    onClick={() => setShowPartySelector(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Select Party</span>
                  </button>
                </div>
              )}
            </div>

            {/* Recent Parties Quick Access */}
            {recentParties.length > 0 && !selectedParty && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                  <History className="w-5 h-5 mr-2 text-gray-600" />
                  Recent Parties
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {recentParties.map(party => (
                    <button
                      key={party.id}
                      onClick={() => selectParty(party)}
                      className="p-3 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        {party.type === 'customer' ? (
                          <User className="w-4 h-4 text-green-600" />
                        ) : (
                          <Building2 className="w-4 h-4 text-purple-600" />
                        )}
                        {party.isVIP && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                      </div>
                      <p className="font-semibold text-gray-900 text-sm truncate">{party.name}</p>
                      <p className="text-xs text-gray-500 truncate">{party.phone}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Product Selection */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b border-orange-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Product Catalog</h3>
                      <p className="text-xs text-gray-600">{inventory.length} items available</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                  {filteredInventory.map(item => {
                    const inCart = cart.find(c => c.itemId === item.id);
                    const price = selectedParty?.type === 'supplier' ? item.price : (item.retailPrice || item.price);
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => addToCart(item)}
                        disabled={item.quantity === 0}
                        className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                          inCart 
                            ? 'border-orange-500 bg-orange-50 shadow-lg scale-105' 
                            : item.quantity === 0 
                            ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                            : 'border-gray-200 hover:border-orange-500 hover:shadow-lg hover:scale-105'
                        }`}
                      >
                        {inCart && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{inCart.quantity}</span>
                          </div>
                        )}
                        
                        <div className="flex items-start justify-between mb-2">
                          <Package className={`w-6 h-6 ${
                            item.quantity === 0 ? 'text-gray-300' :
                            item.quantity <= item.minStockLevel ? 'text-orange-500' :
                            'text-gray-400'
                          }`} />
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            item.quantity === 0 ? 'bg-red-100 text-red-700' :
                            item.quantity <= item.minStockLevel ? 'bg-orange-100 text-orange-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {item.quantity === 0 ? 'Out' : `${item.quantity}`}
                          </span>
                        </div>
                        
                        <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{item.name}</h4>
                        <p className="text-xs text-gray-500 mb-2">{item.partNumber}</p>
                        <p className="text-lg font-bold text-orange-600">NPR {price.toLocaleString()}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Cart & Checkout */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Shopping Cart</h3>
                  <p className="text-xs text-gray-600">{cart.length} items • NPR {total.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-semibold">Cart is empty</p>
                  <p className="text-sm text-gray-400">Add products to get started</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.itemId} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900">{item.itemName}</h5>
                        <p className="text-sm text-gray-600">NPR {item.price.toLocaleString()} each</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.itemId)}
                        className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateCartQuantity(item.itemId, -1)}
                          className="w-8 h-8 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center hover:border-orange-500 transition-colors"
                        >
                          <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="w-12 text-center font-bold text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.itemId, 1)}
                          className="w-8 h-8 bg-orange-500 border-2 border-orange-500 rounded-lg flex items-center justify-center hover:bg-orange-600 transition-colors"
                        >
                          <Plus className="w-4 h-4 text-white" />
                        </button>
                      </div>
                      <span className="text-lg font-bold text-gray-900">NPR {item.total.toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Billing Summary */}
            {cart.length > 0 && (
              <div className="border-t border-gray-200 p-6 space-y-4">
                {/* Discount Input */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Discount</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as any)}
                      className="px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="percentage">%</option>
                      <option value="fixed">NPR</option>
                    </select>
                  </div>
                </div>

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-semibold">NPR {subtotal.toLocaleString()}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center space-x-1">
                        <Tag className="w-4 h-4" />
                        <span>Discount:</span>
                      </span>
                      <span className="font-semibold">- NPR {discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>VAT ({taxRate}%):</span>
                    <span className="font-semibold">NPR {tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-2xl font-bold text-gray-900 pt-3 border-t-2 border-gray-200">
                    <span>Total:</span>
                    <span>NPR {total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'cash', label: 'Cash', icon: Banknote },
                      { id: 'credit', label: 'Credit', icon: CreditCard },
                      { id: 'esewa', label: 'eSewa', icon: Smartphone },
                      { id: 'khalti', label: 'Khalti', icon: Smartphone },
                      { id: 'card', label: 'Card', icon: CreditCard },
                      { id: 'bank', label: 'Bank', icon: Building2 },
                    ].map(method => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`px-3 py-2 rounded-lg font-semibold text-xs transition-all flex items-center justify-center space-x-1 ${
                          paymentMethod === method.id
                            ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <method.icon className="w-4 h-4" />
                        <span>{method.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Complete Bill Button */}
                <button
                  onClick={completeBill}
                  disabled={!currentShift || cart.length === 0}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center space-x-2 ${
                    !currentShift || cart.length === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-2xl hover:scale-105'
                  }`}
                >
                  <Check className="w-6 h-6" />
                  <span>Complete Bill</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Party Selector Modal */}
      {showPartySelector && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Select Party</h3>
                <p className="text-blue-100 text-sm">Choose customer or supplier</p>
              </div>
              <button
                onClick={() => setShowPartySelector(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="p-6 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, phone, or email..."
                  value={partySearch}
                  onChange={(e) => setPartySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredParties.map(party => {
                  const stats = getPartyStats(party);
                  
                  return (
                    <button
                      key={party.id}
                      onClick={() => selectParty(party)}
                      className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                    >
                      <div className="flex items-start space-x-4 mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          party.type === 'customer' ? 'bg-green-100' : 'bg-purple-100'
                        }`}>
                          {party.type === 'customer' ? (
                            <User className="w-6 h-6 text-green-600" />
                          ) : (
                            <Building2 className="w-6 h-6 text-purple-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-bold text-gray-900">{party.name}</h4>
                            {party.isVIP && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 capitalize">{party.type}</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        {party.phone && (
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span>{party.phone}</span>
                          </div>
                        )}
                        {party.email && (
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{party.email}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-2">
                        <div>
                          <p className="text-xs text-gray-500">Purchases</p>
                          <p className="font-bold text-sm text-gray-900">{stats.transactionCount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Total</p>
                          <p className="font-bold text-sm text-blue-600">NPR {Math.round(stats.totalPurchases/1000)}K</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Due</p>
                          <p className="font-bold text-sm text-orange-600">NPR {Math.round(stats.totalDue/1000)}K</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {filteredParties.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-semibold">No parties found</p>
                  <p className="text-sm text-gray-400">Try a different search term</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumBillingSystem;