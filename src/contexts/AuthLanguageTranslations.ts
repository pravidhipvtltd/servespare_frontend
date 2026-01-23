// Auth Page Translations for 8 Languages
export const authTranslations = {
  en: {
    "auth.welcome": "Welcome Back!",
    "auth.subtitle": "Login to continue to your dashboard",
    "auth.demo.title": "🎉 Demo Accounts Available!",
    "auth.demo.superadmin": "👑 Super Admin:",
    "auth.demo.admin": "⭐ Admin:",
    "auth.demo.inventoryManager": "📦 Inventory Manager:",
    "auth.demo.cashier": "💰 Cashier:",
    "auth.demo.email": "Email:",
    "auth.demo.password": "Password:",
    "auth.email.label": "Email or Username",
    "auth.email.placeholder": "Enter your email or username",
    "auth.password.label": "Password",
    "auth.password.placeholder": "Enter your password",
    "auth.login.button": "Log In",
    "auth.login.loading": "Logging in...",
    "auth.signup.prompt": "Don't have an account?",
    "auth.signup.link": "Sign Up",
    "auth.language": "Language",
  },
  ne: {
    "auth.welcome": "फेरि स्वागत छ!",
    "auth.subtitle": "आफ्नो ड्यासबोर्डमा जान लगइन गर्नुहोस्",
    "auth.demo.title": "🎉 डेमो खाताहरु उपलब्ध छन्!",
    "auth.demo.superadmin": "👑 सुपर प्रशासक:",
    "auth.demo.admin": "⭐ प्रशासक:",
    "auth.demo.inventoryManager": "📦 सूची प्रबन्धक:",
    "auth.demo.cashier": "💰 क्यासियर:",
    "auth.demo.email": "इमेल:",
    "auth.demo.password": "पासवर्ड:",
    "auth.email.label": "इमेल वा प्रयोगकर्ता नाम",
    "auth.email.placeholder":
      "आफ्नो इमेल वा प्रयोगकर्ता नाम प्रविष्ट गर्नुहोस्",
    "auth.password.label": "पासवर्ड",
    "auth.password.placeholder": "आफ्नो पासवर्ड प्रविष्ट गर्नुहोस्",
    "auth.login.button": "लगइन गर्नुहोस्",
    "auth.login.loading": "लगइन हुँदैछ...",
    "auth.signup.prompt": "खाता छैन?",
    "auth.signup.link": "साइन अप गर्नुहोस्",
    "auth.language": "भाषा",
  },
};

export const languageNames = {
  en: "English",
  ne: "नेपाली (Nepali)",
  // Other languages kept for potential future use but not displayed
  // hi: 'हिन्दी (Hindi)',
  // es: 'Español (Spanish)',
  // fr: 'Français (French)',
  // de: 'Deutsch (German)',
  // zh: '中文 (Chinese)',
  // ja: '日本語 (Japanese)',
};

export const languageFlags = {
  en: "🇬🇧",
  ne: "🇳🇵",
  // Other flags kept for potential future use but not displayed
  // hi: '🇮🇳',
  // es: '🇪🇸',
  // fr: '🇫🇷',
  // de: '🇩🇪',
  // zh: '🇨🇳',
  // ja: '🇯🇵',
};

// Available languages for UI (only English and Nepali)
export const availableLanguages: AuthLanguage[] = ["en", "ne"];

export type AuthLanguage = keyof typeof authTranslations;
