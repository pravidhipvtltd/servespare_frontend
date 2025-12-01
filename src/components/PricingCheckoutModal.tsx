import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Building, Mail, Phone, MapPin, CreditCard, ArrowRight, ArrowLeft, Check, Lock } from 'lucide-react';
import { Invoice } from './Invoice';

interface PricingCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  planPrice: number;
  billingCycle: 'monthly' | 'yearly';
}

type Step = 'details' | 'payment' | 'success';
type CardType = 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown';

export const PricingCheckoutModal: React.FC<PricingCheckoutModalProps> = ({
  isOpen,
  onClose,
  planName,
  planPrice,
  billingCycle
}) => {
  const [currentStep, setCurrentStep] = useState<Step>('details');
  const [formData, setFormData] = useState({
    // Personal Details
    fullName: '',
    email: '',
    phone: '',
    
    // Business Details
    businessName: '',
    address: '',
    city: '',
    panVatNumber: '',
    
    // Payment
    paymentMethod: '',
    
    // Card Details
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVC: '',
    
    // Other Payment Methods
    cashAppTag: '',
    stripeEmail: '',
    wiseEmail: '',
    esewaId: '',
    khaltiNumber: '',
    fonepayNumber: ''
  });

  const [cardType, setCardType] = useState<CardType>('unknown');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');

  // Currency conversion rate (NPR to USD)
  const USD_CONVERSION_RATE = 0.0075; // 1 NPR = 0.0075 USD (approximately 1 USD = 133 NPR)
  
  // Determine if payment method is international
  const isInternationalPayment = () => {
    return formData.cardNumber || formData.cashAppTag || formData.stripeEmail || formData.wiseEmail;
  };

  // Determine if payment method is Nepal
  const isNepalPayment = () => {
    return formData.esewaId || formData.khaltiNumber || formData.fonepayNumber;
  };

  // Get display price based on payment method
  const getDisplayPrice = () => {
    if (isInternationalPayment()) {
      return (planPrice * USD_CONVERSION_RATE).toFixed(2);
    }
    return planPrice.toLocaleString();
  };

  // Get currency symbol
  const getCurrency = () => {
    if (isInternationalPayment()) {
      return 'USD';
    }
    return 'NPR';
  };

  // Detect card type based on card number
  const detectCardType = (number: string): CardType => {
    const cleaned = number.replace(/\s/g, '');
    
    // Visa: starts with 4
    if (/^4/.test(cleaned)) {
      return 'visa';
    }
    // Mastercard: starts with 51-55 or 2221-2720
    if (/^5[1-5]/.test(cleaned) || /^2(2[2-9][0-9]|[3-6][0-9]{2}|7[0-1][0-9]|720)/.test(cleaned)) {
      return 'mastercard';
    }
    // American Express: starts with 34 or 37
    if (/^3[47]/.test(cleaned)) {
      return 'amex';
    }
    // Discover: starts with 6011, 622126-622925, 644-649, 65
    if (/^6011|^622[1-9]|^64[4-9]|^65/.test(cleaned)) {
      return 'discover';
    }
    
    return 'unknown';
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const type = detectCardType(cleaned);
    setCardType(type);
    
    // American Express format: 1234 123456 12345
    if (type === 'amex') {
      const match = cleaned.match(/(\d{1,4})(\d{1,6})?(\d{1,5})?/);
      if (match) {
        return [match[1], match[2], match[3]].filter(Boolean).join(' ');
      }
    }
    
    // Standard format: 1234 1234 1234 1234
    const match = cleaned.match(/(\d{1,4})/g);
    return match ? match.join(' ') : cleaned;
  };

  // Format expiry date
  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      handleChange('cardNumber', formatted);
    }
  };

  const handleExpiryChange = (value: string) => {
    const formatted = formatExpiry(value);
    if (formatted.length <= 5) {
      handleChange('cardExpiry', formatted);
    }
  };

  const handleCVCChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const maxLength = cardType === 'amex' ? 4 : 3;
    if (cleaned.length <= maxLength) {
      handleChange('cardCVC', cleaned);
    }
  };

  // Check if card details are required
  const requiresCardDetails = () => {
    return formData.paymentMethod === 'card' || formData.paymentMethod === 'mastercard';
  };

  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('payment');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Process payment
    setCurrentStep('success');
    
    // Auto-close after 3 seconds
    setTimeout(() => {
      onClose();
      setCurrentStep('details');
    }, 3000);
  };

  const handleBack = () => {
    if (currentStep === 'payment') {
      setCurrentStep('details');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 z-10">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-3xl font-bold mb-2">
              {currentStep === 'details' && 'Complete Your Details'}
              {currentStep === 'payment' && 'Choose Payment Method'}
              {currentStep === 'success' && 'Payment Successful!'}
            </h2>
            <p className="text-white/90">
              {planName} Plan - NPR {planPrice.toLocaleString()} / {billingCycle === 'monthly' ? 'month' : 'year'}
            </p>

            {/* Progress Indicator */}
            <div className="flex items-center space-x-4 mt-6">
              <div className={`flex items-center space-x-2 ${currentStep === 'details' ? 'text-white' : 'text-white/60'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'details' ? 'bg-white text-indigo-600' : 'bg-white/20'}`}>
                  1
                </div>
                <span className="text-sm font-medium">Details</span>
              </div>
              <div className="flex-1 h-0.5 bg-white/30" />
              <div className={`flex items-center space-x-2 ${currentStep === 'payment' ? 'text-white' : 'text-white/60'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'payment' ? 'bg-white text-indigo-600' : 'bg-white/20'}`}>
                  2
                </div>
                <span className="text-sm font-medium">Payment</span>
              </div>
              <div className="flex-1 h-0.5 bg-white/30" />
              <div className={`flex items-center space-x-2 ${currentStep === 'success' ? 'text-white' : 'text-white/60'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'success' ? 'bg-white text-indigo-600' : 'bg-white/20'}`}>
                  <Check size={16} />
                </div>
                <span className="text-sm font-medium">Done</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {currentStep === 'details' && (
                <motion.form
                  key="details"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleContinueToPayment}
                  className="space-y-6"
                >
                  {/* Personal Details */}
                  <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                      <User className="text-indigo-600" />
                      <span>Personal Information</span>
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => handleChange('fullName', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <div className="flex">
                          <span className="inline-flex items-center px-4 border-2 border-r-0 border-gray-200 rounded-l-xl bg-gray-50 text-gray-600">
                            +977
                          </span>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-r-xl focus:border-indigo-500 focus:outline-none"
                            placeholder="9812345678"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Business Details */}
                  <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                      <Building className="text-indigo-600" />
                      <span>Business Information</span>
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Name *
                        </label>
                        <input
                          type="text"
                          value={formData.businessName}
                          onChange={(e) => handleChange('businessName', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                          placeholder="Auto Parts Store"
                          required
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Address *
                        </label>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => handleChange('address', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                          placeholder="Street Address"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => handleChange('city', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                          placeholder="Kathmandu"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          PAN/VAT Number (Optional)
                        </label>
                        <input
                          type="text"
                          value={formData.panVatNumber}
                          onChange={(e) => handleChange('panVatNumber', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                          placeholder="123456789"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:shadow-lg transition-all"
                  >
                    <span>Continue to Payment</span>
                    <ArrowRight size={20} />
                  </motion.button>
                </motion.form>
              )}

              {currentStep === 'payment' && (
                <motion.form
                  key="payment"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handlePaymentSubmit}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                    <CreditCard className="text-indigo-600" />
                    <span>Payment Information</span>
                  </h3>

                  {/* Single Unified Card Payment Section */}
                  <div className="border-2 border-indigo-300 rounded-2xl p-6 bg-gradient-to-br from-indigo-50 to-blue-50 relative">
                    {/* USD Currency Badge */}
                    <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                      <span>💵</span>
                      <span>USD</span>
                    </div>
                    
                    <h4 className="font-bold text-gray-800 mb-1 text-lg">Card Payment</h4>
                    <p className="text-sm text-gray-600 mb-5">Accepts Visa, Mastercard, Amex, Discover - Auto-detected</p>
                    
                    <div className="space-y-4">
                      {/* Card Number with Auto-Detection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Card Number *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.cardNumber}
                            onChange={(e) => handleCardNumberChange(e.target.value)}
                            className={`w-full px-4 py-3.5 border-2 rounded-xl focus:outline-none pr-14 transition-all ${
                              formData.cardNumber 
                                ? cardType !== 'unknown' 
                                  ? 'border-green-400 bg-white' 
                                  : 'border-gray-300 bg-white'
                                : 'border-gray-300 bg-white'
                            } ${formData.cardNumber && cardType !== 'unknown' ? 'focus:border-green-500' : 'focus:border-indigo-500'}`}
                            placeholder="Enter card number"
                            required
                          />
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                            {cardType === 'visa' && (
                              <div className="flex items-center space-x-1 bg-blue-100 px-2 py-1 rounded">
                                <span className="text-xl">💳</span>
                                <span className="text-xs font-bold text-blue-700">VISA</span>
                              </div>
                            )}
                            {cardType === 'mastercard' && (
                              <div className="flex items-center space-x-1 bg-red-100 px-2 py-1 rounded">
                                <span className="text-xl">🔴</span>
                                <span className="text-xs font-bold text-red-700">MC</span>
                              </div>
                            )}
                            {cardType === 'amex' && (
                              <div className="flex items-center space-x-1 bg-blue-100 px-2 py-1 rounded">
                                <span className="text-xl">💙</span>
                                <span className="text-xs font-bold text-blue-700">AMEX</span>
                              </div>
                            )}
                            {cardType === 'discover' && (
                              <div className="flex items-center space-x-1 bg-orange-100 px-2 py-1 rounded">
                                <span className="text-xl">🧡</span>
                                <span className="text-xs font-bold text-orange-700">DISC</span>
                              </div>
                            )}
                            {cardType === 'unknown' && formData.cardNumber.length > 0 && (
                              <CreditCard className="text-gray-400" size={24} />
                            )}
                            {!formData.cardNumber && (
                              <div className="flex space-x-1 opacity-40">
                                <span className="text-sm">💳</span>
                                <span className="text-sm">🔴</span>
                                <span className="text-sm">💙</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 flex items-center space-x-1">
                          {cardType === 'unknown' && formData.cardNumber.length === 0 && (
                            <span>✨ Card type will be auto-detected as you type</span>
                          )}
                          {cardType === 'unknown' && formData.cardNumber.length > 0 && (
                            <span>⚠️ Please enter a valid card number</span>
                          )}
                          {cardType !== 'unknown' && (
                            <>
                              <span className="text-green-600">✓</span>
                              <span className="text-green-600 font-medium">
                                {cardType === 'visa' && 'Visa card detected'}
                                {cardType === 'mastercard' && 'Mastercard detected'}
                                {cardType === 'amex' && 'American Express detected'}
                                {cardType === 'discover' && 'Discover card detected'}
                              </span>
                            </>
                          )}
                        </p>
                      </div>

                      {/* Cardholder Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cardholder Name *
                        </label>
                        <input
                          type="text"
                          value={formData.cardName}
                          onChange={(e) => handleChange('cardName', e.target.value)}
                          className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none bg-white"
                          placeholder="Name as shown on card"
                          style={{ textTransform: 'uppercase' }}
                          required
                        />
                      </div>

                      {/* Expiry and CVC in one row */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expiry Date *
                          </label>
                          <input
                            type="text"
                            value={formData.cardExpiry}
                            onChange={(e) => handleExpiryChange(e.target.value)}
                            className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none bg-white"
                            placeholder="MM/YY"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVC/CVV *
                          </label>
                          <input
                            type="text"
                            value={formData.cardCVC}
                            onChange={(e) => handleCVCChange(e.target.value)}
                            className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none bg-white"
                            placeholder={cardType === 'amex' ? '4 digits' : '3 digits'}
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {cardType === 'amex' ? '4 digits on front' : '3 digits on back'}
                          </p>
                        </div>
                      </div>

                      {/* Security Badge */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-3 flex items-center space-x-3">
                        <Lock className="text-green-600" size={20} />
                        <div>
                          <p className="font-semibold text-xs text-gray-800">
                            Your payment is secure with 256-bit SSL encryption
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 h-px bg-gray-300"></div>
                    <span className="text-sm text-gray-500 font-medium">OR PAY WITH</span>
                    <div className="flex-1 h-px bg-gray-300"></div>
                  </div>

                  {/* Other International Methods */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Cash App */}
                    <div className="border-2 border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition-all relative">
                      <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-0.5 rounded text-xs font-bold">
                        USD
                      </div>
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-2xl">💵</span>
                        <h5 className="font-bold text-gray-800">Cash App</h5>
                      </div>
                      <input
                        type="text"
                        value={formData.cashAppTag}
                        onChange={(e) => handleChange('cashAppTag', e.target.value)}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-sm"
                        placeholder="$cashtag"
                      />
                      <p className="text-xs text-gray-500 mt-2">Enter your Cash App tag</p>
                    </div>

                    {/* Stripe */}
                    <div className="border-2 border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition-all relative">
                      <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-0.5 rounded text-xs font-bold">
                        USD
                      </div>
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-2xl">🔷</span>
                        <h5 className="font-bold text-gray-800">Stripe</h5>
                      </div>
                      <input
                        type="email"
                        value={formData.stripeEmail}
                        onChange={(e) => handleChange('stripeEmail', e.target.value)}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
                        placeholder="email@example.com"
                      />
                      <p className="text-xs text-gray-500 mt-2">Enter your Stripe email</p>
                    </div>

                    {/* Wise */}
                    <div className="border-2 border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition-all relative">
                      <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-bold">
                        USD
                      </div>
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-2xl">🌍</span>
                        <h5 className="font-bold text-gray-800">Wise</h5>
                      </div>
                      <input
                        type="email"
                        value={formData.wiseEmail}
                        onChange={(e) => handleChange('wiseEmail', e.target.value)}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                        placeholder="email@example.com"
                      />
                      <p className="text-xs text-gray-500 mt-2">Enter your Wise email</p>
                    </div>
                  </div>

                  {/* Nepal Payment Methods */}
                  <div className="border-2 border-green-300 rounded-2xl p-6 bg-gradient-to-br from-green-50 to-emerald-50 relative">
                    {/* NPR Currency Badge */}
                    <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                      <span>🇳🇵</span>
                      <span>NPR</span>
                    </div>
                    
                    <h4 className="font-bold text-gray-800 mb-1 text-lg flex items-center space-x-2">
                      <span>🇳🇵</span>
                      <span>Nepal Payment Options</span>
                    </h4>
                    <p className="text-sm text-gray-600 mb-5">Local payment methods for Nepal</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* eSewa */}
                      <div className="bg-white border-2 border-green-200 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="text-2xl">🇳🇵</span>
                          <h5 className="font-bold text-green-700">eSewa</h5>
                        </div>
                        <input
                          type="text"
                          value={formData.esewaId}
                          onChange={(e) => handleChange('esewaId', e.target.value)}
                          className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-sm"
                          placeholder="eSewa ID"
                        />
                        <p className="text-xs text-gray-500 mt-2">Enter your eSewa ID</p>
                      </div>

                      {/* Khalti */}
                      <div className="bg-white border-2 border-purple-200 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="text-2xl">💜</span>
                          <h5 className="font-bold text-purple-700">Khalti</h5>
                        </div>
                        <input
                          type="text"
                          value={formData.khaltiNumber}
                          onChange={(e) => handleChange('khaltiNumber', e.target.value)}
                          className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
                          placeholder="98XXXXXXXX"
                        />
                        <p className="text-xs text-gray-500 mt-2">Enter your Khalti number</p>
                      </div>

                      {/* FonePay */}
                      <div className="bg-white border-2 border-blue-200 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="text-2xl">📱</span>
                          <h5 className="font-bold text-blue-700">FonePay</h5>
                        </div>
                        <input
                          type="text"
                          value={formData.fonepayNumber}
                          onChange={(e) => handleChange('fonepayNumber', e.target.value)}
                          className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                          placeholder="98XXXXXXXX"
                        />
                        <p className="text-xs text-gray-500 mt-2">Enter your FonePay number</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6">
                    <h4 className="font-bold text-lg mb-4">Order Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Plan:</span>
                        <span className="font-semibold">{planName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Billing:</span>
                        <span className="font-semibold capitalize">{billingCycle}</span>
                      </div>
                      <div className="border-t border-indigo-200 my-3" />
                      <div className="flex justify-between text-lg">
                        <span className="font-bold">Total:</span>
                        <span className="font-bold text-indigo-600">{getCurrency()} {getDisplayPrice()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleBack}
                      className="flex-1 bg-gray-100 text-gray-700 px-6 py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:bg-gray-200 transition-all"
                    >
                      <ArrowLeft size={20} />
                      <span>Back</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:shadow-lg transition-all"
                    >
                      <span>Pay Now</span>
                      <ArrowRight size={20} />
                    </motion.button>
                  </div>
                </motion.form>
              )}

              {currentStep === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-center py-12"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <Check className="text-white" size={48} />
                  </motion.div>
                  
                  <h3 className="text-3xl font-bold mb-4">Payment Successful!</h3>
                  <p className="text-xl text-gray-600 mb-8">
                    Welcome to {planName} Plan
                  </p>
                  
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 max-w-md mx-auto">
                    <p className="text-gray-700 mb-4">
                      A confirmation email has been sent to:
                    </p>
                    <p className="font-semibold text-lg text-indigo-600">
                      {formData.email}
                    </p>
                  </div>

                  <p className="text-sm text-gray-500 mt-6">
                    Redirecting you to dashboard...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};