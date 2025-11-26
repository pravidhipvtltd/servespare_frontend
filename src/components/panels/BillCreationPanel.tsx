import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingCart, Plus, Trash2, Search, User, Phone, MapPin,
  FileText, Calculator, Percent, CreditCard, Printer, Save,
  Check, X, Edit2, Package, AlertCircle, ChevronRight, Eye,
  Download, ArrowLeft, Receipt, Banknote, Smartphone, Building2,
  Clock, Calendar, Hash, DollarSign, CreditCard as CreditIcon, 
  FileCheck, Badge, Link as LinkIcon
} from 'lucide-react';
import { getFromStorage, saveToStorage } from '../../utils/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { InventoryItem, Bill, BillItem, Party, PartyType } from '../../types';
import { 
  getPendingOrdersForParty, 
  getOrderById, 
  processBillWithOrder 
} from '../../utils/orderBillSync';

interface BillFormData {
  orderId?: string;
  orderType?: 'purchase' | 'sales';
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerPanVat: string;
  customerType: 'customer' | PartyType;
  partyId?: string;
  items: BillItem[];
  subtotal: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'esewa' | 'fonepay' | 'bank' | 'credit' | 'cheque';
  notes: string;
}

type Step = 'items' | 'details' | 'preview';

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash', icon: Banknote, isPaid: true },
  { value: 'esewa', label: 'eSewa', icon: Smartphone, isPaid: true },
  { value: 'fonepay', label: 'FonePay', icon: Smartphone, isPaid: true },
  { value: 'bank', label: 'Bank Transfer', icon: Building2, isPaid: true },
  { value: 'credit', label: 'Credit', icon: CreditIcon, isPaid: false },
  { value: 'cheque', label: 'Cheque', icon: FileCheck, isPaid: false },
];

const PARTY_TYPE_LABELS: Record<PartyType | 'customer', { label: string; color: string }> = {
  customer: { label: 'Customer', color: 'bg-blue-100 text-blue-700' },
  supplier: { label: 'Supplier', color: 'bg-green-100 text-green-700' },
  distributor: { label: 'Distributor', color: 'bg-purple-100 text-purple-700' },
  manufacturer: { label: 'Manufacturer', color: 'bg-orange-100 text-orange-700' },
  wholesaler: { label: 'Wholesaler', color: 'bg-pink-100 text-pink-700' },
};

interface BillCreationPanelProps {
  editingBill?: Bill | null;
  onSave?: () => void;
}

