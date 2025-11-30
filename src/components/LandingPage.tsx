import React, { useState, useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'motion/react';
import { 
  Settings, Package, TrendingUp, Users, Shield, Zap, 
  BarChart3, Wrench, Truck, DollarSign, Clock, CheckCircle,
  ArrowRight, Star, ChevronDown, Menu, X, ChevronRight, Globe
} from 'lucide-react';
import { LoginPage } from './LoginPage';
import { AboutPage } from './landing/AboutPage';
import { FeaturesPage } from './landing/FeaturesPage';
import { PricingPage } from './landing/PricingPage';
import { ContactPage } from './landing/ContactPage';
import { BlogPage } from './landing/BlogPage';
import { ModernFooter } from './landing/ModernFooter';
import { LandingLanguageProvider, useLandingLanguage } from '../contexts/LandingLanguageContext';
import { ModernAuthPage } from './ModernAuthPage';

type PageType = 'home' | 'about' | 'features' | 'pricing' | 'contact' | 'blog';

const LandingPageContent: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const { language } = useLandingLanguage();

  if (showLogin) {
    return <ModernAuthPage initialMode="login" onBack={() => setShowLogin(false)} />;
  }

  if (showRegister) {
    return <ModernAuthPage initialMode="register" onBack={() => setShowRegister(false)} />;
  }

  const handleNavigation = (page: PageType) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation 
        setShowLogin={setShowLogin} 
        setShowRegister={setShowRegister}
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen}
        currentPage={currentPage}
        onNavigate={handleNavigation}
      />
      
      {/* Page Content */}
      {currentPage === 'home' && (
        <>
          <HeroSection setShowLogin={setShowLogin} />
          <FeaturesSection />
          <StatsSection />
          <HowItWorks />
          <Testimonials />
          <CTASection setShowLogin={setShowLogin} />
        </>
      )}
      
      {currentPage === 'about' && <AboutPage />}
      {currentPage === 'features' && <FeaturesPage />}
      {currentPage === 'pricing' && <PricingPage onGetStarted={() => handleNavigation('contact')} />}
      {currentPage === 'contact' && <ContactPage />}
      {currentPage === 'blog' && <BlogPage language={language} />}
      
      {/* Footer */}
      <ModernFooter setShowLogin={setShowLogin} onNavigate={handleNavigation} currentPage={currentPage} />
    </div>
  );
};

export const LandingPage: React.FC = () => {
  return (
    <LandingLanguageProvider>
      <LandingPageContent />
    </LandingLanguageProvider>
  );
};

// Navigation Component
const Navigation: React.FC<{ 
  setShowLogin: (show: boolean) => void;
  setShowRegister: (show: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
}> = ({ setShowLogin, setShowRegister, mobileMenuOpen, setMobileMenuOpen, currentPage, onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);
  const { language, setLanguage, t } = useLandingLanguage();

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: { key: string; page: PageType }[] = [
    { key: 'nav.home', page: 'home' },
    { key: 'nav.about', page: 'about' },
    { key: 'nav.features', page: 'features' },
    { key: 'nav.pricing', page: 'pricing' },
    { key: 'nav.blog', page: 'blog' },
    { key: 'nav.contact', page: 'contact' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button onClick={() => onNavigate('home')} className="flex items-center space-x-3">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center"
            >
              <Settings className="text-white" size={28} />
            </motion.div>
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Serve Spares
              </div>
              <div className="text-xs text-gray-500">Inventory System</div>
            </div>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => onNavigate(link.page)}
                className={`relative text-gray-700 hover:text-indigo-600 font-medium transition-colors ${
                  currentPage === link.page ? 'text-indigo-600' : ''
                }`}
              >
                {t(link.key)}
                {currentPage === link.page && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-indigo-600"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Login Button & Language Switcher */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Switcher - Flags Only */}
            <div className="flex items-center bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setLanguage('en')}
                className={`w-12 h-12 rounded-full transition-all flex items-center justify-center ${
                  language === 'en' 
                    ? 'bg-white shadow-md scale-110' 
                    : 'hover:scale-105'
                }`}
                title="English"
              >
                <span className="text-2xl">🇬🇧</span>
              </button>
              <button
                onClick={() => setLanguage('ne')}
                className={`w-12 h-12 rounded-full transition-all flex items-center justify-center ${
                  language === 'ne' 
                    ? 'bg-white shadow-md scale-110' 
                    : 'hover:scale-105'
                }`}
                title="Nepali"
              >
                <span className="text-2xl">🇳🇵</span>
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowLogin(true)}
              className="text-gray-700 hover:text-indigo-600 px-5 py-2.5 rounded-full font-semibold transition-all border-2 border-gray-200 hover:border-indigo-600"
            >
              {t('nav.login')}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowRegister(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
            >
              Register
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white border-t border-gray-200"
        >
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => onNavigate(link.page)}
                className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                  currentPage === link.page
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t(link.key)}
              </button>
            ))}
            <button
              onClick={() => setShowLogin(true)}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-lg font-semibold"
            >
              {t('nav.login')}
            </button>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

