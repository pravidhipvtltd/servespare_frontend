import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useInView,
} from "motion/react";
import {
  Menu,
  X,
  LogIn,
  UserPlus,
  Settings,
  Globe,
  Package,
  BarChart3,
  Users,
  DollarSign,
  Truck,
  Shield,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Star,
  TrendingUp,
  Zap,
  Clock,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Check,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Download,
} from "lucide-react";
import {
  useLandingLanguage,
  LandingLanguageProvider,
} from "../contexts/LandingLanguageContext";
import { AboutPage } from "./landing/AboutPage";
import { FeaturesPage } from "./landing/FeaturesPage";
import { PricingPage } from "./landing/PricingPage";
import { ContactPage } from "./landing/ContactPage";
import { BlogPage } from "./landing/BlogPage";
import { DownloadPage } from "./landing/DownloadPage";
import { DemoBookingModal } from "./DemoBookingModal";
import { ModernAuthPage } from "./ModernAuthPage";
import { FloatingDownloadButton } from "./FloatingDownloadButton";

type PageType =
  | "home"
  | "about"
  | "features"
  | "pricing"
  | "contact"
  | "blog"
  | "download";

interface LandingPageProps {
  onBackToEntry: () => void;
}

const LandingPageContent: React.FC<LandingPageProps> = ({ onBackToEntry }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string>("");
  const { language } = useLandingLanguage();

  // Determine current page from URL path
  const getCurrentPage = (): PageType => {
    const path = location.pathname.split("/").pop();
    if (!path || path === "admin") return "home";
    if (path === "login" || path === "register") return "home"; // Login/Register is overlay on home
    return path as PageType;
  };

  const currentPage = getCurrentPage();

  // Handle direct navigation to login/register
  useEffect(() => {
    if (location.pathname.endsWith("/login")) {
      setShowLogin(true);
      setShowRegister(false);
    } else if (location.pathname.endsWith("/register")) {
      setShowRegister(true);
      setShowLogin(false);
    } else {
      setShowLogin(false);
      setShowRegister(false);
    }
  }, [location]);

  // Listen for navigation events from feature cards
  useEffect(() => {
    const handleNavigateToContact = () => {
      handleNavigation("contact");
    };

    window.addEventListener("navigateToContact", handleNavigateToContact);
    return () =>
      window.removeEventListener("navigateToContact", handleNavigateToContact);
  }, []);

  if (showLogin) {
    return (
      <ModernAuthPage
        initialMode="login"
        onBack={() => {
          navigate(-1);
        }}
      />
    );
  }

  if (showRegister) {
    return (
      <ModernAuthPage
        initialMode="register"
        onBack={() => {
          navigate(-1);
        }}
      />
    );
  }

  const handleNavigation = (page: PageType) => {
    if (page === "home") {
      navigate("/admin");
    } else {
      navigate(`/admin/${page}`);
    }
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogin = () => navigate("/admin/login");
  const handleRegister = () => navigate("/admin/register");

  const handleBookDemo = (featureName: string) => {
    setSelectedFeature(featureName);
    setIsDemoModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation
        onLogin={handleLogin}
        onRegister={handleRegister}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        currentPage={currentPage}
        onNavigate={handleNavigation}
        onBackToEntry={onBackToEntry}
      />

      {/* Page Content */}
      {currentPage === "home" && (
        <>
          <HeroSection
            onRegister={handleRegister}
            onNavigateToDownload={() => handleNavigation("download")}
          />
          <FeaturesSection onBookDemo={handleBookDemo} />
          <StatsSection />
          <HowItWorks />
          <Testimonials />
          <CTASection onNavigateToPricing={() => handleNavigation("pricing")} />
        </>
      )}

      {currentPage === "about" && <AboutPage />}
      {currentPage === "features" && (
        <FeaturesPage
          onNavigateToPricing={() => handleNavigation("pricing")}
          onNavigateToRegister={handleRegister}
        />
      )}
      {currentPage === "pricing" && (
        <PricingPage onGetStarted={() => handleBookDemo("Start Free Trial")} />
      )}
      {currentPage === "contact" && <ContactPage />}
      {currentPage === "blog" && <BlogPage language={language} />}
      {currentPage === "download" && <DownloadPage />}

      {/* Demo Booking Modal */}
      <DemoBookingModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        featureName={selectedFeature}
      />

      {/* Footer */}
      <Footer
        onLogin={handleLogin}
        onNavigate={handleNavigation}
        currentPage={currentPage}
      />
    </div>
  );
};

export const LandingPage: React.FC<{ onBackToEntry?: () => void }> = ({
  onBackToEntry,
}) => {
  const handleBackToEntry = () => {
    if (onBackToEntry) {
      onBackToEntry();
    } else {
      // Navigate to root/home page
      window.location.href = "/";
    }
  };

  return (
    <LandingLanguageProvider>
      <LandingPageContent onBackToEntry={handleBackToEntry} />
      {/* Floating Download Button - Shows on scroll */}
      <FloatingDownloadButton showOnScroll={true} />
    </LandingLanguageProvider>
  );
};

// Navigation Component
const Navigation: React.FC<{
  onLogin: () => void;
  onRegister: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  onBackToEntry: () => void;
}> = ({
  onLogin,
  onRegister,
  mobileMenuOpen,
  setMobileMenuOpen,
  currentPage,
  onNavigate,
  onBackToEntry,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const { language, setLanguage, t, languageNames, languageFlags } =
    useLandingLanguage();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks: { key: string; page: PageType }[] = [
    { key: "nav.home", page: "home" },
    { key: "nav.about", page: "about" },
    { key: "nav.features", page: "features" },
    { key: "nav.pricing", page: "pricing" },
    { key: "nav.blog", page: "blog" },
    { key: "nav.contact", page: "contact" },
    { key: "nav.download", page: "download" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-lg" : "bg-white/95 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Back Button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onBackToEntry}
              className="text-gray-400 hover:text-amber-600 transition-colors p-2 hover:bg-gray-50 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => onNavigate("home")}
              className="flex items-center space-x-3"
            >
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
          </div>

          {/* Desktop Navigation */}
          <div className="flex md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => onNavigate(link.page)}
                className={`relative text-gray-700 hover:text-indigo-600 font-medium transition-colors ${
                  currentPage === link.page ? "text-indigo-600" : ""
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
            {/* Language Dropdown Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="flex items-center space-x-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-all border-2 border-gray-200 hover:border-indigo-600"
              >
                <Globe size={18} className="text-gray-600" />
                <span className="font-semibold text-gray-700">
                  {languageNames[language]}
                </span>
                <ChevronDown size={16} className="text-gray-600" />
              </button>

              {showLanguageDropdown && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-50 overflow-hidden max-h-96 overflow-y-auto"
                  >
                    {(
                      Object.keys(languageNames) as Array<
                        keyof typeof languageNames
                      >
                    ).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setLanguage(lang);
                          setShowLanguageDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-indigo-50 transition-colors flex items-center space-x-3 ${
                          language === lang ? "bg-indigo-100" : ""
                        }`}
                      >
                        <span className="text-2xl">{languageFlags[lang]}</span>
                        <span className="font-medium text-gray-700">
                          {languageNames[lang]}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLogin}
              className=" bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg px-5 py-2.5 rounded-full font-semibold transition-all border-2 border-gray-200 hover:border-indigo-600"
            >
              {t("nav.login")}
            </motion.button>

            {/* <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRegister}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
            >
              {t("button.register")}
            </motion.button> */}
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
          animate={{ opacity: 1, height: "auto" }}
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
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {t(link.key)}
              </button>
            ))}
            <button
              onClick={onLogin}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-lg font-semibold"
            >
              {t("nav.login")}
            </button>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

