import React, { useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { Check, X, Zap, Star, Crown, Sparkles } from 'lucide-react';
import { useLandingLanguage } from '../../contexts/LandingLanguageContext';

interface PricingPageProps {
  onGetStarted: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onGetStarted }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="pt-20">
      {/* Hero */}
      <HeroSection billingCycle={billingCycle} setBillingCycle={setBillingCycle} />
      
      {/* Pricing Cards */}
      <PricingCards billingCycle={billingCycle} onGetStarted={onGetStarted} />
      
      {/* FAQ */}
      <FAQ />
      
      {/* CTA */}
      <CTA onGetStarted={onGetStarted} />
    </div>
  );
};

const HeroSection: React.FC<{ billingCycle: string; setBillingCycle: (cycle: 'monthly' | 'yearly') => void }> = ({ 
  billingCycle, 
  setBillingCycle 
}) => {
  const { t } = useLandingLanguage();
  
  return (
    <section className="relative min-h-[50vh] flex items-center bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{ 
          backgroundImage: 'radial-gradient(circle, white 2px, transparent 2px)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-white"
        >
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            {t('pricing.title')}
          </h1>
          <p className="text-2xl mb-10 max-w-3xl mx-auto">
            {t('pricing.subtitle')}
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full p-2">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-8 py-3 rounded-full font-semibold transition-all ${
                billingCycle === 'monthly' 
                  ? 'bg-white text-blue-600 shadow-lg' 
                  : 'text-white hover:text-white/80'
              }`}
            >
              {t('pricing.monthly')}
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-8 py-3 rounded-full font-semibold transition-all relative ${
                billingCycle === 'yearly' 
                  ? 'bg-white text-blue-600 shadow-lg' 
                  : 'text-white hover:text-white/80'
              }`}
            >
              {t('pricing.yearly')}
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-blue-900 text-xs px-2 py-1 rounded-full font-bold">
                {t('pricing.save')}
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const PricingCards: React.FC<{ billingCycle: string; onGetStarted: () => void }> = ({ billingCycle, onGetStarted }) => {
  const { t } = useLandingLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const plans = [
    {
      nameKey: 'pricing.plan.starter',
      icon: <Zap />,
      descKey: 'pricing.starter.desc',
      monthlyPrice: 2999,
      yearlyPrice: 28990,
      color: 'from-blue-500 to-blue-600',
      popular: false,
      features: [
        { key: 'pricing.starter.f1', included: true },
        { key: 'pricing.starter.f2', included: true },
        { key: 'pricing.starter.f3', included: true },
        { key: 'pricing.starter.f4', included: true },
        { key: 'pricing.starter.f5', included: true },
        { key: 'pricing.starter.f6', included: true },
        { key: 'pricing.starter.f7', included: false },
        { key: 'pricing.starter.f8', included: false },
        { key: 'pricing.starter.f9', included: false },
      ]
    },
    {
      nameKey: 'pricing.plan.professional',
      icon: <Star />,
      descKey: 'pricing.professional.desc',
      monthlyPrice: 5999,
      yearlyPrice: 57590,
      color: 'from-purple-500 to-purple-600',
      popular: true,
      features: [
        { key: 'pricing.professional.f1', included: true },
        { key: 'pricing.professional.f2', included: true },
        { key: 'pricing.professional.f3', included: true },
        { key: 'pricing.professional.f4', included: true },
        { key: 'pricing.professional.f5', included: true },
        { key: 'pricing.professional.f6', included: true },
        { key: 'pricing.professional.f7', included: true },
        { key: 'pricing.professional.f8', included: true },
        { key: 'pricing.professional.f9', included: true },
      ]
    },
    {
      nameKey: 'pricing.plan.enterprise',
      icon: <Crown />,
      descKey: 'pricing.enterprise.desc',
      monthlyPrice: 14999,
      yearlyPrice: 143990,
      color: 'from-orange-500 to-red-600',
      popular: false,
      features: [
        { key: 'pricing.enterprise.f1', included: true },
        { key: 'pricing.enterprise.f2', included: true },
        { key: 'pricing.enterprise.f3', included: true },
        { key: 'pricing.enterprise.f4', included: true },
        { key: 'pricing.enterprise.f5', included: true },
        { key: 'pricing.enterprise.f6', included: true },
        { key: 'pricing.enterprise.f7', included: true },
        { key: 'pricing.enterprise.f8', included: true },
        { key: 'pricing.enterprise.f9', included: true },
        { key: 'pricing.enterprise.f10', included: true },
        { key: 'pricing.enterprise.f11', included: true },
      ]
    },
  ];

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all ${
                plan.popular ? 'ring-4 ring-purple-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center space-x-2">
                    <Sparkles size={16} />
                    <span>{t('pricing.popular')}</span>
                  </span>
                </div>
              )}

              <div className={`w-16 h-16 bg-gradient-to-br ${plan.color} rounded-2xl flex items-center justify-center text-white mb-6`}>
                {plan.icon}
              </div>

              <h3 className="text-3xl font-bold mb-2">{t(plan.nameKey)}</h3>
              <p className="text-gray-600 mb-6">{t(plan.descKey)}</p>

              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-xl">NPR </span>
                  <span className="text-5xl font-bold ml-2">
                    {billingCycle === 'monthly' ? plan.monthlyPrice.toLocaleString() : plan.yearlyPrice.toLocaleString()}
                  </span>
                  <span className="text-gray-600 ml-2">
                    /{billingCycle === 'monthly' ? t('pricing.month') : t('pricing.year')}
                  </span>
                </div>
                {billingCycle === 'yearly' && (
                  <p className="text-sm text-green-600 mt-2">
                    {t('pricing.save.yearly')} {((plan.monthlyPrice * 12) - plan.yearlyPrice).toLocaleString()}{t('pricing.peryear')}
                  </p>
                )}
              </div>

              <button
                onClick={onGetStarted}
                className={`block w-full text-center px-6 py-4 rounded-full font-semibold transition-all mb-8 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:scale-105'
                    : 'bg-white text-gray-800 border-2 border-gray-300 hover:border-purple-600'
                }`}
              >
                {t('pricing.getstarted')}
              </button>

              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center space-x-3">
                    {feature.included ? (
                      <Check size={20} className="text-green-500 flex-shrink-0" />
                    ) : (
                      <X size={20} className="text-gray-300 flex-shrink-0" />
                    )}
                    <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                      {t(feature.key)}
                    </span>
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

