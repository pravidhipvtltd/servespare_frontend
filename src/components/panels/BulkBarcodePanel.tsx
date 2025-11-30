import React, { useState, useRef } from 'react';
import {
  Scan, Upload, Plus, AlertCircle, CheckCircle, X, Search, Package,
  Download, FileText, BarChart3, Trash2, Edit, Shield, Users, Box
} from 'lucide-react';
import { InventoryItem, Party } from '../../types';
import { getFromStorage, saveToStorage } from '../../utils/mockData';
import { useAuth } from '../../contexts/AuthContext';

interface ScannedItem {
  barcode: string;
  status: 'pending' | 'found' | 'not_found' | 'added';
  item?: InventoryItem;
  error?: string;
  supplier?: Party;
}

interface GroupedBySupplier {
  [supplierId: string]: {
    supplier: Party;
    items: ScannedItem[];
  };
}

export const BulkBarcodePanel: React.FC = () => {
  const { currentUser } = useAuth();
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [searchResults, setSearchResults] = useState<InventoryItem[]>([]);
  const [showSupplierView, setShowSupplierView] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Load inventory and parties from storage
  const loadInventory = (): InventoryItem[] => {
    return getFromStorage('inventory', []).filter(
      (item: InventoryItem) => item.workspaceId === currentUser?.workspaceId
    );
  };

  const loadParties = (): Party[] => {
    return getFromStorage('parties', []).filter(
      (party: Party) => party.workspaceId === currentUser?.workspaceId && party.type === 'supplier'
    );
  };

  // Search for item by barcode
  const findItemByBarcode = (barcode: string): InventoryItem | undefined => {
    const inventory = loadInventory();
    return inventory.find(item => 
      item.barcode?.toLowerCase() === barcode.toLowerCase() ||
      item.partNumber?.toLowerCase() === barcode.toLowerCase()
    );
  };

  // Get supplier for item
  const getSupplierForItem = (item: InventoryItem): Party | undefined => {
    if (!item.partyId) return undefined;
    const parties = loadParties();
    return parties.find(p => p.id === item.partyId);
  };

  // Handle single barcode scan
  const handleBarcodeScan = () => {
    const barcode = barcodeInput.trim();
    if (!barcode) return;

    // Check if already scanned
    if (scannedItems.some(si => si.barcode === barcode)) {
      alert('⚠️ This barcode has already been scanned!');
      setBarcodeInput('');
      return;
    }

    const item = findItemByBarcode(barcode);
    const scannedItem: ScannedItem = {
      barcode,
      status: item ? 'found' : 'not_found',
      item,
      supplier: item ? getSupplierForItem(item) : undefined,
      error: item ? undefined : 'Item not found in inventory'
    };

    setScannedItems(prev => [scannedItem, ...prev]);
    setBarcodeInput('');
    
    // Auto-focus back to input for continuous scanning
    setTimeout(() => barcodeInputRef.current?.focus(), 100);
  };

  // Handle CSV file upload
  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      // Skip header if exists
      const startIndex = lines[0].toLowerCase().includes('barcode') ? 1 : 0;
      const barcodes = lines.slice(startIndex).map(line => {
        // Handle CSV with commas or simple line-by-line
        const parts = line.split(',');
        return parts[0].trim();
      }).filter(b => b);

      // Process all barcodes
      const newScannedItems: ScannedItem[] = barcodes.map(barcode => {
        const item = findItemByBarcode(barcode);
        return {
          barcode,
          status: item ? 'found' : 'not_found',
          item,
          supplier: item ? getSupplierForItem(item) : undefined,
          error: item ? undefined : 'Item not found in inventory'
        };
      });

      setScannedItems(prev => [...newScannedItems, ...prev]);
      
      // Show summary
      const found = newScannedItems.filter(si => si.status === 'found').length;
      const notFound = newScannedItems.filter(si => si.status === 'not_found').length;
      alert(`📊 CSV Import Complete!\n\n✅ Found: ${found} items\n❌ Not Found: ${notFound} items`);
    };

    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  };

  // Handle bulk add to inventory (for new items)
  const handleBulkAdd = () => {
    const notFoundItems = scannedItems.filter(si => si.status === 'not_found');
    
    if (notFoundItems.length === 0) {
      alert('ℹ️ No new items to add. All scanned barcodes already exist in inventory.');
      return;
    }

    if (!confirm(`Do you want to create ${notFoundItems.length} new inventory items from the not-found barcodes?`)) {
      return;
    }

    const inventory = loadInventory();
    const newItems: InventoryItem[] = notFoundItems.map(si => ({
      id: `inv${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `New Item - ${si.barcode}`,
      category: 'local' as const,
      vehicleType: 'two_wheeler' as const,
      quantity: 0,
      minStockLevel: 5,
      price: 0,
      mrp: 0,
      barcode: si.barcode,
      partNumber: si.barcode,
      hsnCode: '',
      workspaceId: currentUser?.workspaceId,
      createdAt: new Date().toISOString()
    }));

    saveToStorage('inventory', [...inventory, ...newItems]);
    
    // Update scanned items status
    setScannedItems(prev => prev.map(si => 
      si.status === 'not_found' 
        ? { ...si, status: 'added' as const, item: newItems.find(ni => ni.barcode === si.barcode) }
        : si
    ));

    alert(`✅ Successfully added ${newItems.length} new items to inventory!\n\nPlease update their details (name, price, etc.) in the Inventory panel.`);
  };

  // Clear all scanned items
  const handleClearAll = () => {
    if (scannedItems.length === 0) return;
    if (confirm('Are you sure you want to clear all scanned items?')) {
      setScannedItems([]);
    }
  };

  // Remove single scanned item
  const handleRemoveItem = (barcode: string) => {
    setScannedItems(prev => prev.filter(si => si.barcode !== barcode));
  };

  // Download CSV template
  const handleDownloadTemplate = () => {
    const csv = 'Barcode\n1234567890\n0987654321\nABC123XYZ';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'barcode_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download scanned results
  const handleDownloadResults = () => {
    const csv = [
      'Barcode,Part Number,HSN Code,Name,Supplier,Status,Stock,Price',
      ...scannedItems.map(si => 
        `${si.barcode},${si.item?.partNumber || 'N/A'},${si.item?.hsnCode || 'N/A'},${si.item?.name || 'Not Found'},${si.supplier?.name || 'N/A'},${si.status},${si.item?.quantity || 0},${si.item?.price || 0}`
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scanned_items_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Group items by supplier
  const groupedBySupplier = (): GroupedBySupplier => {
    const grouped: GroupedBySupplier = {};
    
    scannedItems.forEach(si => {
      if (si.item && si.supplier) {
        const supplierId = si.supplier.id;
        if (!grouped[supplierId]) {
          grouped[supplierId] = {
            supplier: si.supplier,
            items: []
          };
        }
        grouped[supplierId].items.push(si);
      }
    });

    return grouped;
  };

  // Statistics
  const stats = {
    total: scannedItems.length,
    found: scannedItems.filter(si => si.status === 'found' || si.status === 'added').length,
    notFound: scannedItems.filter(si => si.status === 'not_found').length,
    added: scannedItems.filter(si => si.status === 'added').length
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Scan className="w-6 h-6 text-white" />
            </div>
            <span>Bulk Barcode Scanner</span>
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Scan multiple barcodes or upload CSV for bulk processing
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSupplierView(!showSupplierView)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              showSupplierView
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Supplier View
          </button>
        </div>
      </div>

      {/* Scanning Input Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <Scan className="w-5 h-5 text-blue-600" />
          <h3 className="text-gray-900 font-semibold">Scan Barcodes</h3>
        </div>

        {/* Barcode Input */}
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              ref={barcodeInputRef}
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleBarcodeScan()}
              placeholder="Scan or enter barcode/part number..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <Scan className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
          </div>
          <button
            onClick={handleBarcodeScan}
            disabled={!barcodeInput.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            Add
          </button>
        </div>

        {/* CSV Upload */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
          <div className="flex items-center space-x-3">
            <Upload className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-gray-900 font-medium">Bulk Upload via CSV</p>
              <p className="text-gray-600 text-sm">Upload a CSV file with barcodes</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadTemplate}
              className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 border border-purple-200 font-medium transition-colors text-sm"
            >
              <Download className="w-4 h-4 inline mr-1" />
              Template
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
            >
              <Upload className="w-4 h-4 inline mr-1" />
              Upload CSV
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Statistics */}
      {scannedItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Scanned</p>
                <p className="text-gray-900 font-bold mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Scan className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Found in Inventory</p>
                <p className="text-green-600 font-bold mt-1">{stats.found}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Not Found</p>
                <p className="text-red-600 font-bold mt-1">{stats.notFound}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Newly Added</p>
                <p className="text-purple-600 font-bold mt-1">{stats.added}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Plus className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {scannedItems.length > 0 && (
        <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBulkAdd}
              disabled={stats.notFound === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Add {stats.notFound} New Items
            </button>
            <button
              onClick={handleDownloadResults}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              <Download className="w-4 h-4 inline mr-1" />
              Export Results
            </button>
          </div>
          <button
            onClick={handleClearAll}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4 inline mr-1" />
            Clear All
          </button>
        </div>
      )}

      {/* Results Display */}
      {scannedItems.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200">
          {!showSupplierView ? (
            // List View
            <div className="divide-y divide-gray-200">
              <div className="p-4 bg-gray-50 flex items-center justify-between">
                <h3 className="text-gray-900 font-semibold">Scanned Items ({scannedItems.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Barcode
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Part Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        HSN Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Supplier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {scannedItems.map((si, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {si.status === 'found' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Found
                            </span>
                          )}
                          {si.status === 'not_found' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Not Found
                            </span>
                          )}
                          {si.status === 'added' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                              <Plus className="w-3 h-3 mr-1" />
                              Added
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-900 font-medium font-mono text-sm">
                            {si.barcode}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-700 font-mono text-sm">
                            {si.item?.partNumber || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-700 font-mono text-sm">
                            {si.item?.hsnCode || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-900">
                            {si.item?.name || <span className="text-red-600">Item not found</span>}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {si.supplier ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              <Users className="w-3 h-3 mr-1" />
                              {si.supplier.name}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {si.item && (
                            <span className={`font-medium ${
                              si.item.quantity <= si.item.minStockLevel
                                ? 'text-red-600'
                                : 'text-green-600'
                            }`}>
                              {si.item.quantity}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {si.item && (
                            <span className="text-gray-900 font-medium">
                              NPR {si.item.price.toFixed(2)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleRemoveItem(si.barcode)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                            title="Remove"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            // Supplier View
            <div className="divide-y divide-gray-200">
              <div className="p-4 bg-gray-50">
                <h3 className="text-gray-900 font-semibold">Items Grouped by Supplier</h3>
              </div>
              <div className="p-6 space-y-6">
                {Object.entries(groupedBySupplier()).map(([supplierId, group]) => (
                  <div key={supplierId} className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 p-5">
                    {/* Supplier Header */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-blue-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-gray-900 font-bold">{group.supplier.name}</h4>
                          <p className="text-gray-600 text-sm">
                            {group.supplier.phone} • {group.supplier.city}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-500 text-sm">Items from this supplier</p>
                        <p className="text-blue-600 font-bold">{group.items.length}</p>
                      </div>
                    </div>

                    {/* Items from this supplier */}
                    <div className="space-y-2">
                      {group.items.map((si, idx) => (
                        <div
                          key={idx}
                          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 grid grid-cols-5 gap-4">
                              <div>
                                <p className="text-gray-500 text-xs mb-1">Barcode</p>
                                <p className="text-gray-900 font-mono text-sm font-medium">
                                  {si.barcode}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-xs mb-1">Part Number</p>
                                <p className="text-gray-900 font-mono text-sm font-medium">
                                  {si.item?.partNumber || '-'}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-xs mb-1">HSN Code</p>
                                <p className="text-gray-900 font-mono text-sm font-medium">
                                  {si.item?.hsnCode || '-'}
                                </p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-gray-500 text-xs mb-1">Item Name</p>
                                <p className="text-gray-900 font-medium truncate">
                                  {si.item?.name}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 ml-4">
                              <div className="text-right">
                                <p className="text-gray-500 text-xs">Stock</p>
                                <p className="text-green-600 font-bold">{si.item?.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-gray-500 text-xs">Price</p>
                                <p className="text-gray-900 font-bold">NPR {si.item?.price.toFixed(2)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Items without supplier */}
                {scannedItems.filter(si => !si.supplier && si.item).length > 0 && (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-2 border-gray-300 p-5">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-300">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                          <Box className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-gray-900 font-bold">No Supplier Assigned</h4>
                          <p className="text-gray-600 text-sm">Items without supplier information</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-500 text-sm">Items</p>
                        <p className="text-gray-600 font-bold">
                          {scannedItems.filter(si => !si.supplier && si.item).length}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {scannedItems
                        .filter(si => !si.supplier && si.item)
                        .map((si, idx) => (
                          <div
                            key={idx}
                            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 grid grid-cols-5 gap-4">
                                <div>
                                  <p className="text-gray-500 text-xs mb-1">Barcode</p>
                                  <p className="text-gray-900 font-mono text-sm font-medium">
                                    {si.barcode}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500 text-xs mb-1">Part Number</p>
                                  <p className="text-gray-900 font-mono text-sm font-medium">
                                    {si.item?.partNumber || '-'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500 text-xs mb-1">HSN Code</p>
                                  <p className="text-gray-900 font-mono text-sm font-medium">
                                    {si.item?.hsnCode || '-'}
                                  </p>
                                </div>
                                <div className="col-span-2">
                                  <p className="text-gray-500 text-xs mb-1">Item Name</p>
                                  <p className="text-gray-900 font-medium truncate">
                                    {si.item?.name}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4 ml-4">
                                <div className="text-right">
                                  <p className="text-gray-500 text-xs">Stock</p>
                                  <p className="text-green-600 font-bold">{si.item?.quantity}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-gray-500 text-xs">Price</p>
                                  <p className="text-gray-900 font-bold">NPR {si.item?.price.toFixed(2)}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {scannedItems.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Scan className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-gray-900 font-semibold mb-2">No Items Scanned Yet</h3>
          <p className="text-gray-500 mb-6">
            Start scanning barcodes or upload a CSV file to begin bulk processing
          </p>
          <div className="flex items-center justify-center space-x-3">
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <p className="text-blue-600 text-sm font-medium">💡 Tip: Press Enter after typing to add items quickly</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
