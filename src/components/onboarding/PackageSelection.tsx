import React, { useState } from 'react';
import { Check, Star, TrendingUp, Zap, Crown, ArrowRight, X } from 'lucide-react';

interface Package {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  features: string[];
  recommended?: boolean;
  icon: any;
  color: string;
  description: string;
}

const PACKAGES: Package[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 2500,
    currency: 'NPR',
    period: 'month',
    description: 'Perfect for small shops and startups',
    icon: Star,
    color: 'from-blue-500 to-cyan-600',
    features: [
      'Up to 500 products',
      'Single branch management',
      '2 user accounts',
      'Basic inventory tracking',
      'Sales reports',
      'Email support',
      'Mobile responsive',
      '5GB storage'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 5000,
    currency: 'NPR',
    period: 'month',
    description: 'Ideal for growing businesses',
    icon: TrendingUp,
    color: 'from-purple-500 to-indigo-600',
    recommended: true,
    features: [
      'Up to 2000 products',
      'Multi-branch management (up to 3)',
      '5 user accounts',
      'Advanced inventory tracking',
      'Low stock alerts',
      'Detailed sales & profit reports',
      'Priority email support',
      'Mobile app access',
      'Barcode scanner',
      '20GB storage',
      'Customer management',
      'Vendor management'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 10000,
    currency: 'NPR',
    period: 'month',
    description: 'Complete solution for large operations',
    icon: Crown,
    color: 'from-orange-500 to-red-600',
    features: [
      'Unlimited products',
      'Unlimited branches',
      'Unlimited user accounts',
      'Advanced analytics & insights',
      'Real-time inventory sync',
      'Custom reports & exports',
      '24/7 priority support',
      'Dedicated account manager',
      'API access',
      'Custom integrations',
      'Advanced security features',
      '100GB storage',
      'Multi-currency support',
      'Advanced party management',
      'Purchase order management'
    ]
  }
];

interface PackageSelectionProps {
  adminEmail: string;
  onPackageSelected: (pkg: Package) => void;
  onCancel: () => void;
}

export const PackageSelection: React.FC<PackageSelectionProps> = ({
  adminEmail,
  onPackageSelected,
  onCancel
}) => {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [hoveredPackage, setHoveredPackage] = useState<string | null>(null);

  const handleSelectPackage = (pkg: Package) => {
    setSelectedPackage(pkg);
  };

  const handleContinue = () => {
    if (selectedPackage) {
      onPackageSelected(selectedPackage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Welcome, {adminEmail}
          </p>
          <p className="text-gray-500">
            Select a package that fits your business needs
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {PACKAGES.map((pkg) => {
            const Icon = pkg.icon;
            const isSelected = selectedPackage?.id === pkg.id;
            const isHovered = hoveredPackage === pkg.id;

            return (
              <div
                key={pkg.id}
                onMouseEnter={() => setHoveredPackage(pkg.id)}
                onMouseLeave={() => setHoveredPackage(null)}
                onClick={() => handleSelectPackage(pkg)}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? 'ring-4 ring-orange-500 scale-105'
                    : isHovered
                    ? 'scale-105 shadow-xl'
                    : ''
                } ${pkg.recommended ? 'md:-mt-4 md:mb-4' : ''}`}
              >
                {/* Recommended Badge */}
                {pkg.recommended && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                    Recommended
                  </div>
                )}

                {/* Selected Badge */}
                {isSelected && (
                  <div className="absolute top-4 left-4 bg-green-500 text-white rounded-full p-1">
                    <Check className="w-5 h-5" />
                  </div>
                )}

                {/* Header */}
                <div className={`bg-gradient-to-r ${pkg.color} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                  <p className="text-white/90 text-sm mb-4">{pkg.description}</p>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold">
                      {pkg.currency} {pkg.price.toLocaleString()}
                    </span>
                    <span className="ml-2 text-white/80">/{pkg.period}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="p-6">
                  <ul className="space-y-3">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Select Button */}
                <div className="p-6 pt-0">
                  <button
                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                      isSelected
                        ? 'bg-green-600 text-white'
                        : `bg-gradient-to-r ${pkg.color} text-white hover:opacity-90`
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Select Plan'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={onCancel}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <X className="w-5 h-5" />
            <span>Cancel</span>
          </button>
          <button
            onClick={handleContinue}
            disabled={!selectedPackage}
            className={`px-8 py-3 rounded-lg font-semibold transition-all flex items-center space-x-2 ${
              selectedPackage
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span>Continue to Confirmation</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>All plans include 14-day free trial • Cancel anytime • No hidden fees</p>
        </div>
      </div>
    </div>
  );
};