// Hero Section
const HeroSection: React.FC<{ setShowLogin: (show: boolean) => void }> = ({ setShowLogin }) => {
  const { t } = useLandingLanguage();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <motion.section
      ref={heroRef}
      style={{ opacity }}
      className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pt-20"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-indigo-400 rounded-full opacity-20"
            animate={{
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block mb-4"
            >
              <span className="bg-indigo-100 text-indigo-600 px-4 py-2 rounded-full text-sm font-semibold">
                {t('home.badge')}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            >
              {t('home.title1')}
              <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t('home.title2')}
              </span>
              <br />
              {t('home.title3')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-600 mb-8 leading-relaxed"
            >
              {t('home.subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <button
                onClick={() => setShowLogin(true)}
                className="group bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold flex items-center space-x-2 hover:shadow-xl transition-all hover:scale-105"
              >
                <span>{t('home.getStarted')}</span>
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </button>
              <a
                href="#features"
                className="bg-white text-gray-800 px-8 py-4 rounded-full font-semibold border-2 border-gray-200 hover:border-indigo-600 hover:text-indigo-600 transition-all hover:scale-105 flex items-center space-x-2"
              >
                <span>{t('home.learnMore')}</span>
                <ChevronDown size={20} />
              </a>
            </motion.div>

            {/* Mini Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-6 mt-12"
            >
              {[
                { number: '1000+', label: t('home.stats1') },
                { number: '99.9%', label: t('home.stats2') },
                { number: '24/7', label: t('home.stats3') }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <motion.div
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, 3, 0]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="relative z-10"
            >
              <div className="w-full h-[600px] bg-gradient-to-br from-indigo-600 to-purple-800 rounded-[3rem] flex items-center justify-center overflow-hidden shadow-2xl">
                <Settings size={200} className="text-white opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <Settings size={120} />
                    </motion.div>
                    <p className="mt-4 text-2xl font-bold">{t('home.heroTagline1')}</p>
                    <p className="text-xl">{t('home.heroTagline2')}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating Cards */}
            <FloatingCard
              delay={0.5}
              position="top-10 -right-10"
              icon={<Star className="text-yellow-400" />}
              text={t('home.floatingCard1')}
            />
            <FloatingCard
              delay={0.7}
              position="bottom-10 -left-10"
              icon={<TrendingUp className="text-green-500" />}
              text={t('home.floatingCard2')}
            />
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-gray-400"
        >
          <ChevronDown size={32} />
        </motion.div>
      </motion.div>
    </motion.section>
  );
};

// Floating Card Component
const FloatingCard: React.FC<{ delay: number; position: string; icon: React.ReactNode; text: string }> = ({ 
  delay, position, icon, text 
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: 1, 
      scale: 1,
      y: [0, -10, 0]
    }}
    transition={{ 
      opacity: { delay },
      scale: { delay },
      y: { duration: 3, repeat: Infinity, repeatType: "reverse" }
    }}
    className={`absolute ${position} bg-white p-4 rounded-2xl shadow-xl flex items-center space-x-3 z-20`}
  >
    {icon}
    <span className="font-semibold">{text}</span>
  </motion.div>
);

// Features Section
const FeaturesSection: React.FC = () => {
  const { t } = useLandingLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const features = [
    { 
      icon: <Package />, 
      titleKey: 'feature.inventory.title',
      descKey: 'feature.inventory.desc',
      color: 'from-blue-500 to-blue-600' 
    },
    { 
      icon: <BarChart3 />, 
      titleKey: 'feature.analytics.title',
      descKey: 'feature.analytics.desc',
      color: 'from-green-500 to-green-600' 
    },
    { 
      icon: <Users />, 
      titleKey: 'feature.multirole.title',
      descKey: 'feature.multirole.desc',
      color: 'from-purple-500 to-purple-600' 
    },
    { 
      icon: <DollarSign />, 
      titleKey: 'feature.billing.title',
      descKey: 'feature.billing.desc',
      color: 'from-yellow-500 to-orange-600' 
    },
    { 
      icon: <Truck />, 
      titleKey: 'feature.supplier.title',
      descKey: 'feature.supplier.desc',
      color: 'from-red-500 to-pink-600' 
    },
    { 
      icon: <Shield />, 
      titleKey: 'feature.secure.title',
      descKey: 'feature.secure.desc',
      color: 'from-indigo-500 to-purple-600' 
    },
  ];

  return (
    <section id="features" ref={ref} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="bg-indigo-100 text-indigo-600 px-4 py-2 rounded-full text-sm font-semibold">
            {t('features.badge')}
          </span>
          <h2 className="text-5xl font-bold mt-6 mb-6">{t('features.title')}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('features.subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3">{t(feature.titleKey)}</h3>
              <p className="text-gray-600 leading-relaxed">{t(feature.descKey)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Stats Section
const StatsSection: React.FC = () => {
  const { t } = useLandingLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const stats = [
    { icon: <Package />, number: '50,000+', labelKey: 'stats.parts', color: 'from-blue-500 to-blue-600' },
    { icon: <Users />, number: '5', labelKey: 'stats.roles', color: 'from-purple-500 to-purple-600' },
    { icon: <Zap />, number: '8', labelKey: 'stats.languages', color: 'from-green-500 to-green-600' },
    { icon: <Clock />, number: '24/7', labelKey: 'stats.sync', color: 'from-orange-500 to-red-600' },
  ];

  return (
    <section ref={ref} className="py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: index * 0.1 }}
              className="text-center text-white"
            >
              <div className="flex justify-center mb-4">
                <div className={`w-20 h-20 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                  {stat.icon}
                </div>
              </div>
              <div className="text-5xl font-bold mb-2">{stat.number}</div>
              <div className="text-xl opacity-90">{t(stat.labelKey)}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// How It Works Section
const HowItWorks: React.FC = () => {
  const { t } = useLandingLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const steps = [
    { number: '1', titleKey: 'howitworks.step1.title', descKey: 'howitworks.step1.desc', icon: <Users /> },
    { number: '2', titleKey: 'howitworks.step2.title', descKey: 'howitworks.step2.desc', icon: <Package /> },
    { number: '3', titleKey: 'howitworks.step3.title', descKey: 'howitworks.step3.desc', icon: <Settings /> },
    { number: '4', titleKey: 'howitworks.step4.title', descKey: 'howitworks.step4.desc', icon: <TrendingUp /> },
  ];

  return (
    <section id="how-it-works" ref={ref} className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="bg-indigo-100 text-indigo-600 px-4 py-2 rounded-full text-sm font-semibold">
            {t('howitworks.badge')}
          </span>
          <h2 className="text-5xl font-bold mt-6 mb-6">{t('howitworks.title')}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('howitworks.subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.15 }}
              className="relative"
            >
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                  {step.number}
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white mx-auto mb-4">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{t(step.titleKey)}</h3>
                <p className="text-gray-600">{t(step.descKey)}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <ChevronRight className="text-indigo-300" size={32} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Testimonials Section
const Testimonials: React.FC = () => {
  const { t } = useLandingLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const testimonials = [
    { 
      nameKey: 'testimonials.1.name',
      roleKey: 'testimonials.1.role',
      textKey: 'testimonials.1.text',
      rating: 5,
      avatar: '👨‍💼'
    },
    { 
      nameKey: 'testimonials.2.name',
      roleKey: 'testimonials.2.role',
      textKey: 'testimonials.2.text',
      rating: 5,
      avatar: '👩‍💼'
    },
    { 
      nameKey: 'testimonials.3.name',
      roleKey: 'testimonials.3.role',
      textKey: 'testimonials.3.text',
      rating: 5,
      avatar: '����‍🔧'
    },
  ];

  return (
    <section id="testimonials" ref={ref} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="bg-indigo-100 text-indigo-600 px-4 py-2 rounded-full text-sm font-semibold">
            {t('testimonials.badge')}
          </span>
          <h2 className="text-5xl font-bold mt-6 mb-6">{t('testimonials.title')}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={20} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic leading-relaxed">\"{t(testimonial.textKey)}\"</p>
              <div className="flex items-center space-x-3">
                <div className="text-4xl">{testimonial.avatar}</div>
                <div>
                  <div className="font-bold">{t(testimonial.nameKey)}</div>
                  <div className="text-sm text-gray-600">{t(testimonial.roleKey)}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA Section
const CTASection: React.FC<{ setShowLogin: (show: boolean) => void }> = ({ setShowLogin }) => {
  const { t } = useLandingLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 opacity-10"
      >
        <div className="w-full h-full" style={{ 
          backgroundImage: 'radial-gradient(circle, white 2px, transparent 2px)',
          backgroundSize: '50px 50px'
        }} />
      </motion.div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl font-bold text-white mb-6">
            {t('cta.title')}
          </h2>
          <p className="text-2xl text-white/90 mb-10">
            {t('cta.subtitle')}
          </p>
          
          <button
            onClick={() => setShowLogin(true)}
            className="bg-white text-indigo-600 px-12 py-5 rounded-full font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center space-x-2"
          >
            <span>{t('home.getStarted')}</span>
            <ArrowRight size={24} />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

// Footer
const Footer: React.FC<{ setShowLogin: (show: boolean) => void; onNavigate: (page: PageType) => void }> = ({ setShowLogin, onNavigate }) => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Settings size={28} />
              </div>
              <div>
                <div className="text-2xl font-bold">Serve Spares</div>
                <div className="text-sm text-gray-400">Inventory System</div>
              </div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Complete inventory management solution for two-wheelers and four-wheelers with multi-role access, real-time sync, and comprehensive features.
            </p>
            <div className="flex space-x-4">
              {['🇳🇵', '🇮🇳', '🇱🇰', '🇧🇩'].map((flag, index) => (
                <div key={index} className="text-3xl">{flag}</div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Reviews</a></li>
              <li>
                <button onClick={() => setShowLogin(true)} className="text-gray-300 hover:text-white transition-colors">
                  Login
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <ul className="space-y-3 text-gray-300">
              <li>📧 support@servespares.com</li>
              <li>📞 +977 1234567890</li>
              <li>📍 Kathmandu, Nepal</li>
              <li>🕐 24/7 Support</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-300">© {new Date().getFullYear()} Serve Spares. All rights reserved.</p>
          <div className="flex space-x-6 text-gray-300">
            <span>🔒 Secure</span>
            <span>✓ Reliable</span>
            <span>⚡ Fast</span>
          </div>
        </div>
      </div>

      {/* Gradient Bottom Bar */}
      <div className="h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>
    </footer>
  );
};