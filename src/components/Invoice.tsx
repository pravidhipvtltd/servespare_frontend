import React from 'react';
import { motion } from 'motion/react';
import { FileText, Download, Printer, Check } from 'lucide-react';

interface InvoiceProps {
  invoiceNumber: string;
  date: string;
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
    businessName: string;
    address: string;
    city: string;
    panVatNumber?: string;
  };
  planDetails: {
    planName: string;
    planPrice: number;
    billingCycle: 'monthly' | 'yearly';
  };
  paymentInfo: {
    cardNumber?: string;
    cardType?: string;
    cashAppTag?: string;
    stripeEmail?: string;
    wiseEmail?: string;
    esewaId?: string;
    khaltiNumber?: string;
    fonepayNumber?: string;
  };
}

export const Invoice: React.FC<InvoiceProps> = ({
  invoiceNumber,
  date,
  customerInfo,
  planDetails,
  paymentInfo
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real app, this would generate a PDF
    alert('Invoice PDF download functionality would be implemented here');
  };

  // Determine payment method used
  const getPaymentMethod = () => {
    if (paymentInfo.cardNumber) {
      return `Card ending in ${paymentInfo.cardNumber.slice(-4)} ${paymentInfo.cardType ? `(${paymentInfo.cardType})` : ''}`;
    }
    if (paymentInfo.cashAppTag) return `Cash App (${paymentInfo.cashAppTag})`;
    if (paymentInfo.stripeEmail) return `Stripe (${paymentInfo.stripeEmail})`;
    if (paymentInfo.wiseEmail) return `Wise (${paymentInfo.wiseEmail})`;
    if (paymentInfo.esewaId) return `eSewa (${paymentInfo.esewaId})`;
    if (paymentInfo.khaltiNumber) return `Khalti (${paymentInfo.khaltiNumber})`;
    if (paymentInfo.fonepayNumber) return `FonePay (${paymentInfo.fonepayNumber})`;
    return 'N/A';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center space-x-3">
              <FileText size={40} />
              <span>INVOICE</span>
            </h1>
            <p className="text-white/90">Serve Spares - Inventory System</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/80">Invoice Number</p>
            <p className="text-2xl font-bold">#{invoiceNumber}</p>
            <p className="text-sm text-white/80 mt-2">Date: {date}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-gray-50 px-8 py-4 flex justify-end space-x-3 print:hidden">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePrint}
          className="flex items-center space-x-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:border-indigo-500 transition-colors"
        >
          <Printer size={18} />
          <span className="font-medium">Print</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDownload}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Download size={18} />
          <span className="font-medium">Download PDF</span>
        </motion.button>
      </div>

      {/* Invoice Content */}
      <div className="p-8">
        {/* Customer and Business Info */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Bill To */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Bill To:</h3>
            <div className="space-y-1">
              <p className="font-bold text-lg text-gray-900">{customerInfo.fullName}</p>
              <p className="text-gray-700">{customerInfo.businessName}</p>
              <p className="text-gray-600">{customerInfo.address}</p>
              <p className="text-gray-600">{customerInfo.city}</p>
              {customerInfo.panVatNumber && (
                <p className="text-gray-600">PAN/VAT: {customerInfo.panVatNumber}</p>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Contact Information:</h3>
            <div className="space-y-1">
              <p className="text-gray-700">
                <span className="font-medium">Email:</span> {customerInfo.email}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Phone:</span> +977 {customerInfo.phone}
              </p>
            </div>
          </div>
        </div>

        {/* Invoice Details Table */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Invoice Details:</h3>
          <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <tr>
                  <th className="text-left px-6 py-4 font-bold text-gray-700">Description</th>
                  <th className="text-center px-6 py-4 font-bold text-gray-700">Billing</th>
                  <th className="text-right px-6 py-4 font-bold text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t-2 border-gray-200">
                  <td className="px-6 py-5">
                    <p className="font-bold text-gray-900 text-lg">{planDetails.planName} Plan</p>
                    <p className="text-sm text-gray-600">
                      Serve Spares Inventory Management System - Full Access
                    </p>
                  </td>
                  <td className="text-center px-6 py-5">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-sm capitalize">
                      {planDetails.billingCycle}
                    </span>
                  </td>
                  <td className="text-right px-6 py-5">
                    <p className="font-bold text-xl text-gray-900">
                      NPR {planDetails.planPrice.toLocaleString()}
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-700 text-lg">Payment Summary</h3>
            <div className="flex items-center space-x-2 text-green-600">
              <Check size={20} />
              <span className="font-semibold">PAID</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <span className="font-semibold">NPR {planDetails.planPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Tax (0%):</span>
              <span className="font-semibold">NPR 0</span>
            </div>
            <div className="border-t-2 border-gray-300 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xl text-gray-900">Total Amount:</span>
                <span className="font-bold text-3xl text-indigo-600">
                  NPR {planDetails.planPrice.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-600 pt-2">
              <span>Payment Method:</span>
              <span className="font-medium">{getPaymentMethod()}</span>
            </div>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="border-t-2 border-gray-200 pt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-gray-700 mb-2">Notes:</h4>
              <p className="text-sm text-gray-600">
                Thank you for choosing Serve Spares Inventory Management System. 
                Your subscription is now active and ready to use.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-700 mb-2">Terms & Conditions:</h4>
              <p className="text-sm text-gray-600">
                Payment is non-refundable. Subscription renews automatically unless cancelled. 
                For support, contact support@servespares.com
              </p>
            </div>
          </div>
        </div>

        {/* Company Footer */}
        <div className="mt-8 pt-6 border-t-2 border-gray-200 text-center">
          <p className="font-bold text-gray-800 text-lg">Serve Spares - Inventory System</p>
          <p className="text-sm text-gray-600 mt-1">
            Auto Parts Inventory Management for Two-Wheelers & Four-Wheelers
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Email: support@servespares.com | Phone: +977 1234567890
          </p>
          <p className="text-xs text-gray-400 mt-4">
            This is a computer-generated invoice and does not require a signature.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