const FAQ: React.FC = () => {
  const { t } = useLandingLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const faqs = [
    { questionKey: 'pricing.faq.q1', answerKey: 'pricing.faq.a1' },
    { questionKey: 'pricing.faq.q2', answerKey: 'pricing.faq.a2' },
    { questionKey: 'pricing.faq.q3', answerKey: 'pricing.faq.a3' },
    { questionKey: 'pricing.faq.q4', answerKey: 'pricing.faq.a4' },
    { questionKey: 'pricing.faq.q5', answerKey: 'pricing.faq.a5' },
    { questionKey: 'pricing.faq.q6', answerKey: 'pricing.faq.a6' },
  ];

  return (
    <section ref={ref} className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6">{t('pricing.faq.title')}</h2>
          <p className="text-xl text-gray-600">
            {t('pricing.faq.subtitle')}
          </p>
        </motion.div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 hover:shadow-lg transition-all"
            >
              <h3 className="text-xl font-bold mb-3">{t(faq.questionKey)}</h3>
              <p className="text-gray-600 leading-relaxed">{t(faq.answerKey)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTA: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  const { t } = useLandingLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-20 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
        >
          <h2 className="text-5xl font-bold text-white mb-6">
            {t('pricing.cta.title')}
          </h2>
          <p className="text-2xl text-white/90 mb-10">
            {t('pricing.cta.subtitle')}
          </p>
          <button
            onClick={onGetStarted}
            className="inline-block bg-white text-blue-600 px-10 py-5 rounded-full font-bold text-lg hover:shadow-2xl transition-all hover:scale-105"
          >
            {t('pricing.cta.button')}
          </button>
        </motion.div>
      </div>
    </section>
  );
};
