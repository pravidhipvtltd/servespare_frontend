import React, { useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { 
  Package, BarChart3, Users, Truck, Smartphone, Settings,
  DollarSign, ShoppingCart, FileText, Wrench, Shield, Zap,
  Clock, Globe, CheckCircle, Star, Scan, Languages, ArrowRight, Calendar
} from 'lucide-react';
import { useLandingLanguage } from '../../contexts/LandingLanguageContext';
import { DemoBookingModal } from '../DemoBookingModal';

interface FeaturesPageProps {
  onNavigateToPricing?: () => void;
  onNavigateToRegister?: () => void;
}

export const FeaturesPage: React.FC<FeaturesPageProps> = ({ onNavigateToPricing, onNavigateToRegister }) => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string>('');

  const handleBookDemo = (featureName: string) => {
    setSelectedFeature(featureName);
    setIsDemoModalOpen(true);
  };

  const handleGetStarted = () => {
    if (onNavigateToRegister) {
      onNavigateToRegister();
    } else if (onNavigateToPricing) {
      onNavigateToPricing();
    }
  };

  return (
    <div className="pt-20">
      {/* Hero */}
      <HeroSection />
      
      {/* Core Features */}
      <CoreFeatures onBookDemo={handleBookDemo} onGetStarted={handleGetStarted} />
      
      {/* Feature Categories */}
      <FeatureCategories />
      
      {/* Technical Features */}
      <TechnicalFeatures />
      
      {/* Security */}
      <Security />

      {/* Demo Booking Modal */}
      <DemoBookingModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        featureName={selectedFeature}
      />
    </div>
  );
};

