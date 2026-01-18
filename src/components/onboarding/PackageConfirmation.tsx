import React from 'react';
import { Check, ArrowLeft, ArrowRight, Package, Users, Database, Zap, Shield } from 'lucide-react';

interface PackageData {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  features: string[];
  description: string;
}

interface PackageConfirmationProps {
  selectedPackage: PackageData;
  adminEmail: string;
  onConfirm: () => void;
  onBack: () => void;
}

export const PackageConfirmation: React.FC<PackageConfirmationProps> = ({
  selectedPackage,
  adminEmail,
  onConfirm,
  onBack
}) => {
  const getPackageHighlights = (packageId: string) => {
    switch (packageId) {
      case 'basic':
        return [
          { icon: Package, label: 'Up to 500 Products', color: 'text-blue-600' },
          { icon: Users, label: '2 User Accounts', color: 'text-blue-600' },
          { icon: Database, label: '5GB Storage', color: 'text-blue-600' }
        ];
      case 'professional':
        return [
          { icon: Package, label: 'Up to 2000 Products', color: 'text-purple-600' },
          { icon: Users, label: '5 User Accounts', color: 'text-purple-600' },
          { icon: Database, label: '20GB Storage', color: 'text-purple-600' },
          { icon: Zap, label: 'Advanced Features', color: 'text-purple-600' }
        ];
      case 'enterprise':
        return [
          { icon: Package, label: 'Unlimited Products', color: 'text-orange-600' },
          { icon: Users, label: 'Unlimited Users', color: 'text-orange-600' },
          { icon: Database, label: '100GB Storage', color: 'text-orange-600' },
          { icon: Shield, label: 'Priority Support', color: 'text-orange-600' }
        ];
      default:
        return [];
    }
  };

  const highlights = getPackageHighlights(selectedPackage.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-4">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Confirm Your Selection
          </h1>
          <p className="text-gray-600">
            Review your package details before proceeding to payment
          </p>
        </div>

        {/* Package Summary Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Package Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-600 p-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold mb-2">{selectedPackage.name} Plan</h2>
                <p className="text-orange-100">{selectedPackage.description}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-orange-100 mb-1">Total Amount</div>
                <div className="text-4xl font-bold">
                  {selectedPackage.currency} {selectedPackage.price.toLocaleString()}
                </div>
                <div className="text-sm text-orange-100">per {selectedPackage.period}</div>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="p-8 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Account Information</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Email Address:</span>
                <span className="font-semibold text-gray-900">{adminEmail}</span>
              </div>
            </div>
          </div>

          {/* Key Highlights */}
          <div className="p-8 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Key Highlights</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {highlights.map((highlight, index) => {
                const Icon = highlight.icon;
                return (
                  <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                    <Icon className={`w-8 h-8 ${highlight.color} mx-auto mb-2`} />
                    <p className="text-sm text-gray-700">{highlight.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* All Features */}
          <div className="p-8">
            <h3 className="font-semibold text-gray-900 mb-4">All Features Included</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedPackage.features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trial Info */}
          <div className="bg-blue-50 border-t border-blue-200 p-6">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">14-Day Free Trial Included</h4>
                <p className="text-sm text-blue-700">
                  Try all features risk-free. You won&apos;t be charged until the trial period ends. 
                  Cancel anytime during the trial at no cost.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="bg-white rounded-xl p-6 mb-8 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Terms & Conditions</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start space-x-2">
              <span className="text-orange-600 font-bold">•</span>
              <span>Payment will be processed through eSewa or FonePay payment gateway</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-orange-600 font-bold">•</span>
              <span>Subscription auto-renews monthly unless cancelled</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-orange-600 font-bold">•</span>
              <span>You can upgrade or downgrade your plan anytime</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-orange-600 font-bold">•</span>
              <span>Full refund available if cancelled within 14 days</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Plans</span>
          </button>
          <button
            onClick={onConfirm}
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <span>Proceed to Payment</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
