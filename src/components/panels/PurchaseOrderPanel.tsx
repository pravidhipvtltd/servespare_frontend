import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, X, Upload, FileText, CheckCircle, AlertTriangle,
  ArrowRight, Clock, Package, DollarSign, TrendingUp, TrendingDown,
  Truck, ClipboardCheck, Edit, Trash2, Image as ImageIcon, Paperclip,
  Calendar, User, Building, Phone, Mail, AlertCircle, Zap, Check
} from 'lucide-react';
import { getFromStorage, saveToStorage } from '../../utils/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { InventoryItem, Party } from '../../types';

type POStatus = 'draft' | 'review' | 'approval' | 'ordered' | 'delivered';

interface POItem {
  id: string;
  productId: string;
  productName: string;
  partNumber?: string;
  currentStock: number;
  lastPurchasePrice?: number;
  quantity: number;
  rate: number;
  remarks?: string;
  total: number;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  workspaceId?: string;
  supplierId: string;
  supplierName: string;
  status: POStatus;
  items: POItem[];
  subtotal: number;
  tax: number;
  total: number;
  attachments: string[];
  notes?: string;
  createdAt: string;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  estimatedDelivery?: string;
}

const STATUS_STEPS: { id: POStatus; label: string; icon: any }[] = [
  { id: 'draft', label: 'Draft', icon: Edit },
  { id: 'review', label: 'Review', icon: ClipboardCheck },
  { id: 'approval', label: 'Approval', icon: CheckCircle },
  { id: 'ordered', label: 'Ordered', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: Package },
];

