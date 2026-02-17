import React from 'react';
import { motion } from 'motion/react';
import { X, Printer, Download } from 'lucide-react';
import { Bill } from '../types';

interface BillPreviewModalProps {
  bill: Bill;
  onClose: () => void;
}

export const BillPreviewModal: React.FC<BillPreviewModalProps> = ({ bill, onClose }) => {
  
  const handlePrint = () => {
    const printContent = document.getElementById('bill-preview-content');
    if (!printContent) return;

    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${bill.billNumber}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              margin: 0;
            }
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              border-bottom: 4px solid #f97316;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .flex-between {
              display: flex;
              justify-content: space-between;
              align-items: start;
            }
            h1 {
              font-size: 2em;
              margin: 0 0 10px 0;
              color: #111827;
            }
            .customer-box {
              background: #f9fafb;
              border-radius: 8px;
              padding: 15px;
              margin: 20px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th {
              background: #f9fafb;
              padding: 12px;
              text-align: left;
              font-weight: 600;
              border-bottom: 2px solid #e5e7eb;
            }
            td {
              padding: 12px;
              border-bottom: 1px solid #e5e7eb;
            }
            .text-right {
              text-align: right;
            }
            .totals {
              max-width: 300px;
              margin-left: auto;
              margin-top: 20px;
            }
            .totals-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
            }
            .total-final {
              font-size: 1.2em;
              font-weight: bold;
              border-top: 2px solid #e5e7eb;
              padding-top: 10px;
              margin-top: 10px;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              color: #6b7280;
            }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleDownload = () => {
    handlePrint(); // For now, download triggers print dialog
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-orange-50 to-red-50">
          <h3 className="text-xl font-bold text-gray-900">Invoice Preview</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <div id="bill-preview-content" className="invoice-container bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
            
            {/* Invoice Header */}
            <div className="header flex-between">
              <div>
                <h1>INVOICE</h1>
                <p style={{ color: '#6b7280', marginTop: '5px' }}>Serve Spares - Inventory System</p>
                <p style={{ color: '#6b7280', fontSize: '0.9em', marginTop: '10px' }}>
                  Auto Parts & Accessories
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: '#6b7280', fontSize: '0.875em', margin: '0' }}>Invoice No.</p>
                <p style={{ fontSize: '1.125em', fontWeight: 'bold', color: '#111827', margin: '5px 0' }}>
                  {bill.billNumber}
                </p>
                <p style={{ color: '#6b7280', fontSize: '0.875em', marginTop: '10px', marginBottom: '0' }}>Date</p>
                <p style={{ fontWeight: '600', color: '#111827', margin: '5px 0' }}>
                  {new Date(bill.createdAt).toLocaleDateString('en-NP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p style={{ fontSize: '0.875em', color: '#6b7280', marginTop: '5px' }}>
                  {new Date(bill.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>

            {/* Customer Details */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '0.875em', fontWeight: 'bold', color: '#374151', marginBottom: '12px' }}>
                BILL TO:
              </h3>
              <div className="customer-box">
                <p style={{ fontWeight: 'bold', color: '#111827', fontSize: '1.125em', margin: '0 0 8px 0' }}>
                  {bill.customerName}
                </p>
                {bill.customerPhone && (
                  <p style={{ color: '#374151', margin: '4px 0' }}>
                    📞 Phone: {bill.customerPhone}
                  </p>
                )}
                {bill.customerPanVat && (
                  <p style={{ color: '#374151', margin: '4px 0' }}>
                    🆔 PAN/VAT: {bill.customerPanVat}
                  </p>
                )}
                {bill.customerAddress && (
                  <p style={{ color: '#374151', margin: '4px 0' }}>
                    📍 Address: {bill.customerAddress}
                  </p>
                )}
                {bill.partyId && (
                  <p style={{ color: '#10b981', fontSize: '0.875em', marginTop: '8px', fontWeight: '600' }}>
                    ✓ Registered Customer
                  </p>
                )}
              </div>
            </div>

            {/* Items Table */}
            <table>
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>S.N</th>
                  <th>ITEM DESCRIPTION</th>
                  <th className="text-right">RATE</th>
                  <th className="text-right" style={{ width: '80px' }}>QTY</th>
                  <th className="text-right" style={{ width: '120px' }}>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {bill.items.map((item, index) => (
                  <tr key={item.itemId}>
                    <td style={{ color: '#6b7280' }}>{index + 1}</td>
                    <td style={{ fontWeight: '500', color: '#111827' }}>{item.itemName}</td>
                    <td className="text-right" style={{ color: '#374151' }}>
                      NPR {item.price.toLocaleString()}
                    </td>
                    <td className="text-right" style={{ color: '#374151' }}>
                      {item.quantity}
                    </td>
                    <td className="text-right" style={{ fontWeight: '600', color: '#111827' }}>
                      NPR {item.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="totals">
              <div className="totals-row" style={{ color: '#374151' }}>
                <span>Subtotal:</span>
                <span style={{ fontWeight: '600' }}>NPR {bill.subtotal.toLocaleString()}</span>
              </div>
              {bill.discount > 0 && (
                <div className="totals-row" style={{ color: '#10b981' }}>
                  <span>Discount:</span>
                  <span style={{ fontWeight: '600' }}>- NPR {bill.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="totals-row" style={{ color: '#374151' }}>
                <span>VAT (13%):</span>
                <span style={{ fontWeight: '600' }}>NPR {bill.tax.toLocaleString()}</span>
              </div>
              <div className="totals-row total-final" style={{ color: '#111827' }}>
                <span>TOTAL AMOUNT:</span>
                <span>NPR {bill.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Info */}
            <div style={{ marginTop: '30px', padding: '15px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #86efac' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '0.875em', color: '#166534', margin: '0' }}>Payment Method</p>
                  <p style={{ fontWeight: 'bold', color: '#15803d', margin: '5px 0 0 0', textTransform: 'uppercase' }}>
                    {bill.paymentMethod}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.875em', color: '#166534', margin: '0' }}>Payment Status</p>
                  <p style={{ fontWeight: 'bold', color: '#15803d', margin: '5px 0 0 0', textTransform: 'uppercase' }}>
                    {bill.paymentStatus}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {bill.notes && (
              <div style={{ marginTop: '20px', padding: '12px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fcd34d' }}>
                <p style={{ fontSize: '0.875em', color: '#92400e', fontWeight: '600', margin: '0 0 5px 0' }}>Notes:</p>
                <p style={{ color: '#78350f', margin: '0', fontSize: '0.875em' }}>{bill.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="footer">
              <p style={{ fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Thank you for your business!
              </p>
              <p style={{ fontSize: '0.875em', margin: '4px 0' }}>
                Served by: {bill.createdBy}
              </p>
              <p style={{ fontSize: '0.75em', marginTop: '15px' }}>
                This is a computer-generated invoice and does not require a signature.
              </p>
              <p style={{ fontSize: '0.75em', marginTop: '5px' }}>
                For queries, contact: +977-XXXXXXXXXX
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BillPreviewModal;
