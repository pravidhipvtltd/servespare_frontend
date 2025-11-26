import React, { useState } from 'react';
import { Upload, Download, FileSpreadsheet, Copy, Plus, CheckCircle, XCircle, AlertTriangle, RefreshCw, File, Table, List } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getFromStorage, saveToStorage } from '../../utils/mockData';
import { InventoryItem } from '../../types';

type ImportMethod = 'csv' | 'excel' | 'paste' | 'quick';

interface BulkItem {
  partName: string;
  partNumber: string;
  category: string;
  brand: string;
  hsnCode: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  costPrice: number;
  sellingPrice: number;
  mrp: number;
  supplier: string;
  location: string;
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
      partName: '',
      partNumber: '',
      category: 'Two-Wheeler',
      brand: 'Local',
      hsnCode: '',
      quantity: 0,
      minStock: 5,
      maxStock: 100,
      costPrice: 0,
      sellingPrice: 0,
      mrp: 0,
      supplier: '',
      location: 'Main Warehouse',
    };
  }

  const downloadTemplate = (format: 'csv' | 'excel') => {
    const headers = [
      'Part Name*',
      'Part Number*',
      'Category*',
      'Brand*',
      'HSN Code',
      'Quantity*',
      'Min Stock',
      'Max Stock',
      'Cost Price*',
      'Selling Price*',
      'MRP*',
      'Supplier',
      'Location'
    ];

    const sampleData = [
      'Brake Pad',
      'BP-001',
      'Two-Wheeler',
      'Branded',
      '8708',
      '50',
      '10',
      '200',
      '150',
      '200',
      '250',
      'ABC Motors',
      'Main Warehouse'
    ];

    if (format === 'csv') {
      const csv = [
        headers.join(','),
        sampleData.join(','),
        ',,,,,,,,,,,,', // Empty row for user to fill
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
        '\t\t\t\t\t\t\t\t\t\t\t\t',
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
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      alert('CSV file is empty or invalid');
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const items: BulkItem[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length < 6) continue; // Skip invalid rows

      items.push({
        partName: values[0] || '',
        partNumber: values[1] || '',
        category: values[2] || 'Two-Wheeler',
        brand: values[3] || 'Local',
        hsnCode: values[4] || '',
        quantity: parseInt(values[5]) || 0,
        minStock: parseInt(values[6]) || 5,
        maxStock: parseInt(values[7]) || 100,
        costPrice: parseFloat(values[8]) || 0,
        sellingPrice: parseFloat(values[9]) || 0,
        mrp: parseFloat(values[10]) || 0,
        supplier: values[11] || '',
        location: values[12] || 'Main Warehouse',
      });
    }

    setBulkItems(items);
    validateItems(items);
    setShowPreview(true);
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

      if (!item.partName) {
        errors.push({ row: rowNum, field: 'Part Name', message: 'Part Name is required' });
      }
      if (!item.partNumber) {
        errors.push({ row: rowNum, field: 'Part Number', message: 'Part Number is required' });
      }
      if (item.quantity < 0) {
        errors.push({ row: rowNum, field: 'Quantity', message: 'Quantity cannot be negative' });
      }
      if (item.costPrice <= 0) {
        errors.push({ row: rowNum, field: 'Cost Price', message: 'Cost Price must be greater than 0' });
      }
      if (item.sellingPrice <= 0) {
        errors.push({ row: rowNum, field: 'Selling Price', message: 'Selling Price must be greater than 0' });
      }
      if (item.mrp < item.sellingPrice) {
        errors.push({ row: rowNum, field: 'MRP', message: 'MRP should be >= Selling Price' });
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
      item.partName && item.partNumber && item.quantity > 0
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
          ...item,
          sku: item.partNumber,
          barcode: item.partNumber,
          reorderPoint: item.minStock,
          description: '',
          dateAdded: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          workspaceId: currentUser?.workspaceId || '',
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
                        <th className="px-3 py-2 text-left">#</th>
                        <th className="px-3 py-2 text-left">Part Name*</th>
                        <th className="px-3 py-2 text-left">Part Number*</th>
                        <th className="px-3 py-2 text-left">Category</th>
                        <th className="px-3 py-2 text-left">Brand</th>
                        <th className="px-3 py-2 text-left">Qty*</th>
                        <th className="px-3 py-2 text-left">Cost*</th>
                        <th className="px-3 py-2 text-left">Selling*</th>
                        <th className="px-3 py-2 text-left">MRP*</th>
                        <th className="px-3 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quickEntryRows.map((row, index) => (
                        <tr key={index} className="border-b border-gray-200">
                          <td className="px-3 py-2">{index + 1}</td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={row.partName}
                              onChange={(e) => updateQuickEntryRow(index, 'partName', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1"
                              placeholder="Brake Pad"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={row.partNumber}
                              onChange={(e) => updateQuickEntryRow(index, 'partNumber', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1"
                              placeholder="BP-001"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={row.category}
                              onChange={(e) => updateQuickEntryRow(index, 'category', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1"
                            >
                              <option>Two-Wheeler</option>
                              <option>Four-Wheeler</option>
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={row.brand}
                              onChange={(e) => updateQuickEntryRow(index, 'brand', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1"
                            >
                              <option>Local</option>
                              <option>Branded</option>
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              value={row.quantity}
                              onChange={(e) => updateQuickEntryRow(index, 'quantity', parseInt(e.target.value))}
                              className="w-20 border border-gray-300 rounded px-2 py-1"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              value={row.costPrice}
                              onChange={(e) => updateQuickEntryRow(index, 'costPrice', parseFloat(e.target.value))}
                              className="w-24 border border-gray-300 rounded px-2 py-1"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              value={row.sellingPrice}
                              onChange={(e) => updateQuickEntryRow(index, 'sellingPrice', parseFloat(e.target.value))}
                              className="w-24 border border-gray-300 rounded px-2 py-1"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              value={row.mrp}
                              onChange={(e) => updateQuickEntryRow(index, 'mrp', parseFloat(e.target.value))}
                              className="w-24 border border-gray-300 rounded px-2 py-1"
                            />
                          </td>
                          <td className="px-3 py-2">
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
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Part Name</th>
                    <th className="px-4 py-3 text-left">Part Number</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-left">Brand</th>
                    <th className="px-4 py-3 text-left">Qty</th>
                    <th className="px-4 py-3 text-left">Cost</th>
                    <th className="px-4 py-3 text-left">Selling</th>
                    <th className="px-4 py-3 text-left">MRP</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bulkItems.map((item, index) => {
                    const hasError = validationErrors.some(e => e.row === index + 1);
                    return (
                      <tr key={index} className={`border-b border-gray-200 ${hasError ? 'bg-red-50' : ''}`}>
                        <td className="px-4 py-3">{index + 1}</td>
                        <td className="px-4 py-3">{item.partName}</td>
                        <td className="px-4 py-3">{item.partNumber}</td>
                        <td className="px-4 py-3">{item.category}</td>
                        <td className="px-4 py-3">{item.brand}</td>
                        <td className="px-4 py-3">{item.quantity}</td>
                        <td className="px-4 py-3">NPR {item.costPrice.toFixed(2)}</td>
                        <td className="px-4 py-3">NPR {item.sellingPrice.toFixed(2)}</td>
                        <td className="px-4 py-3">NPR {item.mrp.toFixed(2)}</td>
                        <td className="px-4 py-3">
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
