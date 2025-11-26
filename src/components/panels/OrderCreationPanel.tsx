import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingCart, Plus, Trash2, Search, Package, Calendar,
  FileText, Calculator, Percent, Printer, Save, Check, X,
  Building2, User, Phone, AlertCircle, ChevronRight, ArrowLeft,
  TrendingUp, TrendingDown, Hash, DollarSign, Clock, Eye,
  ShoppingBag, Truck, CheckCircle2, Box
} from 'lucide-react';
import { getFromStorage, saveToStorage } from '../../utils/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { InventoryItem, Party } from '../../types';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  availableStock?: number;
}

interface OrderFormData {
  type: 'purchase' | 'sales';
  partyId: string;
  partyName: string;
  partyPhone: string;
  partyAddress: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  tax: number;
  total: number;
  expectedDeliveryDate: string;
  paymentTerms: string;
  notes: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'received' | 'cancelled';
}

type Step = 'type' | 'party' | 'items' | 'details' | 'preview';

export const OrderCreationPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('type');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [partySearchQuery, setPartySearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [filteredParties, setFilteredParties] = useState<Party[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<OrderFormData>({
    type: 'purchase',
    partyId: '',
    partyName: '',
    partyPhone: '',
    partyAddress: '',
    items: [],
    subtotal: 0,
    discount: 0,
    discountType: 'percentage',
    tax: 13, // Nepal VAT
    total: 0,
    expectedDeliveryDate: '',
    paymentTerms: 'cash',
    notes: '',
    status: 'pending',
  });

  useEffect(() => {
    loadInventory();
    loadParties();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [formData.items, formData.discount, formData.discountType, formData.tax]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = inventory.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.partNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredItems(filtered.slice(0, 10));
    } else {
      setFilteredItems([]);
    }
  }, [searchQuery, inventory]);

  useEffect(() => {
    if (partySearchQuery.trim()) {
      const partyType = formData.type === 'purchase' 
        ? ['supplier', 'distributor', 'manufacturer', 'wholesaler']
        : ['customer'];
      
      const filtered = parties.filter(
        (party) =>
          partyType.includes(party.type) &&
          (party.name.toLowerCase().includes(partySearchQuery.toLowerCase()) ||
            party.phone.includes(partySearchQuery))
      );
      setFilteredParties(filtered.slice(0, 10));
    } else {
      const partyType = formData.type === 'purchase' 
        ? ['supplier', 'distributor', 'manufacturer', 'wholesaler']
        : ['customer'];
      setFilteredParties(parties.filter(p => partyType.includes(p.type)).slice(0, 10));
    }
  }, [partySearchQuery, parties, formData.type]);

  const loadInventory = () => {
    const allInventory = getFromStorage('inventory', []);
    setInventory(allInventory.filter((i: InventoryItem) => i.workspaceId === currentUser?.workspaceId));
  };

  const loadParties = () => {
    const allParties = getFromStorage('parties', []);
    setParties(allParties.filter((p: Party) => p.workspaceId === currentUser?.workspaceId && p.isActive));
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
    
    let discountAmount = 0;
    if (formData.discountType === 'percentage') {
      discountAmount = (subtotal * formData.discount) / 100;
    } else {
      discountAmount = formData.discount;
    }
    
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = (afterDiscount * formData.tax) / 100;
    const total = afterDiscount + taxAmount;
    
    setFormData(prev => ({
      ...prev,
      subtotal,
      total,
    }));
  };

  const handleOrderTypeSelect = (type: 'purchase' | 'sales') => {
    setFormData(prev => ({ 
      ...prev, 
      type,
      partyId: '',
      partyName: '',
      partyPhone: '',
      partyAddress: '',
      items: [],
    }));
    setCurrentStep('party');
  };

  const handlePartySelect = (party: Party) => {
    setFormData(prev => ({
      ...prev,
      partyId: party.id,
      partyName: party.name,
      partyPhone: party.phone,
      partyAddress: party.address,
      paymentTerms: party.paymentTerms,
    }));
    setPartySearchQuery('');
    setCurrentStep('items');
  };

  const handleAddItem = (item: InventoryItem) => {
    const existingItem = formData.items.find(i => i.id === item.id);
    
    if (existingItem) {
      alert('Item already added to order!');
      return;
    }

    const newItem: OrderItem = {
      id: item.id,
      name: item.name,
      quantity: 1,
      price: formData.type === 'purchase' ? item.price : (item.retailPrice || item.price),
      total: formData.type === 'purchase' ? item.price : (item.retailPrice || item.price),
      availableStock: formData.type === 'sales' ? item.quantity : undefined,
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));

    setSearchQuery('');
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    const updatedItems = formData.items.map(item => {
      if (item.id === itemId) {
        // Check stock for sales orders
        if (formData.type === 'sales' && item.availableStock && quantity > item.availableStock) {
          alert(`Only ${item.availableStock} units available in stock!`);
          return item;
        }
        return {
          ...item,
          quantity,
          total: quantity * item.price,
        };
      }
      return item;
    });

    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const handleUpdatePrice = (itemId: string, price: number) => {
    if (price < 0) return;

    const updatedItems = formData.items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          price,
          total: item.quantity * price,
        };
      }
      return item;
    });

    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const handleRemoveItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId),
    }));
  };

  const handleSaveOrder = () => {
    if (!formData.partyId) {
      alert('Please select a party!');
      return;
    }

    if (formData.items.length === 0) {
      alert('Please add at least one item!');
      return;
    }

    if (!formData.expectedDeliveryDate) {
      alert('Please set expected delivery date!');
      return;
    }

    const storageKey = formData.type === 'purchase' ? 'purchaseOrders' : 'salesOrders';
    const allOrders = getFromStorage(storageKey, []);
    
    const orderNumber = `${formData.type === 'purchase' ? 'PO' : 'SO'}-${Date.now().toString().slice(-8)}`;
    
    const newOrder = {
      id: Date.now().toString(),
      orderNumber,
      type: formData.type,
      partyId: formData.partyId,
      partyName: formData.partyName,
      partyPhone: formData.partyPhone,
      partyAddress: formData.partyAddress,
      items: formData.items,
      subtotal: formData.subtotal,
      tax: formData.tax,
      discount: formData.discount,
      discountType: formData.discountType,
      total: formData.total,
      expectedDeliveryDate: formData.expectedDeliveryDate,
      paymentTerms: formData.paymentTerms,
      notes: formData.notes,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      workspaceId: currentUser?.workspaceId,
      createdBy: currentUser?.id,
    };

    saveToStorage(storageKey, [...allOrders, newOrder]);
    
    setCreatedOrderNumber(orderNumber);
    setShowSuccess(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      resetForm();
      setShowSuccess(false);
    }, 3000);
  };

  const resetForm = () => {
    setFormData({
      type: 'purchase',
      partyId: '',
      partyName: '',
      partyPhone: '',
      partyAddress: '',
      items: [],
      subtotal: 0,
      discount: 0,
      discountType: 'percentage',
      tax: 13,
      total: 0,
      expectedDeliveryDate: '',
      paymentTerms: 'cash',
      notes: '',
      status: 'pending',
    });
    setCurrentStep('type');
    setSearchQuery('');
    setPartySearchQuery('');
  };

  const handlePrint = () => {
    window.print();
  };

  const getStepProgress = () => {
    const steps = ['type', 'party', 'items', 'details', 'preview'];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  // Success Modal
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-12 max-w-md w-full text-center shadow-2xl animate-scale-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Order Created Successfully!
          </h2>
          <p className="text-gray-600 mb-2">Order Number</p>
          <p className="text-2xl font-bold text-orange-600 mb-6">{createdOrderNumber}</p>
          <p className="text-gray-500 mb-8">
            {formData.type === 'purchase' 
              ? `Purchase order sent to ${formData.partyName}` 
              : `Sales order created for ${formData.partyName}`}
          </p>
          <div className="flex gap-3">
            <button
              onClick={resetForm}
              className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all"
            >
              Create Another Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Progress Bar */}
      <div className="max-w-5xl mx-auto mb-6">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">Order Creation Progress</h3>
            <span className="text-orange-400 font-semibold">{Math.round(getStepProgress())}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500"
              style={{ width: `${getStepProgress()}%` }}
            />
          </div>
          
          {/* Step Indicators */}
          <div className="flex items-center justify-between mt-6">
            {[
              { id: 'type', icon: ShoppingBag, label: 'Type' },
              { id: 'party', icon: Building2, label: 'Party' },
              { id: 'items', icon: Package, label: 'Items' },
              { id: 'details', icon: FileText, label: 'Details' },
              { id: 'preview', icon: Eye, label: 'Review' },
            ].map((step, index) => {
              const steps = ['type', 'party', 'items', 'details', 'preview'];
              const currentIndex = steps.indexOf(currentStep);
              const isActive = currentIndex >= index;
              const Icon = step.icon;
              
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                    isActive 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-slate-700 text-slate-400'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-xs ${isActive ? 'text-white' : 'text-slate-500'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto">
        {/* Step 1: Order Type Selection */}
        {currentStep === 'type' && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-8">
            <h2 className="text-3xl font-bold text-white mb-2">Select Order Type</h2>
            <p className="text-slate-400 mb-8">Choose the type of order you want to create</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Purchase Order */}
              <button
                onClick={() => handleOrderTypeSelect('purchase')}
                className="group relative bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-2 border-blue-500/50 rounded-2xl p-8 text-left hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/20 transition-all"
              >
                <div className="absolute top-4 right-4">
                  <TrendingDown className="w-8 h-8 text-blue-400" />
                </div>
                <div className="mb-4">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4">
                    <ShoppingCart className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Purchase Order</h3>
                  <p className="text-slate-300 mb-4">Order stock from suppliers, distributors, or manufacturers</p>
                </div>
                <div className="space-y-2 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>Order new inventory</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>Track supplier deliveries</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>Auto-update stock on receipt</span>
                  </div>
                </div>
                <div className="mt-6 flex items-center text-blue-400 group-hover:text-blue-300">
                  <span className="font-semibold">Create Purchase Order</span>
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Sales Order */}
              <button
                onClick={() => handleOrderTypeSelect('sales')}
                className="group relative bg-gradient-to-br from-green-600/20 to-green-800/20 border-2 border-green-500/50 rounded-2xl p-8 text-left hover:border-green-400 hover:shadow-xl hover:shadow-green-500/20 transition-all"
              >
                <div className="absolute top-4 right-4">
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
                <div className="mb-4">
                  <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Sales Order</h3>
                  <p className="text-slate-300 mb-4">Create customer orders for parts and accessories</p>
                </div>
                <div className="space-y-2 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>Create customer orders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>Track order fulfillment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>Auto-reduce stock on delivery</span>
                  </div>
                </div>
                <div className="mt-6 flex items-center text-green-400 group-hover:text-green-300">
                  <span className="font-semibold">Create Sales Order</span>
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Party Selection */}
        {currentStep === 'party' && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Select {formData.type === 'purchase' ? 'Supplier' : 'Customer'}
                </h2>
                <p className="text-slate-400">
                  Choose the {formData.type === 'purchase' ? 'supplier' : 'customer'} for this order
                </p>
              </div>
              <button
                onClick={() => setCurrentStep('type')}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={partySearchQuery}
                onChange={(e) => setPartySearchQuery(e.target.value)}
                placeholder={`Search ${formData.type === 'purchase' ? 'suppliers' : 'customers'}...`}
                className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Parties List */}
            <div className="grid gap-4 max-h-96 overflow-y-auto">
              {filteredParties.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No {formData.type === 'purchase' ? 'suppliers' : 'customers'} found</p>
                  <p className="text-sm mt-2">Add parties from the Parties panel</p>
                </div>
              ) : (
                filteredParties.map((party) => (
                  <button
                    key={party.id}
                    onClick={() => handlePartySelect(party)}
                    className="bg-slate-900/50 border border-slate-600 rounded-xl p-4 text-left hover:border-orange-500 hover:bg-slate-800/50 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-orange-400" />
                          </div>
                          <div>
                            <h4 className="text-white font-semibold">{party.name}</h4>
                            <p className="text-slate-400 text-sm">{party.contactPerson}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-400 ml-13">
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{party.phone}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                              {party.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Step 3: Items Selection */}
        {currentStep === 'items' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Add Items to Order</h2>
                  <p className="text-slate-400">
                    {formData.type === 'purchase' ? 'Supplier' : 'Customer'}: <span className="text-white font-semibold">{formData.partyName}</span>
                  </p>
                </div>
                <button
                  onClick={() => setCurrentStep('party')}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Change Party
                </button>
              </div>
            </div>

            {/* Search Items */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search items by name or part number..."
                  className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Search Results */}
              {filteredItems.length > 0 && (
                <div className="mt-4 max-h-64 overflow-y-auto space-y-2">
                  {filteredItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleAddItem(item)}
                      className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-left hover:border-orange-500 transition-all flex items-center justify-between group"
                    >
                      <div>
                        <p className="text-white font-semibold">{item.name}</p>
                        <div className="flex items-center gap-3 text-sm text-slate-400 mt-1">
                          <span>₹{item.price}</span>
                          {formData.type === 'sales' && (
                            <span className={item.quantity > 0 ? 'text-green-400' : 'text-red-400'}>
                              Stock: {item.quantity}
                            </span>
                          )}
                          {item.partNumber && <span>#{item.partNumber}</span>}
                        </div>
                      </div>
                      <Plus className="w-5 h-5 text-slate-400 group-hover:text-orange-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Order Items ({formData.items.length})
              </h3>

              {formData.items.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No items added yet</p>
                  <p className="text-sm mt-2">Search and add items to your order</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-900/50 border border-slate-600 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-white font-semibold">{item.name}</h4>
                          {formData.type === 'sales' && item.availableStock !== undefined && (
                            <p className="text-sm text-slate-400">Available: {item.availableStock} units</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs text-slate-400 mb-1 block">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 mb-1 block">Price (₹)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.price}
                            onChange={(e) => handleUpdatePrice(item.id, parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 mb-1 block">Total (₹)</label>
                          <div className="px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white font-semibold">
                            {item.total.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {formData.items.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-600">
                  <div className="flex justify-between text-lg">
                    <span className="text-slate-400">Subtotal:</span>
                    <span className="text-white font-bold">NPR {formData.subtotal.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {formData.items.length > 0 && (
                <div className="mt-6">
                  <button
                    onClick={() => setCurrentStep('details')}
                    className="w-full px-6 py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl font-semibold hover:from-orange-700 hover:to-orange-600 transition-all flex items-center justify-center gap-2"
                  >
                    Continue to Details
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Order Details */}
        {currentStep === 'details' && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Order Details</h2>
                <p className="text-slate-400">Add delivery date, discount, and notes</p>
              </div>
              <button
                onClick={() => setCurrentStep('items')}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Items
              </button>
            </div>

            <div className="space-y-6">
              {/* Expected Delivery Date */}
              <div>
                <label className="text-white font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-400" />
                  Expected Delivery Date *
                </label>
                <input
                  type="date"
                  value={formData.expectedDeliveryDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, expectedDeliveryDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white font-semibold mb-2 flex items-center gap-2">
                    <Percent className="w-4 h-4 text-orange-400" />
                    Discount
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.discount}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="text-white font-semibold mb-2 block">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value as 'percentage' | 'fixed' }))}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (NPR)</option>
                  </select>
                </div>
              </div>

              {/* Tax */}
              <div>
                <label className="text-white font-semibold mb-2 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-orange-400" />
                  Tax (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.tax}
                  onChange={(e) => setFormData(prev => ({ ...prev, tax: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-white font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-400" />
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  placeholder="Add any special instructions or notes..."
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>

              {/* Summary */}
              <div className="bg-slate-900/50 border border-slate-600 rounded-xl p-6">
                <h3 className="text-white font-bold mb-4 text-lg">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-slate-300">
                    <span>Subtotal:</span>
                    <span>NPR {formData.subtotal.toFixed(2)}</span>
                  </div>
                  {formData.discount > 0 && (
                    <div className="flex justify-between text-slate-300">
                      <span>Discount ({formData.discountType === 'percentage' ? `${formData.discount}%` : 'Fixed'}):</span>
                      <span className="text-green-400">
                        - NPR {(formData.discountType === 'percentage' 
                          ? (formData.subtotal * formData.discount / 100) 
                          : formData.discount).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-300">
                    <span>Tax ({formData.tax}%):</span>
                    <span>NPR {((formData.subtotal - (formData.discountType === 'percentage' ? formData.subtotal * formData.discount / 100 : formData.discount)) * formData.tax / 100).toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t border-slate-600 flex justify-between text-xl">
                    <span className="text-white font-bold">Total Amount:</span>
                    <span className="text-orange-400 font-bold">NPR {formData.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setCurrentStep('preview')}
                className="w-full px-6 py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl font-semibold hover:from-orange-700 hover:to-orange-600 transition-all flex items-center justify-center gap-2"
              >
                Review Order
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Preview & Confirm */}
        {currentStep === 'preview' && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Review Order</h2>
                <p className="text-slate-400">Verify all details before creating the order</p>
              </div>
              <button
                onClick={() => setCurrentStep('details')}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Edit Details
              </button>
            </div>

            <div className="space-y-6">
              {/* Order Info */}
              <div className="bg-slate-900/50 border border-slate-600 rounded-xl p-6">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-400" />
                  Order Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Order Type</p>
                    <p className="text-white font-semibold">
                      {formData.type === 'purchase' ? 'Purchase Order' : 'Sales Order'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Expected Delivery</p>
                    <p className="text-white font-semibold">
                      {new Date(formData.expectedDeliveryDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">{formData.type === 'purchase' ? 'Supplier' : 'Customer'}</p>
                    <p className="text-white font-semibold">{formData.partyName}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Payment Terms</p>
                    <p className="text-white font-semibold capitalize">{formData.paymentTerms.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="bg-slate-900/50 border border-slate-600 rounded-xl p-6">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-orange-400" />
                  Order Items ({formData.items.length})
                </h3>
                <div className="space-y-3">
                  {formData.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-white font-semibold">{item.name}</p>
                        <p className="text-slate-400 text-sm">Qty: {item.quantity} × NPR {item.price}</p>
                      </div>
                      <div className="text-white font-bold">NPR {item.total.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 border-2 border-orange-500/50 rounded-xl p-6">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-orange-400" />
                  Financial Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-white">
                    <span>Subtotal:</span>
                    <span>NPR {formData.subtotal.toFixed(2)}</span>
                  </div>
                  {formData.discount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount:</span>
                      <span>- NPR {(formData.discountType === 'percentage' 
                        ? (formData.subtotal * formData.discount / 100) 
                        : formData.discount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white">
                    <span>Tax ({formData.tax}%):</span>
                    <span>NPR {((formData.subtotal - (formData.discountType === 'percentage' ? formData.subtotal * formData.discount / 100 : formData.discount)) * formData.tax / 100).toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t border-orange-500/30 flex justify-between text-2xl">
                    <span className="text-white font-bold">Total Amount:</span>
                    <span className="text-orange-400 font-bold">NPR {formData.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {formData.notes && (
                <div className="bg-slate-900/50 border border-slate-600 rounded-xl p-6">
                  <h3 className="text-white font-bold mb-2">Notes</h3>
                  <p className="text-slate-300">{formData.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleSaveOrder}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-600 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Create Order
                </button>
                <button
                  onClick={() => setCurrentStep('details')}
                  className="px-6 py-4 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-5 h-5" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