const HeroSection: React.FC = () => {
  const { t } = useLandingLanguage();
  
  return (
    <section className="relative min-h-[60vh] flex items-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-white"
        >
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            {t('features.title')}
          </h1>
          <p className="text-2xl max-w-3xl mx-auto leading-relaxed">
            {t('features.subtitle')}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

const CoreFeatures: React.FC<{ onBookDemo: (featureName: string) => void, onGetStarted: () => void }> = ({ onBookDemo, onGetStarted }) => {
  const { t } = useLandingLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const features = [
    {
      icon: <Package />,
      titleKey: 'features.inventory.title',
      descKey: 'features.inventory.desc',
      featureKeys: ['features.inventory.f1', 'features.inventory.f2', 'features.inventory.f3', 'features.inventory.f4'],
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <Scan />,
      titleKey: 'features.barcode.title',
      descKey: 'features.barcode.desc',
      featureKeys: ['features.barcode.f1', 'features.barcode.f2', 'features.barcode.f3', 'features.barcode.f4'],
      color: 'from-green-500 to-green-600'
    },
    {
      icon: <ShoppingCart />,
      titleKey: 'features.orders.title',
      descKey: 'features.orders.desc',
      featureKeys: ['features.orders.f1', 'features.orders.f2', 'features.orders.f3', 'features.orders.f4'],
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: <DollarSign />,
      titleKey: 'features.billing.title',
      descKey: 'features.billing.desc',
      featureKeys: ['features.billing.f1', 'features.billing.f2', 'features.billing.f3', 'features.billing.f4'],
      color: 'from-yellow-500 to-orange-600'
    },
    {
      icon: <Users />,
      titleKey: 'features.roles.title',
      descKey: 'features.roles.desc',
      featureKeys: ['features.roles.f1', 'features.roles.f2', 'features.roles.f3', 'features.roles.f4', 'features.roles.f5'],
      color: 'from-red-500 to-pink-600'
    },
    {
      icon: <BarChart3 />,
      titleKey: 'features.analytics.title',
      descKey: 'features.analytics.desc',
      featureKeys: ['features.analytics.f1', 'features.analytics.f2', 'features.analytics.f3', 'features.analytics.f4'],
      color: 'from-indigo-500 to-purple-600'
    },
  ];

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold">
            {t('features.core.badge')}
          </span>
          <h2 className="text-5xl font-bold mt-6 mb-6">{t('features.core.title')}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('features.core.subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3">{t(feature.titleKey)}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{t(feature.descKey)}</p>
              
              <ul className="space-y-2">
                {feature.featureKeys.map((key, i) => (
                  <li key={i} className="flex items-center space-x-2 text-gray-700">
                    <CheckCircle size={18} className="text-green-500" />
                    <span>{t(key)}</span>
                  </li>
                ))}
              </ul>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-300 flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 bg-white border-2 border-gray-300 text-gray-700 px-4 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:border-indigo-500 hover:text-indigo-600 transition-all"
                  onClick={() => onBookDemo(t(feature.titleKey))}
                >
                  <Calendar size={18} />
                  <span>Book a Demo</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-1 bg-gradient-to-r ${feature.color} text-white px-4 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:shadow-lg transition-all`}
                  onClick={onGetStarted}
                >
                  <span>Get Started</span>
                  <ArrowRight size={18} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FeatureCategories: React.FC = () => {
  const { t } = useLandingLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const categories = [
    {
      titleKey: 'features.cat1.title',
      icon: '📦',
      featureKeys: ['features.cat1.f1', 'features.cat1.f2', 'features.cat1.f3', 'features.cat1.f4', 'features.cat1.f5', 'features.cat1.f6']
    },
    {
      titleKey: 'features.cat2.title',
      icon: '🤝',
      featureKeys: ['features.cat2.f1', 'features.cat2.f2', 'features.cat2.f3', 'features.cat2.f4', 'features.cat2.f5', 'features.cat2.f6']
    },
    {
      titleKey: 'features.cat3.title',
      icon: '🏢',
      featureKeys: ['features.cat3.f1', 'features.cat3.f2', 'features.cat3.f3', 'features.cat3.f4', 'features.cat3.f5', 'features.cat3.f6']
    },
    {
      titleKey: 'features.cat4.title',
      icon: '🌐',
      featureKeys: ['features.cat4.f1', 'features.cat4.f2', 'features.cat4.f3', 'features.cat4.f4', 'features.cat4.f5', 'features.cat4.f6', 'features.cat4.f7', 'features.cat4.f8']
    },
  ];

  return (
    <section ref={ref} className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6">{t('features.categories.title')}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('features.categories.subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              <div className="text-5xl mb-4 text-center">{category.icon}</div>
              <h3 className="text-2xl font-bold mb-6 text-center">{t(category.titleKey)}</h3>
              <ul className="space-y-3">
                {category.featureKeys.map((key, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                    <span className="text-gray-700">{t(key)}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const TechnicalFeatures: React.FC = () => {
  const { t } = useLandingLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const features = [
    { 
      icon: <Zap />, 
      titleKey: 'features.tech1.title', 
      descKey: 'features.tech1.desc',
      color: 'from-yellow-500 to-orange-600'
    },
    { 
      icon: <Languages />, 
      titleKey: 'features.tech2.title', 
      descKey: 'features.tech2.desc',
      color: 'from-green-500 to-emerald-600'
    },
    { 
      icon: <Shield />, 
      titleKey: 'features.tech3.title', 
      descKey: 'features.tech3.desc',
      color: 'from-red-500 to-pink-600'
    },
    { 
      icon: <Smartphone />, 
      titleKey: 'features.tech4.title', 
      descKey: 'features.tech4.desc',
      color: 'from-blue-500 to-indigo-600'
    },
    { 
      icon: <FileText />, 
      titleKey: 'features.tech5.title', 
      descKey: 'features.tech5.desc',
      color: 'from-purple-500 to-violet-600'
    },
    { 
      icon: <Settings />, 
      titleKey: 'features.tech6.title', 
      descKey: 'features.tech6.desc',
      color: 'from-indigo-500 to-blue-600'
    },
  ];

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="bg-purple-100 text-purple-600 px-4 py-2 rounded-full text-sm font-semibold">
            {t('features.technical.badge')}
          </span>
          <h2 className="text-5xl font-bold mt-6 mb-6">{t('features.technical.title')}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('features.technical.subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all text-center"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white mx-auto mb-6`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{t(feature.titleKey)}</h3>
              <p className="text-gray-600">{t(feature.descKey)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Security: React.FC = () => {
  const { t } = useLandingLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const securityFeatures = [
    { icon: <Shield />, titleKey: 'features.security1.title', descKey: 'features.security1.desc' },
    { icon: <Clock />, titleKey: 'features.security2.title', descKey: 'features.security2.desc' },
    { icon: <Globe />, titleKey: 'features.security3.title', descKey: 'features.security3.desc' },
    { icon: <Zap />, titleKey: 'features.security4.title', descKey: 'features.security4.desc' },
  ];

  return (
    <section ref={ref} className="py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16 text-white"
        >
          <h2 className="text-5xl font-bold mb-6">{t('features.security.title')}</h2>
          <p className="text-xl max-w-3xl mx-auto opacity-90">
            {t('features.security.subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {securityFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl text-white text-center"
            >
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{t(feature.titleKey)}</h3>
              <p className="opacity-80">{t(feature.descKey)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};