export const PurchaseOrderPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'approval'>('list');
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentStep, setCurrentStep] = useState<POStatus>('draft');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [selectedSupplier, setSelectedSupplier] = useState<Party | null>(null);
  const [poItems, setPoItems] = useState<POItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

  // Data
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Party[]>([]);

  // Approval animation
  const [showApprovalAnimation, setShowApprovalAnimation] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const inv = getFromStorage('inventory', []).filter(
      (i: InventoryItem) => i.workspaceId === currentUser?.workspaceId
    );
    setInventory(inv);

    const parties = getFromStorage('parties', []).filter(
      (p: Party) => p.workspaceId === currentUser?.workspaceId && p.type === 'supplier'
    );
    setSuppliers(parties);

    const pos = getFromStorage('purchaseOrders', []).filter(
      (po: PurchaseOrder) => po.workspaceId === currentUser?.workspaceId
    );
    setPurchaseOrders(pos);
  };

  const getFilteredProducts = () => {
    if (!productSearch) return [];
    return inventory
      .filter(item => 
        (item.name || '').toLowerCase().includes(productSearch.toLowerCase()) ||
        (item.partNumber || '').toLowerCase().includes(productSearch.toLowerCase())
      )
      .slice(0, 5);
  };

  const addProductToOrder = (product: InventoryItem) => {
    // Check if already added
    if (poItems.find(item => item.productId === product.id)) {
      alert('Product already added to order');
      return;
    }

    const newItem: POItem = {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      partNumber: product.partNumber,
      currentStock: product.quantity,
      lastPurchasePrice: product.price,
      quantity: 1,
      rate: product.price,
      total: product.price,
    };

    setPoItems([...poItems, newItem]);
    setProductSearch('');
    setShowProductSuggestions(false);
  };

  const updatePOItem = (id: string, field: keyof POItem, value: any) => {
    setPoItems(items => items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updated.total = updated.quantity * updated.rate;
        }
        return updated;
      }
      return item;
    }));
  };

  const removePOItem = (id: string) => {
    setPoItems(items => items.filter(item => item.id !== id));
  };

  const calculateTotals = () => {
    const subtotal = poItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.13; // 13% VAT for Nepal
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileNames = Array.from(files).map(f => f.name);
      setAttachments([...attachments, ...fileNames]);
    }
  };

  const saveDraft = () => {
    if (!selectedSupplier || poItems.length === 0) {
      alert('Please select a supplier and add at least one item');
      return;
    }

    const { subtotal, tax, total } = calculateTotals();
    const newPO: PurchaseOrder = {
      id: Date.now().toString(),
      poNumber: `PO-${Date.now().toString().slice(-6)}`,
      workspaceId: currentUser?.workspaceId,
      supplierId: selectedSupplier.id,
      supplierName: selectedSupplier.name,
      status: 'draft',
      items: poItems,
      subtotal,
      tax,
      total,
      attachments,
      notes,
      estimatedDelivery,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.id,
    };

    const allPOs = getFromStorage('purchaseOrders', []);
    saveToStorage('purchaseOrders', [...allPOs, newPO]);
    loadData();
    resetForm();
    setViewMode('list');
  };

  const submitForReview = () => {
    if (!selectedSupplier || poItems.length === 0) {
      alert('Please select a supplier and add at least one item');
      return;
    }

    const { subtotal, tax, total } = calculateTotals();
    const newPO: PurchaseOrder = {
      id: Date.now().toString(),
      poNumber: `PO-${Date.now().toString().slice(-6)}`,
      workspaceId: currentUser?.workspaceId,
      supplierId: selectedSupplier.id,
      supplierName: selectedSupplier.name,
      status: 'review',
      items: poItems,
      subtotal,
      tax,
      total,
      attachments,
      notes,
      estimatedDelivery,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.id,
    };

    const allPOs = getFromStorage('purchaseOrders', []);
    saveToStorage('purchaseOrders', [...allPOs, newPO]);
    loadData();
    setCurrentStep('review');
  };

  const approvePO = (po: PurchaseOrder) => {
    setShowApprovalAnimation(true);
    
    setTimeout(() => {
      const allPOs = getFromStorage('purchaseOrders', []);
      const updated = allPOs.map((p: PurchaseOrder) =>
        p.id === po.id
          ? { 
              ...p, 
              status: 'ordered' as POStatus,
              approvedBy: currentUser?.id,
              approvedAt: new Date().toISOString()
            }
          : p
      );
      saveToStorage('purchaseOrders', updated);
      loadData();
      
      setTimeout(() => {
        setShowApprovalAnimation(false);
        setViewMode('list');
        setSelectedPO(null);
      }, 1500);
    }, 1000);
  };

  const resetForm = () => {
    setSelectedSupplier(null);
    setPoItems([]);
    setNotes('');
    setAttachments([]);
    setEstimatedDelivery('');
    setCurrentStep('draft');
  };

  const openApprovalView = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setViewMode('approval');
  };

  const getCashflowImpact = (amount: number) => {
    // Mock cashflow calculation
    const currentCash = 250000; // Mock current cash
    const afterPurchase = currentCash - amount;
    const impactPercentage = ((amount / currentCash) * 100).toFixed(1);
    
    return {
      currentCash,
      afterPurchase,
      impactPercentage,
      status: afterPurchase > 100000 ? 'safe' : afterPurchase > 50000 ? 'caution' : 'warning'
    };
  };

  const getSupplierCreditWarning = (supplier: Party | null) => {
    if (!supplier) return null;
    
    const creditLimit = 500000; // Mock credit limit
    const currentDue = 120000; // Mock current due
    const available = creditLimit - currentDue;
    const { total } = calculateTotals();
    
    if (total > available) {
      return {
        type: 'error',
        message: `Exceeds available credit by ₹${(total - available).toLocaleString()}`,
        available
      };
    } else if (total > available * 0.8) {
      return {
        type: 'warning',
        message: `High credit utilization: ${((currentDue + total) / creditLimit * 100).toFixed(0)}%`,
        available
      };
    }
    return null;
  };

  const getStockSimulation = (po: PurchaseOrder) => {
    return po.items.map(item => {
      const product = inventory.find(p => p.id === item.productId);
      const currentStock = product?.quantity || 0;
      const afterStock = currentStock + item.quantity;
      const percentIncrease = currentStock > 0 ? ((item.quantity / currentStock) * 100).toFixed(0) : '100';
      
      return {
        ...item,
        currentStock,
        afterStock,
        percentIncrease
      };
    });
  };

  const { subtotal, tax, total } = calculateTotals();
  const creditWarning = getSupplierCreditWarning(selectedSupplier);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-900 text-2xl mb-1">Purchase Orders</h3>
          <p className="text-gray-500 text-sm">Create and manage purchase orders with approval workflow</p>
        </div>
        {viewMode === 'list' && (
          <button
            onClick={() => {
              resetForm();
              setViewMode('create');
            }}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Create New PO</span>
          </button>
        )}
        {viewMode !== 'list' && (
          <button
            onClick={() => {
              resetForm();
              setViewMode('list');
              setSelectedPO(null);
            }}
            className="flex items-center space-x-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
          >
            <X className="w-5 h-5" />
            <span>Cancel</span>
          </button>
        )}
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-gray-600 text-sm font-semibold py-4 px-6">PO Number</th>
                  <th className="text-left text-gray-600 text-sm font-semibold py-4 px-6">Supplier</th>
                  <th className="text-left text-gray-600 text-sm font-semibold py-4 px-6">Items</th>
                  <th className="text-left text-gray-600 text-sm font-semibold py-4 px-6">Total Amount</th>
                  <th className="text-left text-gray-600 text-sm font-semibold py-4 px-6">Status</th>
                  <th className="text-left text-gray-600 text-sm font-semibold py-4 px-6">Created</th>
                  <th className="text-left text-gray-600 text-sm font-semibold py-4 px-6">Action</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-900 font-medium">{po.poNumber}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-700">{po.supplierName}</td>
                    <td className="py-4 px-6 text-gray-700">{po.items.length} items</td>
                    <td className="py-4 px-6 text-gray-900 font-medium">₹{po.total.toLocaleString()}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        po.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                        po.status === 'review' ? 'bg-blue-50 text-blue-700' :
                        po.status === 'approval' ? 'bg-yellow-50 text-yellow-700' :
                        po.status === 'ordered' ? 'bg-purple-50 text-purple-700' :
                        'bg-green-50 text-green-700'
                      }`}>
                        {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600 text-sm">
                      {new Date(po.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      {po.status === 'review' || po.status === 'approval' ? (
                        <button
                          onClick={() => openApprovalView(po)}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Review & Approve
                        </button>
                      ) : (
                        <button className="text-gray-400 cursor-not-allowed">
                          {po.status === 'ordered' ? 'In Transit' : 'Completed'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {purchaseOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      No purchase orders yet. Create your first PO to get started!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create PO View */}
      {viewMode === 'create' && (
        <div className="space-y-6">
          {/* Status Stepper */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <div className="flex items-center justify-between relative">
              {/* Progress Line */}
              <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200 -z-10">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                  style={{ 
                    width: `${(STATUS_STEPS.findIndex(s => s.id === currentStep) / (STATUS_STEPS.length - 1)) * 100}%` 
                  }}
                />
              </div>

              {STATUS_STEPS.map((step, index) => {
                const isActive = step.id === currentStep;
                const isCompleted = STATUS_STEPS.findIndex(s => s.id === currentStep) > index;
                const Icon = step.icon;

                return (
                  <div key={step.id} className="flex flex-col items-center relative">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg' 
                        : isActive 
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-110'
                          : 'bg-gray-100 text-gray-400'
                    }`}>
                      {isCompleted ? <Check className="w-8 h-8" /> : <Icon className="w-8 h-8" />}
                    </div>
                    <div className={`text-sm font-medium ${
                      isActive ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Supplier Selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h4 className="text-gray-900 font-semibold mb-4">Select Supplier</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suppliers.map((supplier) => (
                <button
                  key={supplier.id}
                  onClick={() => setSelectedSupplier(supplier)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedSupplier?.id === supplier.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {supplier.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-gray-900 font-medium">{supplier.name}</div>
                      <div className="text-gray-500 text-xs">{supplier.phone}</div>
                    </div>
                  </div>
                  {selectedSupplier?.id === supplier.id && (
                    <div className="flex items-center space-x-1 text-blue-600 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>Selected</span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {creditWarning && selectedSupplier && (
              <div className={`mt-4 p-4 rounded-xl border-2 flex items-start space-x-3 ${
                creditWarning.type === 'error' 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  creditWarning.type === 'error' ? 'text-red-600' : 'text-yellow-600'
                }`} />
                <div>
                  <div className={`font-medium ${
                    creditWarning.type === 'error' ? 'text-red-900' : 'text-yellow-900'
                  }`}>
                    Credit Limit Warning
                  </div>
                  <div className={`text-sm ${
                    creditWarning.type === 'error' ? 'text-red-700' : 'text-yellow-700'
                  }`}>
                    {creditWarning.message}
                    <br />
                    Available credit: ₹{creditWarning.available.toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Product Search & Add */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h4 className="text-gray-900 font-semibold mb-4">Add Products</h4>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => {
                  setProductSearch(e.target.value);
                  setShowProductSuggestions(true);
                }}
                onFocus={() => setShowProductSuggestions(true)}
                placeholder="Search products by name or part number..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              {/* Auto-suggestions */}
              {showProductSuggestions && productSearch && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-10 max-h-80 overflow-y-auto">
                  {getFilteredProducts().map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addProductToOrder(product)}
                      className="w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-gray-900 font-medium">{product.name}</div>
                          <div className="text-gray-500 text-sm">{product.partNumber || 'No part number'}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            Stock: <span className={`font-medium ${product.quantity < 10 ? 'text-red-600' : 'text-green-600'}`}>
                              {product.quantity}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Last Price: <span className="font-medium text-blue-600">₹{product.price.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                  {getFilteredProducts().length === 0 && (
                    <div className="p-4 text-center text-gray-500">No products found</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* PO Items Table */}
          {poItems.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left text-gray-600 text-sm font-semibold py-4 px-6">Product</th>
                      <th className="text-left text-gray-600 text-sm font-semibold py-4 px-6">Current Stock</th>
                      <th className="text-left text-gray-600 text-sm font-semibold py-4 px-6">Last Price</th>
                      <th className="text-left text-gray-600 text-sm font-semibold py-4 px-6">Quantity</th>
                      <th className="text-left text-gray-600 text-sm font-semibold py-4 px-6">Rate</th>
                      <th className="text-left text-gray-600 text-sm font-semibold py-4 px-6">Total</th>
                      <th className="text-left text-gray-600 text-sm font-semibold py-4 px-6">Remarks</th>
                      <th className="text-left text-gray-600 text-sm font-semibold py-4 px-6">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {poItems.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="py-4 px-6">
                          <div className="text-gray-900 font-medium">{item.productName}</div>
                          <div className="text-gray-500 text-xs">{item.partNumber || 'N/A'}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`text-sm font-medium ${
                            item.currentStock < 10 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {item.currentStock}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-600 text-sm">
                          ₹{item.lastPurchasePrice?.toLocaleString() || 'N/A'}
                        </td>
                        <td className="py-4 px-6">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updatePOItem(item.id, 'quantity', Number(e.target.value))}
                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="1"
                          />
                        </td>
                        <td className="py-4 px-6">
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => updatePOItem(item.id, 'rate', Number(e.target.value))}
                            className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                          />
                        </td>
                        <td className="py-4 px-6 text-gray-900 font-medium">
                          ₹{item.total.toLocaleString()}
                        </td>
                        <td className="py-4 px-6">
                          <input
                            type="text"
                            value={item.remarks || ''}
                            onChange={(e) => updatePOItem(item.id, 'remarks', e.target.value)}
                            placeholder="Optional"
                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => removePOItem(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="bg-gray-50 p-6 border-t border-gray-200">
                <div className="flex justify-end">
                  <div className="w-80 space-y-3">
                    <div className="flex items-center justify-between text-gray-700">
                      <span>Subtotal:</span>
                      <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-700">
                      <span>Tax (13% VAT):</span>
                      <span className="font-medium">₹{tax.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-900 text-lg pt-3 border-t border-gray-300">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold">₹{total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Additional Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attachments */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h4 className="text-gray-900 font-semibold mb-4 flex items-center space-x-2">
                <Paperclip className="w-5 h-5" />
                <span>Attachments</span>
              </h4>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-gray-600 hover:text-blue-600"
              >
                <Upload className="w-8 h-8 mx-auto mb-2" />
                <div className="font-medium">Drop files here or click to upload</div>
                <div className="text-sm">Invoice, quotation, or any relevant documents</div>
              </button>

              {attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{file}</span>
                      </div>
                      <button
                        onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes & Delivery */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h4 className="text-gray-900 font-semibold mb-4">Additional Notes</h4>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special instructions, delivery requirements, etc."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={4}
                />
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h4 className="text-gray-900 font-semibold mb-4">Estimated Delivery</h4>
                <input
                  type="date"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={saveDraft}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
            >
              Save as Draft
            </button>
            <button
              onClick={submitForReview}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-medium shadow-lg hover:shadow-xl transition-all"
            >
              <span>Submit for Review</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Approval View */}
      {viewMode === 'approval' && selectedPO && (
        <div className="space-y-6">
          {/* PO Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-3xl font-bold mb-2">{selectedPO.poNumber}</h3>
                <p className="text-blue-100">Review and approve purchase order</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-100 mb-1">Created</div>
                <div className="text-lg font-semibold">
                  {new Date(selectedPO.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-blue-100">
              <div className="flex items-center space-x-2">
                <Building className="w-5 h-5" />
                <span>{selectedPO.supplierName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>{selectedPO.items.length} items</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Impact Analysis */}
            <div className="lg:col-span-2 space-y-6">
              {/* Estimated Cost */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-semibold text-lg">Estimated Cost</h4>
                    <p className="text-gray-500 text-sm">Complete order breakdown</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Subtotal</span>
                    <span className="text-gray-900 font-semibold text-lg">₹{selectedPO.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Tax (13% VAT)</span>
                    <span className="text-gray-900 font-semibold text-lg">₹{selectedPO.tax.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                    <span className="text-gray-900 font-semibold">Total Amount</span>
                    <span className="text-blue-600 font-bold text-2xl">₹{selectedPO.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Cashflow Impact */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    getCashflowImpact(selectedPO.total).status === 'safe' ? 'bg-green-100' :
                    getCashflowImpact(selectedPO.total).status === 'caution' ? 'bg-yellow-100' :
                    'bg-red-100'
                  }`}>
                    <TrendingDown className={`w-6 h-6 ${
                      getCashflowImpact(selectedPO.total).status === 'safe' ? 'text-green-600' :
                      getCashflowImpact(selectedPO.total).status === 'caution' ? 'text-yellow-600' :
                      'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-semibold text-lg">Impact on Current Cashflow</h4>
                    <p className="text-gray-500 text-sm">Financial analysis</p>
                  </div>
                </div>
                {(() => {
                  const impact = getCashflowImpact(selectedPO.total);
                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg text-center">
                          <div className="text-sm text-blue-600 mb-1">Current Cash</div>
                          <div className="text-xl font-bold text-blue-900">₹{impact.currentCash.toLocaleString()}</div>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg text-center">
                          <div className="text-sm text-purple-600 mb-1">After Purchase</div>
                          <div className="text-xl font-bold text-purple-900">₹{impact.afterPurchase.toLocaleString()}</div>
                        </div>
                        <div className={`p-4 rounded-lg text-center ${
                          impact.status === 'safe' ? 'bg-green-50' :
                          impact.status === 'caution' ? 'bg-yellow-50' :
                          'bg-red-50'
                        }`}>
                          <div className={`text-sm mb-1 ${
                            impact.status === 'safe' ? 'text-green-600' :
                            impact.status === 'caution' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>Impact</div>
                          <div className={`text-xl font-bold ${
                            impact.status === 'safe' ? 'text-green-900' :
                            impact.status === 'caution' ? 'text-yellow-900' :
                            'text-red-900'
                          }`}>{impact.impactPercentage}%</div>
                        </div>
                      </div>
                      <div className={`p-4 rounded-lg flex items-center space-x-3 ${
                        impact.status === 'safe' ? 'bg-green-50 border border-green-200' :
                        impact.status === 'caution' ? 'bg-yellow-50 border border-yellow-200' :
                        'bg-red-50 border border-red-200'
                      }`}>
                        {impact.status === 'safe' ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-green-900 font-medium">Cashflow remains healthy</span>
                          </>
                        ) : impact.status === 'caution' ? (
                          <>
                            <AlertTriangle className="w-5 h-5 text-yellow-600" />
                            <span className="text-yellow-900 font-medium">Monitor cashflow carefully</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <span className="text-red-900 font-medium">Critical cashflow impact</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Stock Simulation */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-semibold text-lg">Stock After Arrival</h4>
                    <p className="text-gray-500 text-sm">Projected inventory levels</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {getStockSimulation(selectedPO).map((item) => (
                    <div key={item.id} className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-gray-900 font-medium">{item.productName}</div>
                        <div className="flex items-center space-x-2 text-green-600">
                          <TrendingUp className="w-4 h-4" />
                          <span className="font-semibold">+{item.percentIncrease}%</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <div>
                          <span className="text-gray-500">Current: </span>
                          <span className="text-gray-900 font-medium">{item.currentStock}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <div>
                          <span className="text-gray-500">After: </span>
                          <span className="text-purple-600 font-bold">{item.afterStock}</span>
                        </div>
                        <div className="text-gray-500">
                          (+{item.quantity})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Approval Action */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 shadow-sm sticky top-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <ClipboardCheck className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="text-gray-900 font-semibold text-xl mb-2">Ready for Approval</h4>
                  <p className="text-gray-600 text-sm">Review the analysis and approve this purchase order</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm">All items verified</span>
                  </div>
                  <div className="flex items-center space-x-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm">Supplier confirmed</span>
                  </div>
                  <div className="flex items-center space-x-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm">Pricing validated</span>
                  </div>
                  <div className="flex items-center space-x-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm">Cashflow acceptable</span>
                  </div>
                </div>

                <button
                  onClick={() => approvePO(selectedPO)}
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="w-6 h-6" />
                    <span>Approve Purchase Order</span>
                  </div>
                </button>

                <button
                  onClick={() => setViewMode('list')}
                  className="w-full mt-3 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                >
                  Review Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Animation Overlay */}
      {showApprovalAnimation && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-12 shadow-2xl transform scale-110">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-bounce">
                <CheckCircle className="w-20 h-20 text-white animate-pulse" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Approved!</h3>
              <p className="text-gray-600">Purchase order has been successfully approved</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
