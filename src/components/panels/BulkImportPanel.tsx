import React, { useState } from 'react';
import { Upload, Download, FileSpreadsheet, Copy, Plus, CheckCircle, XCircle, AlertTriangle, RefreshCw, File, Table, List } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getFromStorage, saveToStorage } from '../../utils/mockData';
import { InventoryItem, VehicleType, ItemCategory } from '../../types';

type ImportMethod = 'csv' | 'excel' | 'paste' | 'quick';

interface BulkItem {
  name: string;
  partNumber: string;
  category: ItemCategory;
  vehicleType: VehicleType;
  vehicleName?: string;
  bikeModel?: string;
  bikeType?: string;
  hsnCode?: string;
  quantity: number;
  minStockLevel: number;
  price: number;
  mrp: number;
  retailPrice?: number;
  wholesalePrice?: number;
  distributorPrice?: number;
  partyName?: string; // Changed from partyId to partyName
  barcode?: string;
  location?: string;
  warrantyPeriod?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export const BulkImportPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const [importMethod, setImportMethod] = useState<ImportMethod>('csv');
  const [bulkItems, setBulkItems] = useState<BulkItem[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [pasteText, setPasteText] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Quick entry form state
  const [quickEntryRows, setQuickEntryRows] = useState<BulkItem[]>([
    createEmptyItem(),
    createEmptyItem(),
    createEmptyItem(),
  ]);

  function createEmptyItem(): BulkItem {
    return {
      name: '',
      partNumber: '',
      category: 'local',
      vehicleType: 'two_wheeler',
      vehicleName: '',
      bikeModel: '',
      bikeType: '',
      hsnCode: '',
      quantity: 0,
      minStockLevel: 5,
      price: 0,
      mrp: 0,
      retailPrice: 0,
      wholesalePrice: 0,
      distributorPrice: 0,
      partyName: '',
      barcode: '',
      location: 'Main Warehouse',
      warrantyPeriod: '',
    };
  }

  const downloadTemplate = (format: 'csv' | 'excel') => {
    const headers = [
      'Item Name*',
      'Part Number*',
      'Category* (local/original)',
      'Vehicle Type* (two_wheeler/four_wheeler)',
      'Vehicle Name',
      'Bike Model',
      'Bike Type',
      'HSN Code',
      'Quantity*',
      'Min Stock Level*',
      'Price*',
      'MRP*',
      'Retail Price',
      'Wholesale Price',
      'Distributor Price',
      'Supplier/Party Name',
      'Barcode',
      'Location',
      'Warranty Period (months)'
    ];

    const sampleData = [
      'Brake Pad - Premium Quality',
      'BP-001',
      'local',
      'two_wheeler',
      'Hero Splendor',
      'Splendor Plus',
      'Commuter',
      '8708',
      '50',
      '10',
      '150',
      '250',
      '200',
      '180',
      '160',
      '',
      'BP001',
      'Main Warehouse - Shelf A-12',
      '6'
    ];

    if (format === 'csv') {
      const csv = [
        headers.join(','),
        sampleData.join(','),
        ',,,,,,,,,,,,,,,,,', // Empty row for user to fill
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'inventory_import_template.csv';
      a.click();
    } else {
      // For Excel, we'll create a tab-separated format that Excel can open
      const tsv = [
        headers.join('\t'),
        sampleData.join('\t'),
        '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t',
      ].join('\n');

      const blob = new Blob([tsv], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'inventory_import_template.xls';
      a.click();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseImportedData(text);
    };
    reader.readAsText(file);
  };

  const parseImportedData = (text: string) => {
    // Try to detect delimiter - could be comma, tab, or pipe
    const firstLine = text.split('\n')[0];
    let delimiter = ',';
    
    if (firstLine.includes('\t')) {
      delimiter = '\t';
    } else if (firstLine.includes('|')) {
      delimiter = '|';
    }
    
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      alert('File is empty or invalid');
      return;
    }

    // Parse headers - normalize them for flexible matching
    const rawHeaders = lines[0].split(delimiter).map(h => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
    console.log('Detected headers:', rawHeaders);
    console.log('Original headers:', lines[0].split(delimiter));
    
    const items: BulkItem[] = [];

    // Enhanced flexible column finder with multiple possible name variations
    const findColumnIndex = (possibleNames: string[]) => {
      for (const name of possibleNames) {
        const index = rawHeaders.findIndex(h => {
          // Exact match
          if (h === name) return true;
          // Contains match
          if (h.includes(name) || name.includes(h)) return true;
          // Partial match with at least 4 characters
          if (name.length >= 4 && h.length >= 4 && (h.includes(name.slice(0, 4)) || name.includes(h.slice(0, 4)))) return true;
          return false;
        });
        if (index !== -1) return index;
      }
      return -1;
    };

    // Comprehensive column mapping with all possible field name variations
    const columnMap = {
      name: findColumnIndex(['name', 'itemname', 'partname', 'item', 'product', 'description', 'itemdescription']),
      partNumber: findColumnIndex(['partnumber', 'partnumb', 'number', 'code', 'sku', 'partno', 'itemcode', 'productcode']),
      category: findColumnIndex(['category', 'cat', 'type', 'itemtype', 'categorytype']),
      vehicleType: findColumnIndex(['vehicletype', 'vehicle', 'vtype', 'vehiclecat', 'vehiclecategory', '2w4w', 'wheeler']),
      vehicleName: findColumnIndex(['vehiclename', 'model', 'bikebrand']),
      bikeModel: findColumnIndex(['bikemodel', 'model', 'modelno', 'modelnumber', 'variant']),
      bikeType: findColumnIndex(['biketype', 'vtype', 'vehicletype', 'segment']),
      hsnCode: findColumnIndex(['hsncode', 'hsn', 'hscode', 'hsnno', 'hsnnumber', 'taxcode']),
      quantity: findColumnIndex(['quantity', 'qty', 'stock', 'qnty', 'instock', 'currentstock', 'availableqty']),
      minStockLevel: findColumnIndex(['minstocklevel', 'min', 'minqty', 'minstock', 'reorder', 'reorderpoint', 'minimumlevel']),
      price: findColumnIndex(['price', 'costprice', 'cp', 'buyprice', 'purchase', 'cost', 'baseprice', 'unitprice']),
      mrp: findColumnIndex(['mrp', 'retail', 'maximum', 'maxretailprice', 'retailprice', 'maxprice']),
      retailPrice: findColumnIndex(['retailprice', 'retail', 'rp', 'sellingprice', 'saleprice']),
      wholesalePrice: findColumnIndex(['wholesaleprice', 'wholesale', 'wp', 'tradeprice', 'dealerprice']),
      distributorPrice: findColumnIndex(['distributorprice', 'distributor', 'dp', 'distprice', 'bulkprice']),
      partyName: findColumnIndex(['partyname', 'suppliername', 'vendorname', 'supplier', 'vendor', 'party', 'suppliername']),
      barcode: findColumnIndex(['barcode', 'code', 'ean', 'upc', 'barcodeno', 'itembarcode']),
      location: findColumnIndex(['location', 'warehouse', 'place', 'storage', 'storagelocation', 'shelf', 'bin', 'rack']),
      warrantyPeriod: findColumnIndex(['warrantyperiod', 'warranty', 'warr', 'guaranteeperiod', 'warrantytime', 'warrantymonths']),
    };

    console.log('Column mapping:', columnMap);
    console.log('Columns found:', Object.entries(columnMap).filter(([key, value]) => value !== -1).map(([key]) => key));
    console.log('Columns NOT found:', Object.entries(columnMap).filter(([key, value]) => value === -1).map(([key]) => key));

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(delimiter).map(v => v.trim());
      
      // Skip completely empty rows
      if (values.every(v => !v)) continue;

      // Helper to safely get value with smart empty/null handling
      const getValue = (index: number, defaultValue: any = ''): any => {
        if (index === -1) return defaultValue; // Column doesn't exist
        const value = values[index];
        if (value === undefined || value === null || value === '' || value.toLowerCase() === 'null' || value === '-') {
          return defaultValue;
        }
        return value;
      };

      // Helper to parse number with smart null handling
      const parseNumber = (value: string, defaultValue: number | undefined = undefined): number | undefined => {
        if (!value || value === '' || value.toLowerCase() === 'null' || value === '-') return defaultValue;
        // Remove currency symbols, commas, and other non-numeric characters except dots
        const cleaned = value.toString().replace(/[^0-9.-]/g, '');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? defaultValue : parsed;
      };

      // Smart category detection (handles various formats)
      const detectCategory = (value: string): ItemCategory => {
        if (!value) return 'local';
        const v = value.toLowerCase().trim();
        if (v.includes('orig') || v.includes('genuine') || v.includes('oem') || v === 'o') return 'original';
        if (v.includes('local') || v.includes('aftermarket') || v === 'l') return 'local';
        return 'local'; // Default to local
      };

      // Smart vehicle type detection (handles various formats)
      const detectVehicleType = (value: string): VehicleType => {
        if (!value) return 'two_wheeler';
        const v = value.toLowerCase().trim();
        if (v.includes('4') || v.includes('four') || v.includes('car') || v === '4w') return 'four_wheeler';
        if (v.includes('2') || v.includes('two') || v.includes('bike') || v.includes('motorcycle') || v === '2w') return 'two_wheeler';
        return 'two_wheeler'; // Default to two-wheeler
      };

      const item: BulkItem = {
        name: getValue(columnMap.name) || `Item ${i}`, // Required: generate name if missing
        partNumber: getValue(columnMap.partNumber) || `AUTO-${Date.now()}-${i}`, // Required: auto-generate if missing
        category: detectCategory(getValue(columnMap.category)),
        vehicleType: detectVehicleType(getValue(columnMap.vehicleType)),
        vehicleName: getValue(columnMap.vehicleName) || undefined,
        bikeModel: getValue(columnMap.bikeModel) || undefined,
        bikeType: getValue(columnMap.bikeType) || undefined,
        hsnCode: getValue(columnMap.hsnCode) || undefined,
        quantity: parseNumber(getValue(columnMap.quantity, '0')) || 0,
        minStockLevel: parseNumber(getValue(columnMap.minStockLevel, '5')) || 5,
        price: parseNumber(getValue(columnMap.price, '0')) || 0,
        mrp: parseNumber(getValue(columnMap.mrp, '0')) || 0,
        retailPrice: parseNumber(getValue(columnMap.retailPrice)) || undefined,
        wholesalePrice: parseNumber(getValue(columnMap.wholesalePrice)) || undefined,
        distributorPrice: parseNumber(getValue(columnMap.distributorPrice)) || undefined,
        partyName: getValue(columnMap.partyName) || undefined,
        barcode: getValue(columnMap.barcode) || undefined,
        location: getValue(columnMap.location) || 'Main Warehouse',
        warrantyPeriod: getValue(columnMap.warrantyPeriod) || undefined,
      };

      // Only add items with at least a name (even if auto-generated)
      if (item.name && item.name.trim() !== '') {
        items.push(item);
      }
    }

    console.log('Parsed items:', items);
    console.log(`Successfully parsed ${items.length} items from ${lines.length - 1} rows`);

    if (items.length === 0) {
      alert('No valid items found in the file. Please check the format.');
      return;
    }

    setBulkItems(items);
    validateItems(items);
    setShowPreview(true);
  };

  const parseCSV = (text: string) => {
    // Redirect to the new unified parser
    parseImportedData(text);
  };

  const handlePaste = () => {
    if (!pasteText.trim()) {
      alert('Please paste your data first');
      return;
    }

    parseCSV(pasteText);
    setShowPreview(true);
  };

  const validateItems = (items: BulkItem[]) => {
    const errors: ValidationError[] = [];

    items.forEach((item, index) => {
      const rowNum = index + 1;

      if (!item.name) {
        errors.push({ row: rowNum, field: 'Item Name', message: 'Item Name is required' });
      }
      if (!item.partNumber) {
        errors.push({ row: rowNum, field: 'Part Number', message: 'Part Number is required' });
      }
      if (item.quantity < 0) {
        errors.push({ row: rowNum, field: 'Quantity', message: 'Quantity cannot be negative' });
      }
      if (item.price <= 0) {
        errors.push({ row: rowNum, field: 'Price', message: 'Price must be greater than 0' });
      }
      if (item.mrp < item.price) {
        errors.push({ row: rowNum, field: 'MRP', message: 'MRP should be >= Price' });
      }
    });

    // Check for duplicate part numbers
    const partNumbers = items.map(i => i.partNumber);
    const duplicates = partNumbers.filter((num, index) => partNumbers.indexOf(num) !== index);
    duplicates.forEach(num => {
      const rowNum = items.findIndex(i => i.partNumber === num) + 1;
      errors.push({ row: rowNum, field: 'Part Number', message: `Duplicate part number: ${num}` });
    });

    setValidationErrors(errors);
  };

  const handleQuickEntryImport = () => {
    const validItems = quickEntryRows.filter(item => 
      item.name && item.partNumber && item.quantity > 0
    );

    if (validItems.length === 0) {
      alert('Please fill in at least one complete row');
      return;
    }

    setBulkItems(validItems);
    validateItems(validItems);
    setShowPreview(true);
  };

  const addQuickEntryRow = () => {
    setQuickEntryRows([...quickEntryRows, createEmptyItem()]);
  };

  const updateQuickEntryRow = (index: number, field: keyof BulkItem, value: any) => {
    const updated = [...quickEntryRows];
    updated[index] = { ...updated[index], [field]: value };
    setQuickEntryRows(updated);
  };

  const removeQuickEntryRow = (index: number) => {
    if (quickEntryRows.length > 1) {
      setQuickEntryRows(quickEntryRows.filter((_, i) => i !== index));
    }
  };

  const handleImport = () => {
    if (validationErrors.length > 0) {
      alert('Please fix validation errors before importing');
      return;
    }

    setImporting(true);

    // Simulate import process
    setTimeout(() => {
      const existingInventory = getFromStorage('inventory', []);
      const existingPartNumbers = existingInventory.map((item: InventoryItem) => item.partNumber);

      let successCount = 0;

      bulkItems.forEach((item) => {
        // Skip duplicates in existing inventory
        if (existingPartNumbers.includes(item.partNumber)) {
          return;
        }

        const newItem: InventoryItem = {
          id: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: item.name,
          partNumber: item.partNumber || '',
          category: item.category,
          vehicleType: item.vehicleType,
          bikeName: item.vehicleName,
          bikeModel: item.bikeModel,
          bikeType: item.bikeType,
          hsnCode: item.hsnCode,
          quantity: item.quantity,
          minStockLevel: item.minStockLevel,
          price: item.price,
          mrp: item.mrp,
          retailPrice: item.retailPrice || item.mrp,
          wholesalePrice: item.wholesalePrice || item.price,
          distributorPrice: item.distributorPrice || item.price,
          partyId: item.partyName,
          barcode: item.barcode || item.partNumber,
          location: item.location,
          warrantyPeriod: item.warrantyPeriod,
          workspaceId: currentUser?.workspaceId || '',
          createdAt: new Date().toISOString(),
          lastRestocked: new Date().toISOString(),
        };

        existingInventory.push(newItem);
        successCount++;
      });

      saveToStorage('inventory', existingInventory);

      setImporting(false);
      setImportSuccess(true);
      setImportedCount(successCount);

      // Reset after 3 seconds
      setTimeout(() => {
        setImportSuccess(false);
        setBulkItems([]);
        setShowPreview(false);
        setQuickEntryRows([createEmptyItem(), createEmptyItem(), createEmptyItem()]);
        setPasteText('');
      }, 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 flex items-center space-x-2">
            <Upload className="w-6 h-6 text-blue-600" />
            <span>Bulk Import Inventory</span>
          </h2>
          <p className="text-gray-600 text-sm mt-1">Import multiple items at once using CSV, Excel, or quick entry</p>
        </div>
      </div>

      {/* Success Message */}
      {importSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <p className="text-green-900">Successfully imported {importedCount} items!</p>
            <p className="text-green-700 text-sm">Items have been added to your inventory.</p>
          </div>
        </div>
      )}

      {/* Import Method Selection */}
      {!showPreview && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* CSV Upload */}
            <button
              onClick={() => setImportMethod('csv')}
              className={`p-6 border-2 rounded-xl transition-all ${
                importMethod === 'csv'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <File className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="text-gray-900 mb-1">CSV Upload</h3>
              <p className="text-gray-600 text-sm">Upload CSV file</p>
            </button>

            {/* Excel Upload */}
            <button
              onClick={() => setImportMethod('excel')}
              className={`p-6 border-2 rounded-xl transition-all ${
                importMethod === 'excel'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <FileSpreadsheet className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="text-gray-900 mb-1">Excel Upload</h3>
              <p className="text-gray-600 text-sm">Upload Excel file</p>
            </button>

            {/* Copy-Paste */}
            <button
              onClick={() => setImportMethod('paste')}
              className={`p-6 border-2 rounded-xl transition-all ${
                importMethod === 'paste'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <Copy className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="text-gray-900 mb-1">Copy & Paste</h3>
              <p className="text-gray-600 text-sm">Paste from Excel</p>
            </button>

            {/* Quick Entry */}
            <button
              onClick={() => setImportMethod('quick')}
              className={`p-6 border-2 rounded-xl transition-all ${
                importMethod === 'quick'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-300'
              }`}
            >
              <Table className="w-8 h-8 text-orange-600 mx-auto mb-3" />
              <h3 className="text-gray-900 mb-1">Quick Entry</h3>
              <p className="text-gray-600 text-sm">Fill form manually</p>
            </button>
          </div>

          {/* Download Templates */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Download className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-blue-900 mb-2">Download Templates</h4>
                <p className="text-blue-700 text-sm mb-3">
                  Download our pre-formatted templates to ensure correct data format
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => downloadTemplate('csv')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center space-x-2"
                  >
                    <File className="w-4 h-4" />
                    <span>Download CSV Template</span>
                  </button>
                  <button
                    onClick={() => downloadTemplate('excel')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center space-x-2"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Download Excel Template</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Import Method Content */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            {/* CSV/Excel Upload */}
            {(importMethod === 'csv' || importMethod === 'excel') && (
              <div className="space-y-4">
                <h3 className="text-gray-900">Upload {importMethod.toUpperCase()} File</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Drag and drop your file here, or click to browse
                  </p>
                  <label className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                    <input
                      type="file"
                      accept=".csv,.xls,.xlsx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    Choose File
                  </label>
                  <p className="text-gray-500 text-sm mt-3">
                    Supported formats: CSV, XLS, XLSX (Max 5MB)
                  </p>
                </div>
              </div>
            )}

            {/* Copy-Paste */}
            {importMethod === 'paste' && (
              <div className="space-y-4">
                <h3 className="text-gray-900">Paste Your Data</h3>
                <p className="text-gray-600 text-sm">
                  Copy data from Excel/Sheets and paste below. First row should be headers.
                </p>
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="Paste your data here..."
                  className="w-full h-64 border border-gray-300 rounded-lg p-4 font-mono text-sm"
                />
                <button
                  onClick={handlePaste}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Process Pasted Data</span>
                </button>
              </div>
            )}

            {/* Quick Entry Form */}
            {importMethod === 'quick' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-900">Quick Entry Form</h3>
                  <button
                    onClick={addQuickEntryRow}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Row</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-2 text-left">#</th>
                        <th className="px-2 py-2 text-left">Item Name*</th>
                        <th className="px-2 py-2 text-left">Part Number*</th>
                        <th className="px-2 py-2 text-left">Category*</th>
                        <th className="px-2 py-2 text-left">Vehicle Type*</th>
                        <th className="px-2 py-2 text-left">Vehicle Name</th>
                        <th className="px-2 py-2 text-left">Model</th>
                        <th className="px-2 py-2 text-left">Type</th>
                        <th className="px-2 py-2 text-left">HSN Code</th>
                        <th className="px-2 py-2 text-left">Barcode</th>
                        <th className="px-2 py-2 text-left">Qty*</th>
                        <th className="px-2 py-2 text-left">Min Stock*</th>
                        <th className="px-2 py-2 text-left">Price*</th>
                        <th className="px-2 py-2 text-left">MRP*</th>
                        <th className="px-2 py-2 text-left">Retail</th>
                        <th className="px-2 py-2 text-left">Wholesale</th>
                        <th className="px-2 py-2 text-left">Distributor</th>
                        <th className="px-2 py-2 text-left">Supplier</th>
                        <th className="px-2 py-2 text-left">Location</th>
                        <th className="px-2 py-2 text-left">Warranty</th>
                        <th className="px-2 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quickEntryRows.map((row, index) => (
                        <tr key={index} className="border-b border-gray-200">
                          <td className="px-2 py-2">{index + 1}</td>
                          <td className="px-2 py-2">
                            <input
                              type="text"
                              value={row.name}
                              onChange={(e) => updateQuickEntryRow(index, 'name', e.target.value)}
                              className="w-40 border border-gray-300 rounded px-2 py-1 text-sm"
                              placeholder="Brake Pad"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="text"
                              value={row.partNumber}
                              onChange={(e) => updateQuickEntryRow(index, 'partNumber', e.target.value)}
                              className="w-28 border border-gray-300 rounded px-2 py-1 text-sm"
                              placeholder="BP-001"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <select
                              value={row.category}
                              onChange={(e) => updateQuickEntryRow(index, 'category', e.target.value as ItemCategory)}
                              className="w-28 border border-gray-300 rounded px-2 py-1 text-sm"
                            >
                              <option value="local">local</option>
                              <option value="original">original</option>
                            </select>
                          </td>
                          <td className="px-2 py-2">
                            <select
                              value={row.vehicleType}
                              onChange={(e) => updateQuickEntryRow(index, 'vehicleType', e.target.value as VehicleType)}
                              className="w-32 border border-gray-300 rounded px-2 py-1 text-sm"
                            >
                              <option value="two_wheeler">two_wheeler</option>
                              <option value="four_wheeler">four_wheeler</option>
                            </select>
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="text"
                              value={row.vehicleName || ''}
                              onChange={(e) => updateQuickEntryRow(index, 'vehicleName', e.target.value)}
                              className="w-28 border border-gray-300 rounded px-2 py-1 text-sm"
                              placeholder="Splendor"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="text"
                              value={row.bikeModel || ''}
                              onChange={(e) => updateQuickEntryRow(index, 'bikeModel', e.target.value)}
                              className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                              placeholder="Plus"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="text"
                              value={row.bikeType || ''}
                              onChange={(e) => updateQuickEntryRow(index, 'bikeType', e.target.value)}
                              className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                              placeholder="Commuter"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="text"
                              value={row.hsnCode || ''}
                              onChange={(e) => updateQuickEntryRow(index, 'hsnCode', e.target.value)}
                              className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                              placeholder="8708"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="text"
                              value={row.barcode || ''}
                              onChange={(e) => updateQuickEntryRow(index, 'barcode', e.target.value)}
                              className="w-28 border border-gray-300 rounded px-2 py-1 text-sm font-mono"
                              placeholder="BP001"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              value={row.quantity}
                              onChange={(e) => updateQuickEntryRow(index, 'quantity', parseInt(e.target.value) || 0)}
                              className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                              min="0"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              value={row.minStockLevel}
                              onChange={(e) => updateQuickEntryRow(index, 'minStockLevel', parseInt(e.target.value) || 0)}
                              className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                              min="0"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              value={row.price}
                              onChange={(e) => updateQuickEntryRow(index, 'price', parseFloat(e.target.value) || 0)}
                              className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              value={row.mrp}
                              onChange={(e) => updateQuickEntryRow(index, 'mrp', parseFloat(e.target.value) || 0)}
                              className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              value={row.retailPrice || ''}
                              onChange={(e) => updateQuickEntryRow(index, 'retailPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                              className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                              min="0"
                              step="0.01"
                              placeholder="Optional"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              value={row.wholesalePrice || ''}
                              onChange={(e) => updateQuickEntryRow(index, 'wholesalePrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                              className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                              min="0"
                              step="0.01"
                              placeholder="Optional"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              value={row.distributorPrice || ''}
                              onChange={(e) => updateQuickEntryRow(index, 'distributorPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                              className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                              min="0"
                              step="0.01"
                              placeholder="Optional"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="text"
                              value={row.partyName || ''}
                              onChange={(e) => updateQuickEntryRow(index, 'partyName', e.target.value)}
                              className="w-28 border border-gray-300 rounded px-2 py-1 text-sm"
                              placeholder="Supplier ID"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="text"
                              value={row.location || ''}
                              onChange={(e) => updateQuickEntryRow(index, 'location', e.target.value)}
                              className="w-32 border border-gray-300 rounded px-2 py-1 text-sm"
                              placeholder="Shelf A-12"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="text"
                              value={row.warrantyPeriod || ''}
                              onChange={(e) => updateQuickEntryRow(index, 'warrantyPeriod', e.target.value)}
                              className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                              placeholder="6"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <button
                              onClick={() => removeQuickEntryRow(index)}
                              className="text-red-600 hover:text-red-700"
                              disabled={quickEntryRows.length === 1}
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={handleQuickEntryImport}
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
                >
                  <List className="w-4 h-4" />
                  <span>Preview & Import</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Preview & Validation */}
      {showPreview && !importSuccess && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-900">Preview & Validation</h3>
            <button
              onClick={() => {
                setShowPreview(false);
                setBulkItems([]);
                setValidationErrors([]);
              }}
              className="text-gray-600 hover:text-gray-800"
            >
              Back to Import
            </button>
          </div>

          {/* Validation Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <List className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-blue-900">Total Items</p>
                  <p className="text-blue-600 text-2xl">{bulkItems.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-green-900">Valid Items</p>
                  <p className="text-green-600 text-2xl">{bulkItems.length - new Set(validationErrors.map(e => e.row)).size}</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <XCircle className="w-6 h-6 text-red-600" />
                <div>
                  <p className="text-red-900">Errors</p>
                  <p className="text-red-600 text-2xl">{validationErrors.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-red-900 mb-2">Validation Errors</h4>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {validationErrors.map((error, index) => (
                      <p key={index} className="text-red-700 text-sm">
                        Row {error.row}: <span className="font-medium">{error.field}</span> - {error.message}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data Preview Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-3 text-left border-r">#</th>
                    <th className="px-3 py-3 text-left">Item Name</th>
                    <th className="px-3 py-3 text-left">Part Number</th>
                    <th className="px-3 py-3 text-left">Category</th>
                    <th className="px-3 py-3 text-left">Vehicle Type</th>
                    <th className="px-3 py-3 text-left">Vehicle Name</th>
                    <th className="px-3 py-3 text-left">Model</th>
                    <th className="px-3 py-3 text-left">Type</th>
                    <th className="px-3 py-3 text-left">HSN Code</th>
                    <th className="px-3 py-3 text-left">Barcode</th>
                    <th className="px-3 py-3 text-left">Qty</th>
                    <th className="px-3 py-3 text-left">Min Stock</th>
                    <th className="px-3 py-3 text-left">Price (₹)</th>
                    <th className="px-3 py-3 text-left">MRP (₹)</th>
                    <th className="px-3 py-3 text-left">Retail (₹)</th>
                    <th className="px-3 py-3 text-left">Wholesale (₹)</th>
                    <th className="px-3 py-3 text-left">Distributor (₹)</th>
                    <th className="px-3 py-3 text-left">Supplier/Party</th>
                    <th className="px-3 py-3 text-left">Location</th>
                    <th className="px-3 py-3 text-left">Warranty</th>
                    <th className="px-3 py-3 text-left border-l">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bulkItems.map((item, index) => {
                    const hasError = validationErrors.some(e => e.row === index + 1);
                    return (
                      <tr key={index} className={`border-b border-gray-200 ${hasError ? 'bg-red-50' : ''}`}>
                        <td className="px-3 py-3 border-r font-medium">{index + 1}</td>
                        <td className="px-3 py-3 max-w-[200px] truncate" title={item.name}>{item.name}</td>
                        <td className="px-3 py-3">{item.partNumber}</td>
                        <td className="px-3 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            item.category === 'original' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            item.vehicleType === 'four_wheeler' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {item.vehicleType === 'two_wheeler' ? '2W' : '4W'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-gray-600">{item.vehicleName || '-'}</td>
                        <td className="px-3 py-3 text-gray-600">{item.bikeModel || '-'}</td>
                        <td className="px-3 py-3 text-gray-600">{item.bikeType || '-'}</td>
                        <td className="px-3 py-3 text-gray-600">{item.hsnCode || '-'}</td>
                        <td className="px-3 py-3 text-gray-600 font-mono text-xs">{item.barcode || '-'}</td>
                        <td className="px-3 py-3 font-semibold">{item.quantity}</td>
                        <td className="px-3 py-3 text-gray-600">{item.minStockLevel}</td>
                        <td className="px-3 py-3 font-semibold text-blue-600">₹{item.price.toFixed(2)}</td>
                        <td className="px-3 py-3 font-semibold text-green-600">₹{item.mrp.toFixed(2)}</td>
                        <td className="px-3 py-3 text-gray-600">{item.retailPrice ? `₹${item.retailPrice.toFixed(2)}` : '-'}</td>
                        <td className="px-3 py-3 text-gray-600">{item.wholesalePrice ? `₹${item.wholesalePrice.toFixed(2)}` : '-'}</td>
                        <td className="px-3 py-3 text-gray-600">{item.distributorPrice ? `₹${item.distributorPrice.toFixed(2)}` : '-'}</td>
                        <td className="px-3 py-3 text-gray-600">{item.partyName || '-'}</td>
                        <td className="px-3 py-3 text-gray-600 max-w-[150px] truncate" title={item.location}>{item.location || '-'}</td>
                        <td className="px-3 py-3 text-gray-600">{item.warrantyPeriod ? `${item.warrantyPeriod}m` : '-'}</td>
                        <td className="px-3 py-3 border-l">
                          {hasError ? (
                            <XCircle className="w-5 h-5 text-red-600" />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Import Button */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowPreview(false);
                setBulkItems([]);
                setValidationErrors([]);
              }}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={validationErrors.length > 0 || importing}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {importing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Import {bulkItems.length - new Set(validationErrors.map(e => e.row)).size} Items</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};