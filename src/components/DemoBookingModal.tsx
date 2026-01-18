import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, User, Mail, Phone, Building, MessageSquare, Check } from 'lucide-react';

interface DemoBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

export const DemoBookingModal: React.FC<DemoBookingModalProps> = ({ isOpen, onClose, featureName }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    preferredDate: '',
    preferredTime: '',
    message: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Store demo request
    const demoRequests = JSON.parse(localStorage.getItem('demoRequests') || '[]');
    const newRequest = {
      ...formData,
      featureName: featureName || 'General Demo',
      requestDate: new Date().toISOString(),
      status: 'pending'
    };
    demoRequests.push(newRequest);
    localStorage.setItem('demoRequests', JSON.stringify(demoRequests));
    
    setIsSubmitted(true);
    
    // Reset after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        companyName: '',
        preferredDate: '',
        preferredTime: '',
        message: ''
      });
      onClose();
    }, 3000);
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
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
          >
            <X size={24} className="text-gray-600" />
          </button>

          {!isSubmitted ? (
            <div className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl mb-4">
                  <Calendar className="text-white" size={32} />
                </div>
                <h2 className="text-4xl font-bold mb-3">Book a Demo</h2>
                <p className="text-gray-600 text-lg">
                  {featureName ? `Schedule a personalized demo of ${featureName}` : 'Schedule a personalized demo of Serve Spares'}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                        placeholder="+977 98XXXXXXXX"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => handleChange('companyName', e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                      placeholder="Your business name"
                      required
                    />
                  </div>
                </div>

                {/* Preferred Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Preferred Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="date"
                        value={formData.preferredDate}
                        onChange={(e) => handleChange('preferredDate', e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Preferred Time *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <select
                        value={formData.preferredTime}
                        onChange={(e) => handleChange('preferredTime', e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors appearance-none"
                        required
                      >
                        <option value="">Select time</option>
                        <option value="09:00 AM">09:00 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="12:00 PM">12:00 PM</option>
                        <option value="01:00 PM">01:00 PM</option>
                        <option value="02:00 PM">02:00 PM</option>
                        <option value="03:00 PM">03:00 PM</option>
                        <option value="04:00 PM">04:00 PM</option>
                        <option value="05:00 PM">05:00 PM</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Additional Message (Optional)
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-4 text-gray-400" size={20} />
                    <textarea
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors resize-none"
                      rows={4}
                      placeholder="Tell us what you'd like to see in the demo..."
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all"
                >
                  Schedule Demo
                </motion.button>

                {/* Info Note */}
                <p className="text-center text-sm text-gray-500 mt-4">
                  Our team will contact you within 24 hours to confirm your demo appointment
                </p>
              </form>
            </div>
          ) : (
            // Success State
            <div className="p-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6"
              >
                <Check className="text-green-600" size={48} />
              </motion.div>
              <h3 className="text-3xl font-bold mb-3 text-gray-900">Demo Booked Successfully!</h3>
              <p className="text-gray-600 text-lg mb-2">
                Thank you for your interest, {formData.fullName}!
              </p>
              <p className="text-gray-600">
                We've received your demo request for <strong>{formData.preferredDate}</strong> at <strong>{formData.preferredTime}</strong>.
              </p>
              <p className="text-gray-600 mt-4">
                Our team will contact you at <strong>{formData.email}</strong> within 24 hours to confirm.
              </p>
              
              <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200">
                <p className="text-sm text-gray-700">
                  <strong>What's Next?</strong><br />
                  You&apos;ll receive a confirmation email with calendar invite and demo preparation materials.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
