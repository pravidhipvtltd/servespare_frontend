import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Plus, Printer, Download, Eye, Check, Trash2, Calendar,
  User, Phone, MapPin, Hash, ShoppingCart, FileText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getFromStorage, saveToStorage } from '../utils/mockData';
import { Bill, BillItem } from '../types';

interface ProfessionalBillSystemProps {
  onBillComplete?: (bill: Bill) => void;
}

export const ProfessionalBillSystem: React.FC<ProfessionalBillSystemProps> = ({ onBillComplete }) => {
  const { currentUser } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);

  // Customer Info
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [panVatNumber, setPanVatNumber] = useState('');
  const [address, setAddress] = useState('');

  // Items
  const [items, setItems] = useState<BillItem[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);

  // New Item Form
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');

  // Preview
  const [showPreview, setShowPreview] = useState(false);

  const addItem = () => {
    if (!itemName || !itemPrice) return;

    const newItem: BillItem = {
      itemId: `item_${Date.now()}`,
      itemName,
      quantity: parseInt(itemQuantity) || 1,
      price: parseFloat(itemPrice),
      total: (parseInt(itemQuantity) || 1) * parseFloat(itemPrice),
    };

    setItems([...items, newItem]);
    setItemName('');
    setItemPrice('');
    setItemQuantity('1');
    setShowAddItem(false);
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.itemId !== itemId));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.13; // 13% VAT
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const { subtotal, tax, total } = calculateTotals();

  const confirmInvoice = () => {
    if (items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    const bill: Bill = {
      id: `bill_${Date.now()}`,
      billNumber: `INV-${Date.now()}`,
      date: new Date().toISOString(),
      customerName: customerName || 'Walk-in Customer',
      customerPhone: contactNumber || '',
      customerType: 'retail',
      items,
      subtotal,
      tax,
      total,
      paymentMethod: 'cash',
      paymentStatus: 'paid',
      createdBy: currentUser?.name || '',
      workspaceId: currentUser?.workspaceId || '',
      status: 'completed',
      panVatNumber,
      address,
    };

    // Save bill
    const allBills = getFromStorage('bills', []);
    allBills.push(bill);
    saveToStorage('bills', allBills);

    if (onBillComplete) {
      onBillComplete(bill);
    }

    // Reset form
    setCustomerName('');
    setContactNumber('');
    setPanVatNumber('');
    setAddress('');
    setItems([]);

    alert('Invoice created successfully!');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const printContent = document.getElementById('invoice-preview')?.innerHTML;
    if (!printContent) return;

    const newWindow = window.open('', '', 'width=800,height=600');
    if (!newWindow) return;

    newWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${customerName || 'Walk-in Customer'}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .invoice-container { max-width: 800px; margin: 0 auto; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f8f9fa; font-weight: 600; }
            .text-right { text-align: right; }
            .total-row { font-weight: bold; font-size: 1.1em; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);

    newWindow.document.close();
    setTimeout(() => {
      newWindow.print();
      newWindow.close();
    }, 250);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Bill</h1>
        <p className="text-gray-600">Generate professional invoices for your customers</p>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        
        {/* Customer Information */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contact Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.startsWith("+977")) {
                      if (value.length <= 14) {
                        setContactNumber(value);
                      }
                    } else if (value.length <= 10) {
                      setContactNumber(value);
                    }
                  }}
                  maxLength={14}
                  placeholder="+977-XXXXXXXXXX"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                PAN/VAT Number
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={panVatNumber}
                  onChange={(e) => setPanVatNumber(e.target.value)}
                  placeholder="Enter PAN/VAT number"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter address"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Items</h2>
            <button
              onClick={() => setShowAddItem(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Item</span>
            </button>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">S.N</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Item Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rate</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Quantity</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No items added yet</p>
                      <p className="text-sm">Click "Add Item" to get started</p>
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={item.itemId} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">{index + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.itemName}</td>
                      <td className="px-4 py-3 text-sm text-green-600 font-semibold">NPR {item.price.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">NPR {item.total.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => removeItem(item.itemId)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total Summary */}
        {items.length > 0 && (
          <div className="mb-8 bg-gray-50 rounded-lg p-6">
            <div className="max-w-md ml-auto space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span className="font-semibold">NPR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>VAT (13%):</span>
                <span className="font-semibold">NPR {tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t-2 border-gray-300">
                <span>Total Amount:</span>
                <span>NPR {total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowPreview(true)}
            disabled={items.length === 0}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Eye className="w-5 h-5" />
            <span>Preview & Print</span>
          </button>

          <button
            onClick={confirmInvoice}
            disabled={items.length === 0 || !customerName}
            className="flex items-center space-x-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-5 h-5" />
            <span>Confirm Invoice</span>
          </button>
        </div>
      </div>

      {/* Add Item Modal */}
      <AnimatePresence>
        {showAddItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddItem(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Add Item</h3>
                <button
                  onClick={() => setShowAddItem(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g., Brake Pads"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Rate <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(e.target.value)}
                      placeholder="0"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(e.target.value)}
                      placeholder="1"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-900">
                    <strong>Total:</strong> NPR {((parseFloat(itemPrice) || 0) * (parseInt(itemQuantity) || 1)).toLocaleString()}
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowAddItem(false)}
                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addItem}
                    disabled={!itemName || !itemPrice}
                    className="flex-1 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Item
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Preview Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Invoice Preview</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleDownload}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print</span>
                  </button>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Preview Content */}
              <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
                <div id="invoice-preview" className="bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
                  {/* Invoice Header */}
                  <div className="border-b-4 border-orange-500 pb-6 mb-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
                        <p className="text-gray-600">Serve Spares - Inventory System</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Invoice No.</p>
                        <p className="text-lg font-bold text-gray-900">INV-{Date.now()}</p>
                        <p className="text-sm text-gray-600 mt-2">Date</p>
                        <p className="font-semibold text-gray-900">{new Date().toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-gray-700 mb-3">BILL TO:</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <p className="font-bold text-gray-900">{customerName || 'Walk-in Customer'}</p>
                      {contactNumber && <p className="text-gray-700">Phone: {contactNumber}</p>}
                      {panVatNumber && <p className="text-gray-700">PAN/VAT: {panVatNumber}</p>}
                      {address && <p className="text-gray-700">Address: {address}</p>}
                    </div>
                  </div>

                  {/* Items Table */}
                  <table className="w-full mb-6">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th className="text-left py-3 text-sm font-bold text-gray-700">S.N</th>
                        <th className="text-left py-3 text-sm font-bold text-gray-700">ITEM</th>
                        <th className="text-right py-3 text-sm font-bold text-gray-700">RATE</th>
                        <th className="text-right py-3 text-sm font-bold text-gray-700">QTY</th>
                        <th className="text-right py-3 text-sm font-bold text-gray-700">AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={item.itemId} className="border-b border-gray-200">
                          <td className="py-3 text-gray-700">{index + 1}</td>
                          <td className="py-3 font-medium text-gray-900">{item.itemName}</td>
                          <td className="py-3 text-right text-gray-700">NPR {item.price.toLocaleString()}</td>
                          <td className="py-3 text-right text-gray-700">{item.quantity}</td>
                          <td className="py-3 text-right font-semibold text-gray-900">NPR {item.total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Totals */}
                  <div className="flex justify-end mb-6">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between text-gray-700">
                        <span>Subtotal:</span>
                        <span className="font-semibold">NPR {subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>VAT (13%):</span>
                        <span className="font-semibold">NPR {tax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t-2 border-gray-300">
                        <span>TOTAL:</span>
                        <span>NPR {total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="border-t-2 border-gray-200 pt-6 text-center">
                    <p className="text-sm text-gray-600 mb-2">Thank you for your business!</p>
                    <p className="text-xs text-gray-500">This is a computer-generated invoice and does not require a signature.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfessionalBillSystem;