// HeroSection
// Hero Section
const HeroSection: React.FC<{
  onRegister: () => void;
  onNavigateToDownload: () => void;
}> = ({ onRegister, onNavigateToDownload }) => {
  const { t } = useLandingLanguage();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
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
              x: [
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth,
              ],
              y: [
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight,
              ],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
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
                {t("home.badge")}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            >
              {t("home.title1")}
              <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t("home.title2")}
              </span>
              <br />
              {t("home.title3")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-600 mb-8 leading-relaxed"
            >
              {t("home.subtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <button
                onClick={onRegister}
                className="group bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold flex items-center space-x-2 hover:shadow-xl transition-all hover:scale-105"
              >
                <span>{t("button.getStarted")}</span>
                <ArrowRight
                  className="group-hover:translate-x-1 transition-transform"
                  size={20}
                />
              </button>
              <a
                href="#features"
                className="bg-white text-gray-800 px-8 py-4 rounded-full font-semibold border-2 border-gray-200 hover:border-indigo-600 hover:text-indigo-600 transition-all hover:scale-105 flex items-center space-x-2"
              >
                <span>{t("home.learnMore")}</span>
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
                { number: "1000+", label: t("home.stats1") },
                { number: "99.9%", label: t("home.stats2") },
                { number: "24/7", label: t("home.stats3") },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">
                    {stat.number}
                  </div>
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
                rotate: [0, 3, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="relative z-10"
            >
              <div className="w-full h-[600px] bg-gradient-to-br from-indigo-600 to-purple-800 rounded-[3rem] flex items-center justify-center overflow-hidden shadow-2xl">
                {/* Video Player - Auto Parts / Motorcycle Workshop */}
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="absolute inset-0 w-full h-full object-cover opacity-75"
                  style={{
                    filter: "brightness(1.1) contrast(1.05) saturate(1.1)",
                  }}
                  poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Crect fill='%235b21b6' width='600' height='600'/%3E%3C/svg%3E"
                >
                  {/* Auto Parts & Motorcycle Workshop Videos - Multiple Options */}

                  {/* Option 1: Mechanic fixing motorcycle engine - HIGH QUALITY */}
                  <source
                    src="https://videos.pexels.com/video-files/6894242/6894242-uhd_2560_1440_25fps.mp4"
                    type="video/mp4"
                  />

                  {/* Option 2: Auto parts warehouse/shelves */}
                  <source
                    src="https://videos.pexels.com/video-files/5524997/5524997-uhd_2560_1440_25fps.mp4"
                    type="video/mp4"
                  />

                  {/* Option 3: Mechanic working on car engine */}
                  <source
                    src="https://videos.pexels.com/video-files/4324074/4324074-uhd_3840_2160_24fps.mp4"
                    type="video/mp4"
                  />

                  {/* Option 4: Auto repair shop - mechanic with tools */}
                  <source
                    src="https://videos.pexels.com/video-files/3044140/3044140-hd_1920_1080_30fps.mp4"
                    type="video/mp4"
                  />

                  {/* Option 5: Motorcycle mechanic working */}
                  <source
                    src="https://videos.pexels.com/video-files/7579954/7579954-uhd_2560_1440_25fps.mp4"
                    type="video/mp4"
                  />

                  {/* Option 6: Car parts close-up */}
                  <source
                    src="https://videos.pexels.com/video-files/3044841/3044841-hd_1920_1080_30fps.mp4"
                    type="video/mp4"
                  />

                  {/* Fallback for browsers that don't support video */}
                  <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-800 flex items-center justify-center">
                    <Settings size={120} className="text-white opacity-30" />
                  </div>
                </video>

                {/* Enhanced Overlay gradient for cinematic effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-purple-900/40 to-pink-900/50" />

                {/* Vignette effect for better focus */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.3) 100%)",
                  }}
                />

                {/* Floating text overlay with enhanced styling */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="text-center text-white px-6">
                    <motion.div
                      animate={{
                        scale: [1, 1.08, 1],
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="mb-6"
                    >
                      <Settings
                        size={90}
                        className="mx-auto drop-shadow-2xl filter brightness-110"
                      />
                    </motion.div>
                    <motion.p
                      className="mt-4 text-4xl font-bold drop-shadow-2xl"
                      animate={{ opacity: [0.9, 1, 0.9] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {t("home.heroTagline1")}
                    </motion.p>
                    <motion.p
                      className="text-3xl drop-shadow-2xl font-semibold"
                      animate={{ opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    >
                      {t("home.heroTagline2")}
                    </motion.p>
                    <p className="text-base mt-6 opacity-95 drop-shadow-lg font-medium tracking-wide">
                      {t("hero.subtitle2")}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating Cards */}
            <FloatingCard
              delay={0.5}
              position="top-10 -right-10"
              icon={<Star className="text-yellow-400" />}
              text={t("home.floatingCard1")}
            />
            <FloatingCard
              delay={0.7}
              position="bottom-10 -left-10"
              icon={<TrendingUp className="text-green-500" />}
              text={t("home.floatingCard2")}
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
const FloatingCard: React.FC<{
  delay: number;
  position: string;
  icon: React.ReactNode;
  text: string;
}> = ({ delay, position, icon, text }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: 1,
      scale: 1,
      y: [0, -10, 0],
    }}
    transition={{
      opacity: { delay },
      scale: { delay },
      y: { duration: 3, repeat: Infinity, repeatType: "reverse" },
    }}
    className={`absolute ${position} bg-white p-4 rounded-2xl shadow-xl flex items-center space-x-3 z-20`}
  >
    {icon}
    <span className="font-semibold">{text}</span>
  </motion.div>
);

// Features Section
const FeaturesSection: React.FC<{
  onBookDemo: (featureName: string) => void;
}> = ({ onBookDemo }) => {
  const { t } = useLandingLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const features = [
    {
      icon: <Package />,
      titleKey: "feature.inventory.title",
      descKey: "feature.inventory.desc",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: <BarChart3 />,
      titleKey: "feature.analytics.title",
      descKey: "feature.analytics.desc",
      color: "from-green-500 to-green-600",
    },
    {
      icon: <Users />,
      titleKey: "feature.multirole.title",
      descKey: "feature.multirole.desc",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: <DollarSign />,
      titleKey: "feature.billing.title",
      descKey: "feature.billing.desc",
      color: "from-yellow-500 to-orange-600",
    },
    {
      icon: <Truck />,
      titleKey: "feature.supplier.title",
      descKey: "feature.supplier.desc",
      color: "from-red-500 to-pink-600",
    },
    {
      icon: <Shield />,
      titleKey: "feature.secure.title",
      descKey: "feature.secure.desc",
      color: "from-indigo-500 to-purple-600",
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
            {t("features.badge")}
          </span>
          <h2 className="text-5xl font-bold mt-6 mb-6">
            {t("features.title")}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t("features.subtitle")}
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
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer"
            >
              <div
                className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6`}
              >
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3">{t(feature.titleKey)}</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                {t(feature.descKey)}
              </p>

              {/* Book a Demo Button */}
              <motion.button
                whileHover={{ scale: 1.05, x: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onBookDemo(t(feature.titleKey));
                }}
                className="flex items-center space-x-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors group"
              >
                <span>{t("button.bookDemo")}</span>
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </motion.button>
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
    {
      icon: <Package />,
      number: "50,000+",
      labelKey: "stats.parts",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: <Users />,
      number: "5",
      labelKey: "stats.roles",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: <Zap />,
      number: "2",
      labelKey: "stats.languages",
      color: "from-green-500 to-green-600",
    },
    {
      icon: <Clock />,
      number: "24/7",
      labelKey: "stats.sync",
      color: "from-orange-500 to-red-600",
    },
  ];

  return (
    <section
      ref={ref}
      className="py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"
    >
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
                <div
                  className={`w-20 h-20 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg`}
                >
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
    {
      number: "1",
      titleKey: "howitworks.step1.title",
      descKey: "howitworks.step1.desc",
      icon: <Users />,
    },
    {
      number: "2",
      titleKey: "howitworks.step2.title",
      descKey: "howitworks.step2.desc",
      icon: <Package />,
    },
    {
      number: "3",
      titleKey: "howitworks.step3.title",
      descKey: "howitworks.step3.desc",
      icon: <Settings />,
    },
    {
      number: "4",
      titleKey: "howitworks.step4.title",
      descKey: "howitworks.step4.desc",
      icon: <TrendingUp />,
    },
  ];

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="py-20 bg-gradient-to-br from-gray-50 to-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="bg-indigo-100 text-indigo-600 px-4 py-2 rounded-full text-sm font-semibold">
            {t("howitworks.badge")}
          </span>
          <h2 className="text-5xl font-bold mt-6 mb-6">
            {t("howitworks.title")}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t("howitworks.subtitle")}
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
      nameKey: "testimonials.1.name",
      roleKey: "testimonials.1.role",
      textKey: "testimonials.1.text",
      rating: 5,
      avatar: "👨‍💼",
    },
    {
      nameKey: "testimonials.2.name",
      roleKey: "testimonials.2.role",
      textKey: "testimonials.2.text",
      rating: 5,
      avatar: "👩‍💼",
    },
    {
      nameKey: "testimonials.3.name",
      roleKey: "testimonials.3.role",
      textKey: "testimonials.3.text",
      rating: 5,
      avatar: "‍🔧",
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
            {t("testimonials.badge")}
          </span>
          <h2 className="text-5xl font-bold mt-6 mb-6">
            {t("testimonials.title")}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t("testimonials.subtitle")}
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
                  <Star
                    key={i}
                    size={20}
                    className="text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                \"{t(testimonial.textKey)}\"
              </p>
              <div className="flex items-center space-x-3">
                <div className="text-4xl">{testimonial.avatar}</div>
                <div>
                  <div className="font-bold">{t(testimonial.nameKey)}</div>
                  <div className="text-sm text-gray-600">
                    {t(testimonial.roleKey)}
                  </div>
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
const CTASection: React.FC<{ onNavigateToPricing: () => void }> = ({
  onNavigateToPricing,
}) => {
  const { t } = useLandingLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section
      ref={ref}
      className="py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 opacity-10"
      >
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 2px, transparent 2px)",
            backgroundSize: "50px 50px",
          }}
        />
      </motion.div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl font-bold text-white mb-6">
            {t("cta.title")}
          </h2>
          <p className="text-2xl text-white/90 mb-10">{t("cta.subtitle")}</p>

          <button
            onClick={onNavigateToPricing}
            className="bg-white text-indigo-600 px-12 py-5 rounded-full font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center space-x-2"
          >
            <span>{t("cta.button")}</span>
            <ArrowRight size={24} />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

// Footer
const Footer: React.FC<{
  onLogin: () => void;
  onNavigate: (page: PageType) => void;
  currentPage: PageType;
}> = ({ onLogin, onNavigate, currentPage }) => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-12 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Settings size={24} />
              </div>
              <div>
                <div className="font-bold text-xl">Serve Spares</div>
                <div className="text-xs text-gray-400">Inventory System</div>
              </div>
            </div>
            <p className="text-gray-300 mb-4 text-sm leading-relaxed">
              Complete inventory management solution for two-wheelers and
              four-wheelers with multi-role access, real-time sync, and
              comprehensive features.
            </p>

            {/* Social Media Links */}
            <div className="flex space-x-3 mb-3">
              <a
                href="https://facebook.com/servespares"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 hover:bg-indigo-600 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                title="Facebook"
              >
                <Facebook size={18} />
              </a>

              <a
                href="https://instagram.com/servespares"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 hover:bg-pink-600 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                title="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://linkedin.com/company/servespares"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                title="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="https://youtube.com/@servespares"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 hover:bg-red-600 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                title="YouTube"
              >
                <Youtube size={18} />
              </a>
            </div>

            {/* Country Tags */}
            <div className="flex space-x-2">
              <span className="px-3 py-1 bg-white/10 rounded text-xs">NP</span>
              <span className="px-3 py-1 bg-white/10 rounded text-xs">IN</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#features"
                  className="text-gray-300 hover:text-white transition-colors text-sm flex items-center"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="text-gray-300 hover:text-white transition-colors text-sm flex items-center"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#testimonials"
                  className="text-gray-300 hover:text-white transition-colors text-sm flex items-center"
                >
                  Reviews
                </a>
              </li>
              <li>
                <button
                  onClick={onLogin}
                  className="text-gray-300 hover:text-white transition-colors text-sm flex items-center"
                >
                  Login
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center text-sm">
                <Mail size={16} className="mr-2 text-indigo-400" />
                support@servespares.com
              </li>
              <li className="flex items-center text-sm">
                <Phone size={16} className="mr-2 text-indigo-400" />
                +977 1234567890
              </li>
              <li className="flex items-center text-sm">
                <MapPin size={16} className="mr-2 text-indigo-400" />
                Pokhara, Nepal
              </li>
              <li className="flex items-center text-sm">
                <Clock size={16} className="mr-2 text-indigo-400" />
                24/7 Support
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Serve Spares. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 text-gray-300 text-sm">
            <span className="flex items-center">
              <Shield size={16} className="mr-1 text-green-400" /> Secure
            </span>
            <span className="flex items-center">
              <Check size={16} className="mr-1 text-blue-400" /> Reliable
            </span>
            <span className="flex items-center">
              <Zap size={16} className="mr-1 text-yellow-400" /> Fast
            </span>
          </div>
        </div>
      </div>

      {/* Gradient Bottom Bar */}
      <div className="h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>
    </footer>
  );
};