export const BillCreationPanel: React.FC<BillCreationPanelProps> = ({ editingBill, onSave }) => {
  const { currentUser } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [currentStep, setCurrentStep] = useState<Step>('items');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  
  // Customer search suggestions
  const [nameSuggestions, setNameSuggestions] = useState<Party[]>([]);
  const [phoneSuggestions, setPhoneSuggestions] = useState<Party[]>([]);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [showPhoneSuggestions, setShowPhoneSuggestions] = useState(false);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  
  // Order linking
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [showOrderSelect, setShowOrderSelect] = useState(false);
  
  const printRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<BillFormData>({
    orderId: undefined,
    orderType: undefined,
    customerName: '',
    customerPhone: '+977',
    customerAddress: '',
    customerPanVat: '',
    customerType: 'customer',
    items: [],
    subtotal: 0,
    discount: 0,
    discountType: 'percentage',
    tax: 13, // Nepal VAT rate
    total: 0,
    paymentMethod: 'cash',
    notes: '',
  });

  useEffect(() => {
    loadInventory();
    loadParties();
  }, []);

  useEffect(() => {
    if (editingBill) {
      loadBillForEditing(editingBill);
    }
  }, [editingBill]);

  useEffect(() => {
    calculateTotals();
  }, [formData.items, formData.discount, formData.discountType, formData.tax]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = inventory.filter(
        (item) =>
          item.quantity > 0 &&
          (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.partNumber?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredItems(filtered.slice(0, 10));
    } else {
      setFilteredItems([]);
    }
  }, [searchQuery, inventory]);

  // Name suggestions
  useEffect(() => {
    if (formData.customerName.trim().length > 0) {
      const filtered = parties.filter((party) =>
        party.name.toLowerCase().startsWith(formData.customerName.toLowerCase())
      );
      setNameSuggestions(filtered.slice(0, 5));
    } else {
      setNameSuggestions([]);
    }
  }, [formData.customerName, parties]);

  // Phone suggestions
  useEffect(() => {
    if (formData.customerPhone.length > 4) {
      const filtered = parties.filter((party) =>
        party.phone.includes(formData.customerPhone.replace('+977', ''))
      );
      setPhoneSuggestions(filtered.slice(0, 5));
    } else {
      setPhoneSuggestions([]);
    }
  }, [formData.customerPhone, parties]);

  // Check for party match and load pending orders
  useEffect(() => {
    const matchedParty = parties.find(
      (party) =>
        party.name.toLowerCase() === formData.customerName.toLowerCase() &&
        party.phone === formData.customerPhone.replace('+977', '').trim()
    );

    if (matchedParty) {
      setSelectedParty(matchedParty);
      setFormData((prev) => ({
        ...prev,
        customerAddress: matchedParty.address,
        customerPanVat: matchedParty.panNumber || '',
        customerType: matchedParty.type,
        partyId: matchedParty.id,
      }));
      
      // Load pending orders for this party
      const orderType = matchedParty.type === 'supplier' ? 'purchase' : 'sales';
      const orders = getPendingOrdersForParty(matchedParty.id, orderType, currentUser?.workspaceId);
      setPendingOrders(orders);
    } else {
      setSelectedParty(null);
      setPendingOrders([]);
      if (formData.partyId) {
        setFormData((prev) => ({
          ...prev,
          customerType: 'customer',
          partyId: undefined,
          orderId: undefined,
          orderType: undefined,
        }));
      }
    }
  }, [formData.customerName, formData.customerPhone, parties]);

  const loadInventory = () => {
    const allInventory = getFromStorage('inventory', []);
    const workspaceInventory = allInventory.filter(
      (i: InventoryItem) => i.workspaceId === currentUser?.workspaceId
    );
    setInventory(workspaceInventory);
  };

  const loadParties = () => {
    const allParties = getFromStorage('parties', []);
    const workspaceParties = allParties.filter(
      (p: Party) => p.workspaceId === currentUser?.workspaceId && p.isActive
    );
    setParties(workspaceParties);
  };

  const loadBillForEditing = (bill: Bill) => {
    setFormData({
      customerName: bill.customerName,
      customerPhone: bill.customerPhone || '+977',
      customerAddress: bill.customerAddress || '',
      customerPanVat: bill.customerPanVat || '',
      customerType: bill.customerType || 'customer',
      partyId: bill.partyId,
      items: bill.items,
      subtotal: bill.subtotal,
      discount: bill.discount,
      discountType: bill.discountType || 'percentage',
      tax: bill.tax,
      total: bill.total,
      paymentMethod: bill.paymentMethod,
      notes: bill.notes || '',
    });
    setCurrentStep('items');
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

    setFormData((prev) => ({
      ...prev,
      subtotal,
      total: Math.max(0, total),
    }));
  };

  const selectParty = (party: Party) => {
    setFormData({
      ...formData,
      customerName: party.name,
      customerPhone: '+977' + party.phone,
      customerAddress: party.address,
      customerPanVat: party.panNumber || '',
      customerType: party.type,
      partyId: party.id,
    });
    setShowNameSuggestions(false);
    setShowPhoneSuggestions(false);
  };

  const addItemToBill = (inventoryItem: InventoryItem) => {
    const existingItemIndex = formData.items.findIndex(
      (item) => item.itemId === inventoryItem.id
    );

    if (existingItemIndex !== -1) {
      const updatedItems = [...formData.items];
      const currentQty = updatedItems[existingItemIndex].quantity;
      
      if (currentQty >= inventoryItem.quantity) {
        alert(`Cannot add more. Only ${inventoryItem.quantity} units available in stock.`);
        return;
      }

      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: currentQty + 1,
        total: (currentQty + 1) * updatedItems[existingItemIndex].price,
      };
      setFormData({ ...formData, items: updatedItems });
    } else {
      const newItem: BillItem = {
        itemId: inventoryItem.id,
        itemName: inventoryItem.name,
        quantity: 1,
        price: inventoryItem.mrp, // Use MRP instead of price
        total: inventoryItem.mrp, // Use MRP instead of price
        partNumber: inventoryItem.partNumber,
      };
      setFormData({ ...formData, items: [...formData.items, newItem] });
    }

    setSearchQuery('');
    setShowSearch(false);
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    const inventoryItem = inventory.find((i) => i.id === itemId);
    if (!inventoryItem) return;

    if (quantity > inventoryItem.quantity) {
      alert(`Only ${inventoryItem.quantity} units available in stock.`);
      return;
    }

    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    const updatedItems = formData.items.map((item) =>
      item.itemId === itemId
        ? { ...item, quantity, total: quantity * item.price }
        : item
    );
    setFormData({ ...formData, items: updatedItems });
  };

  const updateItemPrice = (itemId: string, price: number) => {
    // Update bill item price
    const updatedItems = formData.items.map((item) =>
      item.itemId === itemId
        ? { ...item, price, total: item.quantity * price }
        : item
    );
    setFormData({ ...formData, items: updatedItems });

    // Synchronize price back to inventory MRP
    const allInventory = getFromStorage('inventory', []);
    const updatedInventory = allInventory.map((invItem: InventoryItem) => {
      if (invItem.id === itemId) {
        return {
          ...invItem,
          mrp: price, // Update the MRP (selling price used in bills)
        };
      }
      return invItem;
    });
    saveToStorage('inventory', updatedInventory);
    
    // Reload local inventory state to reflect changes
    setInventory(updatedInventory.filter((i: InventoryItem) => i.workspaceId === currentUser?.workspaceId));
  };

  const removeItem = (itemId: string) => {
    const updatedItems = formData.items.filter((item) => item.itemId !== itemId);
    setFormData({ ...formData, items: updatedItems });
  };

  const handleSaveBill = (isDraft: boolean = false) => {
    if (formData.items.length === 0) {
      alert('Please add at least one item to the bill.');
      return;
    }

    if (!isDraft && !formData.customerName.trim()) {
      alert('Please enter customer name.');
      return;
    }

    const allBills = getFromStorage('bills', []);
    
    // Determine payment status
    let paymentStatus: 'paid' | 'pending' | 'draft' = 'paid';
    if (isDraft) {
      paymentStatus = 'draft';
    } else {
      const paymentMethod = PAYMENT_METHODS.find(m => m.value === formData.paymentMethod);
      paymentStatus = paymentMethod?.isPaid ? 'paid' : 'pending';
    }

    if (editingBill) {
      // Update existing bill
      const updatedBills = allBills.map((bill: Bill) =>
        bill.id === editingBill.id
          ? {
              ...bill,
              customerName: formData.customerName || 'Walk-in Customer',
              customerPhone: formData.customerPhone !== '+977' ? formData.customerPhone : undefined,
              customerAddress: formData.customerAddress || undefined,
              customerPanVat: formData.customerPanVat || undefined,
              customerType: formData.customerType,
              partyId: formData.partyId,
              items: formData.items,
              subtotal: formData.subtotal,
              discount: formData.discount,
              discountType: formData.discountType,
              tax: formData.tax,
              total: formData.total,
              paymentMethod: formData.paymentMethod,
              paymentStatus,
              notes: formData.notes || undefined,
            }
          : bill
      );
      saveToStorage('bills', updatedBills);

      // Update inventory only if not a draft
      if (!isDraft) {
        updateInventoryAfterBill();
      }

      alert(
        isDraft
          ? `Draft updated successfully! Bill Number: ${editingBill.billNumber}`
          : `Bill updated successfully! Bill Number: ${editingBill.billNumber}`
      );
    } else {
      // Create new bill
      const billNumber = `BILL-${Date.now().toString().slice(-8)}`;

      const newBill: Bill = {
        id: Date.now().toString(),
        billNumber,
        orderId: formData.orderId,
        customerName: formData.customerName || 'Walk-in Customer',
        customerPhone: formData.customerPhone !== '+977' ? formData.customerPhone : undefined,
        customerAddress: formData.customerAddress || undefined,
        customerPanVat: formData.customerPanVat || undefined,
        customerType: formData.customerType,
        partyId: formData.partyId,
        items: formData.items,
        subtotal: formData.subtotal,
        discount: formData.discount,
        discountType: formData.discountType,
        tax: formData.tax,
        total: formData.total,
        paymentMethod: formData.paymentMethod,
        paymentStatus,
        notes: formData.notes || undefined,
        workspaceId: currentUser?.workspaceId,
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.id,
      };

      // Update inventory only if not a draft
      if (!isDraft) {
        updateInventoryAfterBill();
      }

      saveToStorage('bills', [...allBills, newBill]);

      // 🎯 AUTO-UPDATE ORDER STATUS AND INVENTORY IF LINKED TO ORDER
      if (formData.orderId && formData.orderType && !isDraft) {
        const orderSynced = processBillWithOrder(
          newBill, 
          formData.orderId, 
          formData.orderType, 
          currentUser?.workspaceId
        );
        
        if (orderSynced) {
          alert(
            `✅ Bill created successfully! Bill Number: ${billNumber}\n\n` +
            `📦 Order ${formData.orderType === 'purchase' ? 'received' : 'delivered'} and marked as complete.\n` +
            `📊 Inventory updated automatically.`
          );
        } else {
          alert(
            `Bill created: ${billNumber}\n\n` +
            `⚠️ Order update failed. Please check order status manually.`
          );
        }
      } else {
        alert(
          isDraft
            ? `Draft saved successfully! Bill Number: ${billNumber}`
            : `Bill created successfully! Bill Number: ${billNumber}`
        );
      }
    }

    // Reset form
    if (onSave) {
      onSave();
    }
    resetForm();
  };

  const updateInventoryAfterBill = () => {
    const updatedInventory = inventory.map((invItem) => {
      const billItem = formData.items.find((item) => item.itemId === invItem.id);
      if (billItem) {
        return {
          ...invItem,
          quantity: invItem.quantity - billItem.quantity,
        };
      }
      return invItem;
    });

    const allInventory = getFromStorage('inventory', []);
    const otherWorkspaceInventory = allInventory.filter(
      (i: InventoryItem) => i.workspaceId !== currentUser?.workspaceId
    );
    saveToStorage('inventory', [...otherWorkspaceInventory, ...updatedInventory]);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOrderSelect = (orderId: string) => {
    const orderType = selectedParty?.type === 'supplier' ? 'purchase' : 'sales';
    const order = getOrderById(orderId, orderType);
    
    if (order) {
      // Convert order items to bill items
      const billItems: BillItem[] = order.items.map((item: any) => ({
        itemId: item.id,
        itemName: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      }));
      
      setFormData((prev) => ({
        ...prev,
        orderId: order.id,
        orderType: orderType,
        items: billItems,
        discount: order.discount || 0,
        notes: `Linked to Order: ${order.orderNumber}`,
      }));
      
      setShowOrderSelect(false);
      alert(`✅ Order loaded! Items from ${order.orderNumber} added to bill.`);
    }
  };

  const resetForm = () => {
    setFormData({
      orderId: undefined,
      orderType: undefined,
      customerName: '',
      customerPhone: '+977',
      customerAddress: '',
      customerPanVat: '',
      customerType: 'customer',
      items: [],
      subtotal: 0,
      discount: 0,
      discountType: 'percentage',
      tax: 13,
      total: 0,
      paymentMethod: 'cash',
      notes: '',
    });
    setCurrentStep('items');
    setSearchQuery('');
    setSelectedParty(null);
    loadInventory();
  };

  const canProceedToNext = () => {
    if (currentStep === 'items') {
      return formData.items.length > 0;
    }
    if (currentStep === 'details') {
      return formData.customerName.trim().length > 0;
    }
    return true;
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6 print:hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl text-gray-900 flex items-center space-x-3">
              <Receipt className="w-7 h-7 text-blue-600" />
              <span>{editingBill ? 'Edit Bill' : 'Create New Bill'}</span>
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {editingBill ? `Editing ${editingBill.billNumber}` : 'Generate professional invoices for your customers'}
            </p>
          </div>
          {formData.items.length > 0 && (
            <button
              onClick={resetForm}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4">
          {[
            { key: 'items', label: 'Add Items', icon: ShoppingCart },
            { key: 'details', label: 'Customer Details', icon: User },
            { key: 'preview', label: 'Preview & Print', icon: Eye },
          ].map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.key;
            const isCompleted =
              (step.key === 'items' && formData.items.length > 0) ||
              (step.key === 'details' && formData.customerName.trim().length > 0);

            return (
              <React.Fragment key={step.key}>
                <button
                  onClick={() => {
                    if (step.key === 'items' || isCompleted) {
                      setCurrentStep(step.key as Step);
                    }
                  }}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg scale-105'
                      : isCompleted
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                  disabled={!isActive && !isCompleted && step.key !== 'items'}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isActive
                        ? 'bg-white bg-opacity-20'
                        : isCompleted
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-300'
                    }`}
                  >
                    {isCompleted && !isActive ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-4 h-4" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="text-xs opacity-75">Step {index + 1}</div>
                    <div className="font-medium">{step.label}</div>
                  </div>
                </button>
                {index < 2 && (
                  <ChevronRight
                    className={`w-5 h-5 ${isCompleted ? 'text-green-600' : 'text-gray-300'}`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Step 1: Add Items */}
          {currentStep === 'items' && (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="bg-white rounded-xl border-2 border-blue-200 p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-900 flex items-center space-x-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Search className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="block">Search & Add Items</span>
                      <span className="text-xs text-gray-500 font-normal">Type to search from inventory</span>
                    </div>
                  </h3>
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="flex items-center space-x-1 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                      <span>Live Inventory</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">{inventory.length} items</span>
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSearch(true);
                    }}
                    onFocus={() => setShowSearch(true)}
                    placeholder="🔍 Search items by name or part number..."
                    className="w-full pl-14 pr-4 py-5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg shadow-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setShowSearch(false);
                      }}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}

                  {/* Search Dropdown */}
                  {showSearch && filteredItems.length > 0 && (
                    <div className="absolute z-20 w-full mt-2 bg-white border-2 border-blue-200 rounded-xl shadow-2xl max-h-96 overflow-y-auto">
                      <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 text-sm">
                        Found {filteredItems.length} item(s) - Click to add
                      </div>
                      {filteredItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => addItemToBill(item)}
                          className="w-full px-6 py-4 hover:bg-blue-50 transition-colors flex items-center justify-between border-b border-gray-100 last:border-0 text-left group"
                        >
                          <div className="flex-1">
                            <div className="text-gray-900 mb-1 group-hover:text-blue-600">{item.name}</div>
                            <div className="flex items-center space-x-3 text-sm text-gray-500">
                              {item.partNumber && (
                                <span className="flex items-center">
                                  <Hash className="w-3 h-3 mr-1" />
                                  {item.partNumber}
                                </span>
                              )}
                              <span className="flex items-center">
                                <Package className="w-3 h-3 mr-1" />
                                {item.quantity} in stock
                              </span>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-blue-600 text-lg group-hover:font-bold">₹{item.mrp.toLocaleString()}</div>
                            <div className="text-xs text-gray-400">
                              MRP (Selling Price)
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {searchQuery && filteredItems.length === 0 && (
                  <div className="mt-4 text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p>No items found matching "{searchQuery}"</p>
                  </div>
                )}
              </div>

              {/* Price Sync Info Banner */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-gray-900 mb-1 flex items-center space-x-2">
                      <span>💡 Smart MRP Synchronization</span>
                    </h4>
                    <p className="text-sm text-gray-600">
                      Bills use MRP (Maximum Retail Price) for selling. When you change a product's MRP in this bill, it will automatically update the inventory MRP system-wide. 
                      All future bills will reflect the new MRP.
                    </p>
                  </div>
                </div>
              </div>

              {/* Cart Items */}
              {formData.items.length > 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <ShoppingCart className="w-6 h-6" />
                        <div>
                          <h3 className="text-xl">Bill Items</h3>
                          <p className="text-blue-100 text-sm mt-1">
                            {formData.items.length} item(s) added
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-blue-100 text-sm">Subtotal</div>
                        <div className="text-3xl">₹{formData.subtotal.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {formData.items.map((item, index) => {
                      const inventoryItem = inventory.find((i) => i.id === item.itemId);
                      return (
                        <div
                          key={item.itemId}
                          className="p-6 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-lg">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="text-gray-900 mb-1">{item.itemName}</div>
                              <div className="flex items-center space-x-3 text-sm text-gray-500">
                                {item.partNumber && (
                                  <span className="flex items-center">
                                    <Hash className="w-3 h-3 mr-1" />
                                    {item.partNumber}
                                  </span>
                                )}
                                <span className="flex items-center text-green-600">
                                  <Package className="w-3 h-3 mr-1" />
                                  {inventoryItem?.quantity || 0} available
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-4">
                              {/* Quantity Control */}
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() =>
                                      updateItemQuantity(item.itemId, item.quantity - 1)
                                    }
                                    className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-colors"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) =>
                                      updateItemQuantity(
                                        item.itemId,
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                    className="w-16 px-2 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="1"
                                  />
                                  <button
                                    onClick={() =>
                                      updateItemQuantity(item.itemId, item.quantity + 1)
                                    }
                                    className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-colors"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              {/* Price */}
                              <div>
                                <label className="block text-xs text-gray-500 mb-1 flex items-center space-x-1">
                                  <span>MRP</span>
                                  <span className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 rounded-full" title="Changes sync to inventory MRP">
                                    SYNC
                                  </span>
                                </label>
                                <input
                                  type="number"
                                  value={item.price}
                                  onChange={(e) =>
                                    updateItemPrice(item.itemId, parseFloat(e.target.value) || 0)
                                  }
                                  className="w-24 px-3 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                  step="0.01"
                                  min="0"
                                  title="Changing this MRP will update inventory MRP system-wide"
                                />
                              </div>

                              {/* Total */}
                              <div className="text-right min-w-[120px]">
                                <div className="text-xs text-gray-500 mb-1">Total</div>
                                <div className="text-xl text-blue-600">
                                  ₹{item.total.toLocaleString()}
                                </div>
                              </div>

                              {/* Remove Button */}
                              <button
                                onClick={() => removeItem(item.itemId)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove item"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Continue Button */}
                  <div className="p-6 bg-gray-50 border-t border-gray-200">
                    <button
                      onClick={() => setCurrentStep('details')}
                      disabled={!canProceedToNext()}
                      className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 transform hover:scale-[1.02] disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 text-lg"
                    >
                      <span>Continue to Customer Details</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-gray-900 text-xl mb-2">No items added yet</h3>
                  <p className="text-gray-500">
                    Search and add items from your inventory to create a bill
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Customer Details */}
          {currentStep === 'details' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <button
                onClick={() => setCurrentStep('items')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to items</span>
              </button>

              {/* Customer Information */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <User className="w-6 h-6" />
                      <div>
                        <h3 className="text-xl">Customer Information</h3>
                        <p className="text-green-100 text-sm mt-1">
                          Enter customer details for the bill
                        </p>
                      </div>
                    </div>
                    {selectedParty && (
                      <span className={`px-4 py-2 rounded-full text-sm flex items-center space-x-2 ${PARTY_TYPE_LABELS[selectedParty.type].color}`}>
                        <Badge className="w-4 h-4" />
                        <span>{PARTY_TYPE_LABELS[selectedParty.type].label}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {/* Customer Name with Suggestions */}
                  <div className="relative">
                    <label className="block text-gray-700 mb-2 flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>Customer Name <span className="text-red-500">*</span></span>
                    </label>
                    <input
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => {
                        setFormData({ ...formData, customerName: e.target.value });
                        setShowNameSuggestions(true);
                      }}
                      onFocus={() => setShowNameSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowNameSuggestions(false), 200)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter customer name"
                      required
                    />
                    
                    {/* Name Suggestions Dropdown */}
                    {showNameSuggestions && nameSuggestions.length > 0 && (
                      <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        {nameSuggestions.map((party) => (
                          <button
                            key={party.id}
                            onClick={() => selectParty(party)}
                            className="w-full px-4 py-3 hover:bg-green-50 transition-colors flex items-center justify-between border-b border-gray-100 last:border-0 text-left"
                          >
                            <div>
                              <div className="text-gray-900">{party.name}</div>
                              <div className="text-sm text-gray-500">{party.phone}</div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs ${PARTY_TYPE_LABELS[party.type].color}`}>
                              {PARTY_TYPE_LABELS[party.type].label}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Phone Number with Suggestions */}
                  <div className="relative">
                    <label className="block text-gray-700 mb-2 flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>Phone Number</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => {
                        setFormData({ ...formData, customerPhone: e.target.value });
                        setShowPhoneSuggestions(true);
                      }}
                      onFocus={() => setShowPhoneSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowPhoneSuggestions(false), 200)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="+977 9800000000"
                    />
                    
                    {/* Phone Suggestions Dropdown */}
                    {showPhoneSuggestions && phoneSuggestions.length > 0 && (
                      <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        {phoneSuggestions.map((party) => (
                          <button
                            key={party.id}
                            onClick={() => selectParty(party)}
                            className="w-full px-4 py-3 hover:bg-green-50 transition-colors flex items-center justify-between border-b border-gray-100 last:border-0 text-left"
                          >
                            <div>
                              <div className="text-gray-900">{party.name}</div>
                              <div className="text-sm text-gray-500">+977 {party.phone}</div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs ${PARTY_TYPE_LABELS[party.type].color}`}>
                              {PARTY_TYPE_LABELS[party.type].label}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Customer Type Badge */}
                  {!selectedParty && formData.customerName && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Customer Type:</span>
                      <span className={`px-3 py-1 rounded-full text-sm ${PARTY_TYPE_LABELS['customer'].color}`}>
                        {PARTY_TYPE_LABELS['customer'].label}
                      </span>
                    </div>
                  )}

                  {/* Address */}
                  <div>
                    <label className="block text-gray-700 mb-2 flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>Address</span>
                    </label>
                    <textarea
                      value={formData.customerAddress}
                      onChange={(e) =>
                        setFormData({ ...formData, customerAddress: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter customer address"
                      rows={3}
                      disabled={!!selectedParty}
                    />
                  </div>

                  {/* PAN/VAT Number */}
                  <div>
                    <label className="block text-gray-700 mb-2 flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span>PAN/VAT Number (Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.customerPanVat}
                      onChange={(e) =>
                        setFormData({ ...formData, customerPanVat: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter PAN or VAT number"
                      disabled={!!selectedParty}
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Payment */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
                  <div className="flex items-center space-x-3">
                    <Calculator className="w-6 h-6" />
                    <div>
                      <h3 className="text-xl">Pricing & Payment</h3>
                      <p className="text-purple-100 text-sm mt-1">
                        Configure discounts and payment method
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Discount */}
                  <div>
                    <label className="block text-gray-700 mb-3 flex items-center space-x-2">
                      <Percent className="w-4 h-4 text-gray-500" />
                      <span>Discount</span>
                    </label>
                    <div className="flex space-x-3">
                      <input
                        type="number"
                        value={formData.discount === 0 ? '' : formData.discount}
                        onChange={(e) =>
                          setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })
                        }
                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter discount"
                        min="0"
                        step="0.01"
                      />
                      <select
                        value={formData.discountType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            discountType: e.target.value as 'percentage' | 'fixed',
                          })
                        }
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed (₹)</option>
                      </select>
                    </div>
                  </div>

                  {/* Tax */}
                  <div>
                    <label className="block text-gray-700 mb-3 flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span>Tax/VAT (%)</span>
                    </label>
                    <input
                      type="number"
                      value={formData.tax === 0 ? '' : formData.tax}
                      onChange={(e) =>
                        setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter tax rate (e.g., 13)"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-gray-700 mb-3 flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      <span>Payment Method <span className="text-red-500">*</span></span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {PAYMENT_METHODS.map((method) => {
                        const MethodIcon = method.icon;
                        return (
                          <button
                            key={method.value}
                            onClick={() =>
                              setFormData({
                                ...formData,
                                paymentMethod: method.value as any,
                              })
                            }
                            className={`p-4 border-2 rounded-lg flex items-center space-x-3 transition-all relative ${
                              formData.paymentMethod === method.value
                                ? 'border-purple-600 bg-purple-50 text-purple-700'
                                : 'border-gray-300 hover:border-gray-400 text-gray-700'
                            }`}
                          >
                            <MethodIcon className="w-5 h-5" />
                            <span className="font-medium">{method.label}</span>
                            {formData.paymentMethod === method.value && (
                              <Check className="w-5 h-5 ml-auto" />
                            )}
                            {!method.isPaid && (
                              <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                                Pending
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      <AlertCircle className="w-4 h-4 inline mr-1" />
                      Credit and Cheque payments will be marked as pending
                    </p>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-gray-700 mb-2 flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span>Notes (Optional)</span>
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Add any additional notes..."
                      rows={3}
                    />
                  </div>

                  {/* Calculation Summary */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between text-gray-700">
                      <span>Subtotal:</span>
                      <span className="text-lg">₹{formData.subtotal.toLocaleString()}</span>
                    </div>
                    {formData.discount > 0 && (
                      <div className="flex items-center justify-between text-green-600">
                        <span>
                          Discount (
                          {formData.discountType === 'percentage'
                            ? `${formData.discount}%`
                            : `₹${formData.discount}`}
                          ):
                        </span>
                        <span className="text-lg">
                          -₹
                          {(formData.discountType === 'percentage'
                            ? (formData.subtotal * formData.discount) / 100
                            : formData.discount
                          ).toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-gray-700">
                      <span>Tax ({formData.tax}%):</span>
                      <span className="text-lg">
                        ₹
                        {(
                          ((formData.subtotal -
                            (formData.discountType === 'percentage'
                              ? (formData.subtotal * formData.discount) / 100
                              : formData.discount)) *
                            formData.tax) /
                          100
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="pt-3 border-t-2 border-gray-300 flex items-center justify-between">
                      <span className="text-gray-900 text-xl">Total Amount:</span>
                      <span className="text-3xl text-blue-600">
                        ₹{formData.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <div className="flex space-x-3">
                <button
                  onClick={() => handleSaveBill(true)}
                  className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Save as Draft</span>
                </button>
                <button
                  onClick={() => setCurrentStep('preview')}
                  disabled={!canProceedToNext()}
                  className="flex-1 px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 transform hover:scale-[1.02] disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                >
                  <span>Preview Bill</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Preview & Print */}
          {currentStep === 'preview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between print:hidden">
                <button
                  onClick={() => setCurrentStep('details')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to details</span>
                </button>

                <div className="flex space-x-3">
                  <button
                    onClick={handlePrint}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <Printer className="w-5 h-5" />
                    <span>Print Bill</span>
                  </button>
                  <button
                    onClick={() => handleSaveBill(false)}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                  >
                    <Check className="w-5 h-5" />
                    <span>Save & Complete</span>
                  </button>
                </div>
              </div>

              {/* Print Preview */}
              <div
                ref={printRef}
                className="bg-white rounded-xl border border-gray-200 shadow-lg p-12 max-w-4xl mx-auto print:shadow-none print:border-0"
              >
                {/* Header */}
                <div className="border-b-4 border-blue-600 pb-6 mb-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-4xl text-gray-900 mb-2">INVOICE</h1>
                      <p className="text-gray-600">
                        {currentUser?.workspace || 'Auto Parts Store'}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        Kathmandu, Nepal • +977 9800000000
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-500 text-sm">Bill Number</div>
                      <div className="text-2xl text-gray-900 mb-3">
                        {editingBill?.billNumber || `BILL-${Date.now().toString().slice(-8)}`}
                      </div>
                      <div className="text-gray-500 text-sm">Date</div>
                      <div className="text-gray-900">
                        {new Date().toLocaleDateString('en-US', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="mb-8 bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-gray-500 text-sm">BILL TO</div>
                    {formData.customerType !== 'customer' && (
                      <span className={`px-3 py-1 rounded-full text-xs ${PARTY_TYPE_LABELS[formData.customerType].color}`}>
                        {PARTY_TYPE_LABELS[formData.customerType].label}
                      </span>
                    )}
                  </div>
                  <div className="text-gray-900 text-xl mb-3">{formData.customerName}</div>
                  {formData.customerPhone !== '+977' && (
                    <div className="text-gray-600 flex items-center space-x-2 mb-1">
                      <Phone className="w-4 h-4" />
                      <span>{formData.customerPhone}</span>
                    </div>
                  )}
                  {formData.customerAddress && (
                    <div className="text-gray-600 flex items-center space-x-2 mb-1">
                      <MapPin className="w-4 h-4" />
                      <span>{formData.customerAddress}</span>
                    </div>
                  )}
                  {formData.customerPanVat && (
                    <div className="text-gray-600 flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>PAN/VAT: {formData.customerPanVat}</span>
                    </div>
                  )}
                </div>

                {/* Items Table */}
                <table className="w-full mb-8">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left text-gray-600 pb-3 pr-4">#</th>
                      <th className="text-left text-gray-600 pb-3 pr-4">Item Description</th>
                      <th className="text-right text-gray-600 pb-3 px-4">Qty</th>
                      <th className="text-right text-gray-600 pb-3 px-4">Price</th>
                      <th className="text-right text-gray-600 pb-3">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={item.itemId} className="border-b border-gray-200">
                        <td className="py-4 pr-4 text-gray-600">{index + 1}</td>
                        <td className="py-4 pr-4">
                          <div className="text-gray-900">{item.itemName}</div>
                          {item.partNumber && (
                            <div className="text-sm text-gray-500">PN: {item.partNumber}</div>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right text-gray-700">{item.quantity}</td>
                        <td className="py-4 px-4 text-right text-gray-700">
                          ₹{item.price.toLocaleString()}
                        </td>
                        <td className="py-4 text-right text-gray-900">
                          ₹{item.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end mb-8">
                  <div className="w-80 space-y-3">
                    <div className="flex items-center justify-between text-gray-700">
                      <span>Subtotal:</span>
                      <span className="text-lg">₹{formData.subtotal.toLocaleString()}</span>
                    </div>
                    {formData.discount > 0 && (
                      <div className="flex items-center justify-between text-green-600">
                        <span>
                          Discount (
                          {formData.discountType === 'percentage'
                            ? `${formData.discount}%`
                            : `₹${formData.discount}`}
                          ):
                        </span>
                        <span>
                          -₹
                          {(formData.discountType === 'percentage'
                            ? (formData.subtotal * formData.discount) / 100
                            : formData.discount
                          ).toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-gray-700">
                      <span>Tax ({formData.tax}%):</span>
                      <span>
                        ₹
                        {(
                          ((formData.subtotal -
                            (formData.discountType === 'percentage'
                              ? (formData.subtotal * formData.discount) / 100
                              : formData.discount)) *
                            formData.tax) /
                          100
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="pt-3 border-t-2 border-gray-300 flex items-center justify-between">
                      <span className="text-gray-900 text-xl">Total:</span>
                      <span className="text-3xl text-blue-600">
                        ₹{formData.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment & Notes */}
                <div className="border-t-2 border-gray-200 pt-6 space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm capitalize">
                      {formData.paymentMethod}
                    </span>
                  </div>
                  {formData.notes && (
                    <div>
                      <div className="text-gray-600 mb-1">Notes:</div>
                      <div className="text-gray-900 bg-gray-50 rounded-lg p-4">
                        {formData.notes}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-12 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
                  <p>Thank you for your business!</p>
                  <p className="mt-2">For any queries, please contact us.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          ${printRef.current ? `#${printRef.current.id}` : ''}, 
          ${printRef.current ? `#${printRef.current.id}` : ''} * {
            visibility: visible;
          }
          ${printRef.current ? `#${printRef.current.id}` : ''} {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
