import React, { createContext, useContext, useState } from "react";

type LandingLanguage = "en" | "ne";

interface LandingLanguageContextType {
  language: LandingLanguage;
  setLanguage: (lang: LandingLanguage) => void;
  t: (key: string) => string;
  languageNames: Record<LandingLanguage, string>;
  languageFlags: Record<LandingLanguage, string>;
}

const LandingLanguageContext = createContext<
  LandingLanguageContextType | undefined
>(undefined);

// Language display names
const languageNames: Record<LandingLanguage, string> = {
  en: "English",
  ne: "नेपाली",
};

// Language flags
const languageFlags: Record<LandingLanguage, string> = {
  en: "🇺🇸",
  ne: "🇳🇵",
};

const translations: Record<LandingLanguage, Record<string, string>> = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.about": "About",
    "nav.features": "Features",
    "nav.pricing": "Pricing",
    "nav.contact": "Contact",
    "nav.blog": "Blog",
    "nav.download": "Download",
    "nav.login": "Login",

    // Home Page
    "home.badge": "🔧 #1 Auto Parts Management System",
    "home.title1": "Manage Your",
    "home.title2": "Auto Parts",
    "home.title3": "Inventory Smart",
    "home.subtitle":
      "Complete inventory management solution for two-wheelers and four-wheelers. Track parts, manage orders, handle billing - all in one powerful system.",
    "home.getStarted": "Get Started Now",
    "home.learnMore": "Learn More",
    "home.stats1": "Active Users",
    "home.stats2": "Uptime",
    "home.stats3": "Support",
    "home.floatingCard1": "Multi-Role Access",
    "home.floatingCard2": "Real-Time Sync",
    "home.heroTagline1": "Your Inventory,",
    "home.heroTagline2": "Fully Automated",

    // Features
    "features.badge": "Features",
    "feature.inventory.title": "Inventory Tracking",
    "feature.inventory.desc":
      "Track two-wheeler and four-wheeler parts with barcode scanning and real-time updates",
    "feature.analytics.title": "Advanced Analytics",
    "feature.analytics.desc":
      "Comprehensive reports and insights to make data-driven business decisions",
    "feature.multirole.title": "Multi-Role System",
    "feature.multirole.desc":
      "Super Admin, Admin, Inventory Manager, and Cashier roles with custom permissions",
    "feature.billing.title": "Billing & Orders",
    "feature.billing.desc":
      "Complete order management with NPR currency, eSewa, and FonePay integration",
    "feature.supplier.title": "Supplier Management",
    "feature.supplier.desc":
      "Manage vendors, track purchases, and handle multi-vendor operations",
    "feature.secure.title": "Secure & Reliable",
    "feature.secure.desc":
      "Bank-level security with real-time permission sync and data protection",

    // Stats
    "stats.parts": "Parts Tracked",
    "stats.roles": "User Roles",
    "stats.languages": "2 Languages",
    "stats.sync": "Real-Time Sync",

    // How It Works
    "howitworks.badge": "How It Works",
    "howitworks.title": "Get Started in 4 Simple Steps",
    "howitworks.subtitle":
      "Start managing your auto parts inventory in minutes",
    "howitworks.step1.title": "Register & Login",
    "howitworks.step1.desc":
      "Create your account or login with existing credentials",
    "howitworks.step2.title": "Set Up Inventory",
    "howitworks.step2.desc":
      "Add your parts, categories, and pricing information",
    "howitworks.step3.title": "Manage Operations",
    "howitworks.step3.desc":
      "Track orders, handle billing, and manage your team",
    "howitworks.step4.title": "Grow Your Business",
    "howitworks.step4.desc":
      "Use analytics and insights to make better decisions",

    // Testimonials
    "testimonials.badge": "Testimonials",
    "testimonials.title": "What Our Users Say",
    "testimonials.subtitle": "Trusted by businesses across Nepal",
    "testimonials.1.text":
      "Serve Spares transformed how we manage our parts inventory. The multi-language support is excellent!",
    "testimonials.1.name": "Rajesh Kumar",
    "testimonials.1.role": "Shop Owner, Pokhara",
    "testimonials.2.text":
      "Real-time sync and barcode scanning made our operations so much faster. Highly recommended!",
    "testimonials.2.name": "Sita Sharma",
    "testimonials.2.role": "Inventory Manager",
    "testimonials.3.text":
      "The permission system is perfect. Each staff member has exactly the access they need.",
    "testimonials.3.name": "Anil Thapa",
    "testimonials.3.role": "Business Owner",

    // CTA
    "cta.title": "Ready to Transform Your Inventory?",
    "cta.subtitle": "Join hundreds of businesses already using Serve Spares",
    "cta.button": "Pricing & Features",

    // Buttons
    "button.register": "Register",
    "button.getStarted": "Let's Get Started",
    "button.bookDemo": "Book a Demo Now",

    // Hero
    "hero.subtitle2": "Two-Wheeler & Four-Wheeler Parts Management",

    // About Page
    "about.title": "About Serve Spares",
    "about.subtitle":
      "Revolutionizing auto parts inventory management for businesses across Nepal and beyond",
    "about.mission.title": "Our Mission",
    "about.mission.desc":
      "To empower auto parts businesses with cutting-edge inventory management technology that simplifies operations, reduces costs, and drives growth.",
    "about.vision.title": "Our Vision",
    "about.vision.desc":
      "To become the leading auto parts inventory management platform in Nepal and South Asia, helping thousands of businesses thrive in the digital age.",
    "about.story.title": "Our Story",
    "about.story.p1":
      "Serve Spares was born from a simple observation: auto parts businesses in Nepal struggled with outdated inventory management methods that led to inefficiencies, lost sales, and operational headaches.",
    "about.story.p2":
      "Founded in 2023, we set out to create a comprehensive, easy-to-use system specifically designed for the unique needs of auto parts businesses in Nepal. Our team of developers and industry experts worked tirelessly to build a platform that combines powerful features with intuitive design.",
    "about.story.p3":
      "Today, Serve Spares serves hundreds of businesses across Nepal, from small local shops to large multi-branch operations. We're proud to be part of Nepal's digital transformation, helping businesses modernize and grow.",
    "about.values.title": "Our Core Values",
    "about.values.subtitle": "The principles that guide everything we do",
    "about.values.innovation": "Innovation",
    "about.values.innovation.desc":
      "Constantly improving and adding new features based on user feedback",
    "about.values.customer": "Customer First",
    "about.values.customer.desc":
      "Your success is our success. We're here to help you grow",
    "about.values.reliability": "Reliability",
    "about.values.reliability.desc":
      "99.9% uptime and rock-solid performance you can count on",
    "about.values.local": "Local Focus",
    "about.values.local.desc":
      "Built for Nepal with NPR, eSewa, FonePay, and Nepali language support",
    "about.values.scalability": "Scalability",
    "about.values.scalability.desc":
      "Grow from a single shop to multiple branches seamlessly",
    "about.values.efficiency": "Efficiency",
    "about.values.efficiency.desc":
      "Save time and money with automated processes and smart features",
    "about.stats.users": "Happy Users",
    "about.stats.parts": "Parts Managed",
    "about.stats.uptime": "Uptime",
    "about.stats.support": "Support",

    // Pricing Page
    "pricing.title": "Simple, Transparent Pricing",
    "pricing.subtitle":
      "Choose the perfect plan for your business. No hidden fees, cancel anytime.",
    "pricing.monthly": "Monthly",
    "pricing.yearly": "Yearly",
    "pricing.save": "Save 20%",
    "pricing.month": "month",
    "pricing.year": "year",
    "pricing.popular": "Most Popular",
    "pricing.getstarted": "Get Started",
    "pricing.save.yearly": "Save NPR",
    "pricing.peryear": "/year",
    "pricing.plan.starter": "Starter",
    "pricing.plan.professional": "Professional",
    "pricing.plan.enterprise": "Enterprise",
    "pricing.starter.desc": "Perfect for small shops getting started",
    "pricing.starter.f1": "Up to 1,000 parts",
    "pricing.starter.f2": "1 branch location",
    "pricing.starter.f3": "3 user accounts",
    "pricing.starter.f4": "Basic inventory tracking",
    "pricing.starter.f5": "Barcode scanning",
    "pricing.starter.f6": "Email support",
    "pricing.starter.f7": "Advanced analytics",
    "pricing.starter.f8": "Multi-branch support",
    "pricing.starter.f9": "Priority support",
    "pricing.professional.desc": "Ideal for growing businesses",
    "pricing.professional.f1": "Up to 10,000 parts",
    "pricing.professional.f2": "Up to 5 branches",
    "pricing.professional.f3": "Unlimited users",
    "pricing.professional.f4": "Advanced inventory tracking",
    "pricing.professional.f5": "Barcode scanning",
    "pricing.professional.f6": "Advanced analytics",
    "pricing.professional.f7": "Multi-branch support",
    "pricing.professional.f8": "Priority email & chat support",
    "pricing.professional.f9": "Custom reports",
    "pricing.enterprise.desc": "For large operations and franchises",
    "pricing.enterprise.f1": "Unlimited parts",
    "pricing.enterprise.f2": "Unlimited branches",
    "pricing.enterprise.f3": "Unlimited users",
    "pricing.enterprise.f4": "Enterprise inventory tracking",
    "pricing.enterprise.f5": "Advanced barcode system",
    "pricing.enterprise.f6": "AI-powered analytics",
    "pricing.enterprise.f7": "Multi-branch management",
    "pricing.enterprise.f8": "24/7 priority support",
    "pricing.enterprise.f9": "Custom integrations",
    "pricing.enterprise.f10": "Dedicated account manager",
    "pricing.enterprise.f11": "Custom training",
    "pricing.faq.title": "Frequently Asked Questions",
    "pricing.faq.subtitle": "Everything you need to know about our pricing",
    "pricing.faq.q1": "Can I upgrade or downgrade my plan?",
    "pricing.faq.a1":
      "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate any differences.",
    "pricing.faq.q2": "What payment methods do you accept?",
    "pricing.faq.a2":
      "We accept eSewa, FonePay, bank transfers, and all major credit cards. All payments are processed securely.",
    "pricing.faq.q3": "Is there a free trial?",
    "pricing.faq.a3":
      "Yes! All new users get a 14-day free trial with full access to all features. No credit card required.",
    "pricing.faq.q4": "Can I cancel my subscription?",
    "pricing.faq.a4":
      "Yes, you can cancel anytime. Your account will remain active until the end of your billing period.",
    "pricing.faq.q5": "Do you offer discounts for annual plans?",
    "pricing.faq.a5":
      "Yes! Annual plans receive a 20% discount compared to monthly billing. It's our best value!",
    "pricing.faq.q6": "Is training included?",
    "pricing.faq.a6":
      "Professional and Enterprise plans include onboarding training. Starter plan has video tutorials and documentation.",
    "pricing.cta.title": "Ready to Get Started?",
    "pricing.cta.subtitle":
      "Join hundreds of businesses already using Serve Spares",
    "pricing.cta.button": "Start Your Free Trial",

    // Features Page
    "features.title": "Powerful Features for Your Business",
    "features.subtitle":
      "Everything you need to manage your auto parts inventory efficiently",
    "features.core.badge": "Core Features",
    "features.core.title": "Built for Auto Parts Businesses",
    "features.core.subtitle":
      "Comprehensive features designed specifically for two-wheeler and four-wheeler parts management",
    "features.inventory.title": "Inventory Management",
    "features.inventory.desc":
      "Complete control over your parts inventory with real-time tracking",
    "features.inventory.f1": "Real-time stock levels",
    "features.inventory.f2": "Low stock alerts",
    "features.inventory.f3": "Part categorization",
    "features.inventory.f4": "Batch management",
    "features.barcode.title": "Barcode System",
    "features.barcode.desc":
      "Fast and accurate parts tracking with barcode technology",
    "features.barcode.f1": "Barcode generation",
    "features.barcode.f2": "Quick scanning",
    "features.barcode.f3": "Mobile scanner support",
    "features.barcode.f4": "Print labels",
    "features.orders.title": "Order Management",
    "features.orders.desc": "Handle sales and purchases seamlessly",
    "features.orders.f1": "Quick order entry",
    "features.orders.f2": "Order tracking",
    "features.orders.f3": "Purchase orders",
    "features.orders.f4": "Return management",
    "features.billing.title": "Billing & Payments",
    "features.billing.desc":
      "Complete billing solution with local payment integration",
    "features.billing.f1": "NPR currency support",
    "features.billing.f2": "eSewa integration",
    "features.billing.f3": "FonePay integration",
    "features.billing.f4": "Invoice generation",
    "features.roles.title": "Multi-Role Access",
    "features.roles.desc": "Secure access control for your team",
    "features.roles.f1": "Super Admin role",
    "features.roles.f2": "Admin role",
    "features.roles.f3": "Inventory Manager role",
    "features.roles.f4": "Cashier role",
    "features.roles.f5": "Custom permissions",
    "features.analytics.title": "Advanced Analytics",
    "features.analytics.desc": "Data-driven insights for better decisions",
    "features.analytics.f1": "Sales reports",
    "features.analytics.f2": "Inventory reports",
    "features.analytics.f3": "Profit analysis",
    "features.analytics.f4": "Custom dashboards",
    "features.categories.title": "Feature Categories",
    "features.categories.subtitle":
      "Organized by functionality for your convenience",
    "features.cat1.title": "Inventory Control",
    "features.cat1.f1": "Stock management",
    "features.cat1.f2": "Part tracking",
    "features.cat1.f3": "Reorder alerts",
    "features.cat1.f4": "Expiry tracking",
    "features.cat1.f5": "Location management",
    "features.cat1.f6": "Batch tracking",
    "features.cat2.title": "Parties Management",
    "features.cat2.f1": "Customer management",
    "features.cat2.f2": "Vendor management",
    "features.cat2.f3": "Credit management",
    "features.cat2.f4": "Payment tracking",
    "features.cat2.f5": "Contact management",
    "features.cat2.f6": "Transaction history",
    "features.cat3.title": "Business Operations",
    "features.cat3.f1": "Multi-branch support",
    "features.cat3.f2": "User management",
    "features.cat3.f3": "Role permissions",
    "features.cat3.f4": "Activity logs",
    "features.cat3.f5": "Backup & restore",
    "features.cat3.f6": "Data export",
    "features.cat4.title": "Localization",
    "features.cat4.f1": "English language",
    "features.cat4.f2": "Nepali language",
    "features.cat4.f3": "NPR currency",
    "features.cat4.f4": "+977 phone format",
    "features.cat4.f5": "eSewa payment",
    "features.cat4.f6": "FonePay payment",
    "features.cat4.f7": "Local date format",
    "features.cat4.f8": "Nepal timezone",
    "features.technical.badge": "Technical Features",
    "features.technical.title": "Modern Technology Stack",
    "features.technical.subtitle":
      "Built with the latest technologies for performance and reliability",
    "features.tech1.title": "Lightning Fast",
    "features.tech1.desc": "Optimized performance for smooth operations",
    "features.tech2.title": "Bilingual Support",
    "features.tech2.desc": "Full English and Nepali language support",
    "features.tech3.title": "Data Security",
    "features.tech3.desc": "Bank-level encryption and security",
    "features.tech4.title": "Mobile Responsive",
    "features.tech4.desc": "Works perfectly on all devices",
    "features.tech5.title": "Auto Backup",
    "features.tech5.desc": "Automatic data backup and recovery",
    "features.tech6.title": "Easy Integration",
    "features.tech6.desc": "Connect with your existing tools",
    "features.security.title": "Enterprise-Grade Security",
    "features.security.subtitle": "Your data is safe and secure with us",
    "features.security1.title": "Data Encryption",
    "features.security1.desc": "All data encrypted at rest and in transit",
    "features.security2.title": "Regular Backups",
    "features.security2.desc": "Automated daily backups of all your data",
    "features.security3.title": "99.9% Uptime",
    "features.security3.desc": "Reliable service you can count on",
    "features.security4.title": "Fast Support",
    "features.security4.desc": "Quick response to any issues",

    // Contact Page
    "contact.title": "Get in Touch",
    "contact.subtitle": "We're here to help you succeed. Reach out anytime!",
    "contact.form.title": "Send us a message",
    "contact.form.subtitle":
      "Fill out the form and we'll get back to you within 24 hours",
    "contact.name": "Your Name",
    "contact.name.placeholder": "John Doe",
    "contact.email": "Email Address",
    "contact.email.placeholder": "john@example.com",
    "contact.phone": "Phone Number",
    "contact.phone.placeholder": "+977 9800000000",
    "contact.company": "Company Name",
    "contact.company.placeholder": "Your Company",
    "contact.message": "Message",
    "contact.message.placeholder": "Tell us how we can help you...",
    "contact.send": "Send Message",
    "contact.success":
      "Thank you! We've received your message and will respond soon.",
    "contact.info.title": "Contact Information",
    "contact.info.email": "Email Us",
    "contact.info.email.value": "support@servespares.com",
    "contact.info.email.sub": "We reply within 24 hours",
    "contact.info.phone": "Call Us",
    "contact.info.phone.value": "+977 9800000000",
    "contact.info.phone.sub": "Mon-Fri, 9 AM - 6 PM",
    "contact.info.visit": "Visit Us",
    "contact.info.visit.value": "Pokhara, Nepal",
    "contact.info.visit.sub": "Main Office",
    "contact.map.title": "Find Us on Map",
    "contact.map.subtitle": "Coming Soon",
    "contact.locations.title": "Our Locations",
    "contact.locations.subtitle": "Find us across major cities in Nepal",
    "contact.location.Kathmandu": "Kathmandu",
    "contact.location.Kathmandu.region": "Central Region",
    "contact.location.Kathmandu.address": "Thamel, Kathmandu",
    "contact.location.Pokhara": "Pokhara",
    "contact.location.Pokhara.region": "Western Region",
    "contact.location.Pokhara.address": "Lakeside, Pokhara",
    "contact.location.biratnagar": "Biratnagar",
    "contact.location.biratnagar.region": "Eastern Region",
    "contact.location.biratnagar.address": "Main Road, Biratnagar",
    "contact.location.bharatpur": "Bharatpur",
    "contact.location.bharatpur.region": "Central Region",
    "contact.location.bharatpur.address": "Narayangarh, Chitwan",
  },

  ne: {
    // Navigation
    "nav.home": "होम",
    "nav.about": "हाम्रो बारेमा",
    "nav.features": "विशेषताहRs",
    "nav.pricing": "मूल्य निर्धारण",
    "nav.contact": "सम्पर्क",
    "nav.blog": "ब्लग",
    "nav.download": "डाउनलोड",
    "nav.login": "लगइन",

    // Home Page
    "home.badge": "🔧 #१ अटो पार्ट्स व्यवस्थापन प्रणाली",
    "home.title1": "आफ्नो",
    "home.title2": "अटो पार्ट्स",
    "home.title3": "सूची व्यवस्थापन गर्नुहोस्",
    "home.subtitle":
      "दुई-पाङ्ग्रे र चार-पाङ्ग्रे सवारी साधनका लागि पूर्ण सूची व्यवस्थापन समाधान। पार्ट्स ट्रयाक गर्नुहोस्, अर्डर व्यवस्थापन गर्नुहोस्, बिलिङ ह्यान्डल गर्नुहोस् - सबै एउटै शक्तिशाली प्रणालीमा।",
    "home.getStarted": "अहिले सुरु गर्नुहोस्",
    "home.learnMore": "थप जान्नुहोस्",
    "home.stats1": "सक्रिय प्रयोगकर्ता",
    "home.stats2": "अपटाइम",
    "home.stats3": "समर्थन",
    "home.floatingCard1": "बहु-भूमिका पहुँच",
    "home.floatingCard2": "वास्तविक समय सिङ्क",
    "home.heroTagline1": "तपाईंको सूची,",
    "home.heroTagline2": "पूर्ण स्वचालित",

    // Features
    "features.badge": "विशेषताहRs",
    "feature.inventory.title": "सूची ट्र्याकिङ",
    "feature.inventory.desc":
      "बारकोड स्क्यानिङ र वास्तविक समय अपडेटको साथ दुई-पाङ्ग्रे र चार-पाङ्ग्रे पार्ट्स ट्र्याक गर्नुहोस्",
    "feature.analytics.title": "उन्नत विश्लेषण",
    "feature.analytics.desc":
      "डाटा-संचालित व्यापार निर्णयहRs गर्न व्यापक रिपोर्ट र अन्तर्दृष्टि",
    "feature.multirole.title": "बहु-भूमिका प्रणाली",
    "feature.multirole.desc":
      "सुपर एडमिन, एडमिन, सूची प्रबन्धक, र क्यासियर भूमिकाहRs अनुकूलन अनुमतिहRsसहित",
    "feature.billing.title": "बिलिङ र अर्डर",
    "feature.billing.desc":
      "NPR मुद्रा, eSewa, र FonePay एकीकरणको साथ पूर्ण अर्डर व्यवस्थापन",
    "feature.supplier.title": "आपूर्तिकर्ता व्यवस्थापन",
    "feature.supplier.desc":
      "विक्रेताहRs व्यवस्थापन गर्नुहोस्, खरिद ट्र्याक गर्नुहोस्, र बहु-विक्रेता सञ्चालन ह्यान्डल गर्नुहोस्",
    "feature.secure.title": "सुरक्षित र भरपर्दो",
    "feature.secure.desc":
      "वास्तविक समय अनुमति सिङ्क र डाटा सुरक्षाको साथ बैंक-स्तर सुरक्षा",

    // Stats
    "stats.parts": "पार्ट्स ट्र्याक गरिएको",
    "stats.roles": "प्रयोगकर्ता भूमिका",
    "stats.languages": "२ भाषाहRs",
    "stats.sync": "वास्तविक समय सिङ्क",

    // How It Works
    "howitworks.badge": "यसले कसरी काम गर्छ",
    "howitworks.title": "४ सरल चरणहRsमा सुरु गर्नुहोस्",
    "howitworks.subtitle":
      "मिनेटमा आफ्नो अटो पार्ट्स सूची व्यवस्थापन सुरु गर्नुहोस्",
    "howitworks.step1.title": "दर्ता र लगइन",
    "howitworks.step1.desc":
      "आफ्नो खाता सिर्जना गर्नुहोस् वा अवस्थित प्रमाणहRsसँग लगइन गर्नुहोस्",
    "howitworks.step2.title": "सूची सेटअप गर्नुहोस्",
    "howitworks.step2.desc":
      "आफ्नो पार्ट्स, कोटी, र मूल्य निर्धारण जानकारी थप्नुहोस्",
    "howitworks.step3.title": "सञ्चालन व्यवस्थापन",
    "howitworks.step3.desc":
      "अर्डर ट्र्याक गर्नुहोस्, बिलिङ ह्यान्डल गर्नुहोस्, र आफ्नो टोली व्यवस्थापन गर्नुहोस्",
    "howitworks.step4.title": "आफ्नो व्यापार बढाउनुहोस्",
    "howitworks.step4.desc":
      "राम्रो निर्णयहRs गर्न विश्लेषण र अन्तर्दृष्टि प्रयोग गर्नुहोस्",

    // Testimonials
    "testimonials.badge": "प्रशंसापत्र",
    "testimonials.title": "हाम्रा प्रयोगकर्ताहRs के भन्छन्",
    "testimonials.subtitle": "नेपालभरि व्यवसायहRsद्वारा विश्वसनीय",
    "testimonials.1.text":
      "सर्भ स्पेयर्सले हामी कसरी आफ्नो पार्ट्स सूची व्यवस्थापन गर्छौं भन्ने Rsपान्तरण गर्‍यो। बहु-भाषा समर्थन उत्कृष्ट छ!",
    "testimonials.1.name": "राजेश कुमार",
    "testimonials.1.role": "पसल मालिक, काठमाडौं",
    "testimonials.2.text":
      "वास्तविक समय सिङ्क र बारकोड स्क्यानिङले हाम्रो सञ्चालन धेरै छिटो बनायो। अत्यधिक सिफारिस!",
    "testimonials.2.name": "सीता शर्मा",
    "testimonials.2.role": "सूची प्रबन्धक",
    "testimonials.3.text":
      "अनुमति प्रणाली उत्तम छ। प्रत्येक कर्मचारी सदस्यसँग उनीहRsलाई आवश्यक पहुँच छ।",
    "testimonials.3.name": "अनिल थापा",
    "testimonials.3.role": "व्यापार मालिक",

    // CTA
    "cta.title": "आफ्नो सूची Rsपान्तरण गर्न तयार हुनुहुन्छ?",
    "cta.subtitle":
      "सर्भ स्पेयर्स प्रयोग गरिरहेका सयौं व्यवसायहRsमा सामेल हुनुहोस्",
    "cta.button": "मूल्य र विशेषताहRs",

    // Buttons
    "button.register": "दर्ता गर्नुहोस्",
    "button.getStarted": "शुरु गर्नुहोस्",
    "button.bookDemo": "अहिले डेमो बुक गर्नुहोस्",

    // Hero
    "hero.subtitle2":
      "दुई-पाङ्ग्रे र चार-पाङ्ग्रे सवारी साधनका पार्ट्स प्रबंधन",

    // About Page
    "about.title": "सर्भ स्पेयर्स बारे",
    "about.subtitle":
      "नेपाल र बाहिर व्यवसायहRsको लागि अटो पार्ट्स सूची व्यवस्थापनमा क्रान्तिकारी परिवर्तन",
    "about.mission.title": "हाम्रो मिशन",
    "about.mission.desc":
      "अटो पार्ट्स व्यवसायहRsलाई अत्याधुनिक सूची व्यवस्थापन प्रविधिको साथ सशक्तिकरण गर्नु जसले सञ्चालन सरल बनाउँछ, लागत घटाउँछ, र वृद्धि ल्याउँछ।",
    "about.vision.title": "हाम्रो दृष्टिकोण",
    "about.vision.desc":
      "नेपाल र दक्षिण एशियामा अग्रणी अटो पार्ट्स सूची व्यवस्थापन प्लेटफर्म बन्ने, हजारौं व्यवसायहRsलाई डिजिटल युगमा फस्टाउन मद्दत गर्दै।",
    "about.story.title": "हाम्रो कथा",
    "about.story.p1":
      "सर्भ स्पेयर्स एक सरल अवलोकनबाट जन्मिएको थियो: नेपालमा अटो पार्ट्स व्यवसायहRs पुरानो सूची व्यवस्थापन विधिहRsसँग संघर्ष गरिरहेका थिए जसले अकुशलता, हराएको बिक्री, र सञ्चालन समस्याहRs निम्त्याएको थियो।",
    "about.story.p2":
      "२०२३ मा स्थापित, हामीले नेपालमा अटो पार्ट्स व्यवसायहRsको अद्वितीय आवश्यकताहRsको लागि विशेष Rsपमा डिजाइन गरिएको एक व्यापक, प्रयोग गर्न सजिलो प्रणाली सिर्जना गर्न सुरु गर्‍यौं। विकासकर्ताहRs र उद्योग विशेषज्ञहRsको हाम्रो टोलीले शक्तिशाली सुविधाहRsलाई सहज डिजाइनसँग संयोजन गर्ने प्लेटफर्म निर्माण गर्न अथक परिश्रम गर्‍यो।",
    "about.story.p3":
      "आज, सर्भ स्पेयर्सले नेपालभरि सयौं व्यवसायहRsलाई सेवा दिन्छ, साना स्थानीय पसलहRsदेखि ठूला बहु-शाखा सञ्चालनहRsसम्म। हामी नेपालको डिजिटल Rsपान्तरणको अंश बन्न पाउँदा गर्व गर्छौं, व्यवसायहRsलाई आधुनिकीकरण र वृद्धि गर्न मद्दत गर्दै।",
    "about.values.title": "हाम्रा मूल मूल्यहRs",
    "about.values.subtitle":
      "सिद्धान्तहRs जसले हामीले गर्ने सबै कुरालाई मार्गदर्शन गर्दछ",
    "about.values.innovation": "नवीनता",
    "about.values.innovation.desc":
      "प्रयोगकर्ता प्रतिक्रियाको आधारमा निरन्तर सुधार र नयाँ सुविधाहRs थप्दै",
    "about.values.customer": "ग्राहक पहिलो",
    "about.values.customer.desc":
      "तपाईंको सफलता हाम्रो सफलता हो। हामी तपाईंलाई बढ्न मद्दत गर्न यहाँ छौं",
    "about.values.reliability": "भरपर्दोपन",
    "about.values.reliability.desc":
      "९९.९% अपटाइम र चट्टान-ठोस प्रदर्शन जसमा तपाईं भरोसा गर्न सक्नुहुन्छ",
    "about.values.local": "स्थानीय फोकस",
    "about.values.local.desc":
      "NPR, eSewa, FonePay, र नेपाली भाषा समर्थनको साथ नेपालको लागि निर्मित",
    "about.values.scalability": "स्केलेबिलिटी",
    "about.values.scalability.desc":
      "एकल पसलबाट धेरै शाखाहRsमा सहज Rsपमा बढ्नुहोस्",
    "about.values.efficiency": "दक्षता",
    "about.values.efficiency.desc":
      "स्वचालित प्रक्रियाहRs र स्मार्ट सुविधाहRsको साथ समय र पैसा बचत गर्नुहोस्",
    "about.stats.users": "खुशी प्रयोगकर्ताहRs",
    "about.stats.parts": "पार्ट्स प्रबंधित",
    "about.stats.uptime": "अपटाइम",
    "about.stats.support": "समर्थन",

    // Pricing Page
    "pricing.title": "सरल, पारदर्शी मूल्य निर्धारण",
    "pricing.subtitle":
      "आफ्नो व्यवसायको लागि उत्तम योजना छान्नुहोस्। कुनै लुकेका शुल्कहRs छैनन्, जुनसुकै बेला रद्द गर्नुहोस्।",
    "pricing.monthly": "मासिक",
    "pricing.yearly": "वार्षिक",
    "pricing.save": "२०% बचत गर्नुहोस्",
    "pricing.month": "महिना",
    "pricing.year": "वर्ष",
    "pricing.popular": "सबैभन्दा लोकप्रिय",
    "pricing.getstarted": "सुरु गर्नुहोस्",
    "pricing.save.yearly": "NPR बचत गर्नुहोस्",
    "pricing.peryear": "/वर्ष",
    "pricing.plan.starter": "स्टार्टर",
    "pricing.plan.professional": "प्रोफेशनल",
    "pricing.plan.enterprise": "इन्टरप्राइज",
    "pricing.starter.desc": "सुरुवात गर्ने साना पसलहRsको लागि उत्तम",
    "pricing.starter.f1": "१,००० सम्म पार्ट्स",
    "pricing.starter.f2": "१ शाखा स्थान",
    "pricing.starter.f3": "३ प्रयोगकर्ता खाताहRs",
    "pricing.starter.f4": "आधारभूत सूची ट्र्याकिङ",
    "pricing.starter.f5": "बारकोड स्क्यानिङ",
    "pricing.starter.f6": "इमेल समर्थन",
    "pricing.starter.f7": "उन्नत विश्लेषण",
    "pricing.starter.f8": "बहु-शाखा समर्थन",
    "pricing.starter.f9": "प्राथमिकता समर्थन",
    "pricing.professional.desc": "बढ्दो व्यवसायहRsको लागि आदर्श",
    "pricing.professional.f1": "१०,००० सम्म पार्ट्स",
    "pricing.professional.f2": "५ सम्म शाखाहRs",
    "pricing.professional.f3": "असीमित प्रयोगकर्ताहRs",
    "pricing.professional.f4": "उन्नत सूची ट्र्याकिङ",
    "pricing.professional.f5": "बारकोड स्क्यानिङ",
    "pricing.professional.f6": "उन्नत विश्लेषण",
    "pricing.professional.f7": "बहु-शाखा समर्थन",
    "pricing.professional.f8": "प्राथमिकता इमेल र च्याट समर्थन",
    "pricing.professional.f9": "अनुकूलन रिपोर्टहRs",
    "pricing.enterprise.desc": "ठूला सञ्चालन र फ्रान्चाइजीहRsको लागि",
    "pricing.enterprise.f1": "असीमित पार्ट्स",
    "pricing.enterprise.f2": "असीमित शाखाहRs",
    "pricing.enterprise.f3": "असीमित प्रयोगकर्ताहRs",
    "pricing.enterprise.f4": "इन्टरप्राइज सूची ट्र्याकिङ",
    "pricing.enterprise.f5": "उन्नत बारकोड प्रणाली",
    "pricing.enterprise.f6": "AI-संचालित विश्लेषण",
    "pricing.enterprise.f7": "बहु-शाखा व्यवस्थापन",
    "pricing.enterprise.f8": "२४/७ प्राथमिकता समर्थन",
    "pricing.enterprise.f9": "अनुकूलन एकीकरणहRs",
    "pricing.enterprise.f10": "समर्पित खाता प्रबन्धक",
    "pricing.enterprise.f11": "अनुकूलन प्रशिक्षण",
    "pricing.faq.title": "बारम्बार सोधिने प्रश्नहRs",
    "pricing.faq.subtitle":
      "हाम्रो मूल्य निर्धारणको बारेमा तपाईंले जान्नु आवश्यक सबै कुरा",
    "pricing.faq.q1": "के म मेरो योजना अपग्रेड वा डाउनग्रेड गर्न सक्छु?",
    "pricing.faq.a1":
      "हो! तपाईं कुनै पनि समयमा आफ्नो योजना अपग्रेड वा डाउनग्रेड गर्न सक्नुहुन्छ। परिवर्तनहRs तुरुन्त प्रभावकारी हुन्छन् र हामी कुनै पनि भिन्नताहRs प्रोरेट गर्नेछौं।",
    "pricing.faq.q2": "तपाईं कुन भुक्तानी विधिहRs स्वीकार गर्नुहुन्छ?",
    "pricing.faq.a2":
      "हामी eSewa, FonePay, बैंक स्थानान्तरण, र सबै प्रमुख क्रेडिट कार्डहRs स्वीकार गर्छौं। सबै भुक्तानीहRs सुरक्षित Rsपमा प्रशोधन गरिन्छ।",
    "pricing.faq.q3": "के त्यहाँ नि:शुल्क परीक्षण छ?",
    "pricing.faq.a3":
      "हो! सबै नयाँ प्रयोगकर्ताहRsले सबै सुविधाहRsमा पूर्ण पहुँचको साथ १४-दिनको नि:शुल्क परीक्षण पाउँछन्। कुनै क्रेडिट कार्ड आवश्यक छैन।",
    "pricing.faq.q4": "के म मेरो सदस्यता रद्द गर्न सक्छु?",
    "pricing.faq.a4":
      "हो, तपाईं जुनसुकै बेला रद्द गर्न सक्नुहुन्छ। तपाईंको खाता तपाईंको बिलिङ अवधिको अन्त्यसम्म सक्रिय रहनेछ।",
    "pricing.faq.q5": "के तपाईं वार्षिक योजनाहRsको लागि छुट प्रदान गर्नुहुन्छ?",
    "pricing.faq.a5":
      "हो! वार्षिक योजनाहRsले मासिक बिलिङको तुलनामा २०% छुट पाउँछन्। यो हाम्रो उत्तम मूल्य हो!",
    "pricing.faq.q6": "के प्रशिक्षण समावेश छ?",
    "pricing.faq.a6":
      "प्रोफेशनल र इन्टरप्राइज योजनाहRsमा अनबोर्डिङ प्रशिक्षण समावेश छ। स्टार्टर योजनामा भिडियो ट्यूटोरियलहRs र कागजातहRs छन्।",
    "pricing.cta.title": "सुरु गर्न तयार हुनुहुन्छ?",
    "pricing.cta.subtitle":
      "सर्भ स्पेयर्स प्रयोग गरिरहेका सयौं व्यवसायहRsमा सामेल हुनुहोस्",
    "pricing.cta.button": "आफ्नो नि:शुल्क परीक्षण सुरु गर्नुहोस्",

    // Features Page
    "features.title": "तपाईंको व्यवसायको लागि शक्तिशाली सुविधाहRs",
    "features.subtitle":
      "तपाईंको अटो पार्ट्स सूची प्रभावकारी Rsपमा व्यवस्थापन गर्न आवश्यक सबै कुरा",
    "features.core.badge": "मुख्य सुविधाहRs",
    "features.core.title": "अटो पार्ट्स व्यवसायहRsको लागि निर्मित",
    "features.core.subtitle":
      "दुई-पाङ्ग्रे र चार-पाङ्ग्रे पार्ट्स व्यवस्थापनको लागि विशेष Rsपमा डिजाइन गरिएका व्यापक सुविधाहRs",
    "features.inventory.title": "सूची व्यवस्थापन",
    "features.inventory.desc":
      "वास्तविक समय ट्र्याकिङको साथ तपाईंको पार्ट्स सूचीमा पूर्ण नियन्त्रण",
    "features.inventory.f1": "वास्तविक समय स्टक स्तर",
    "features.inventory.f2": "कम स्टक अलर्टहRs",
    "features.inventory.f3": "पार्ट वर्गीकरण",
    "features.inventory.f4": "ब्याच व्यवस्थापन",
    "features.barcode.title": "बारकोड प्रणाली",
    "features.barcode.desc":
      "बारकोड प्रविधिको साथ छिटो र सटीक पार्ट्स ट्र्याकिङ",
    "features.barcode.f1": "बारकोड उत्पादन",
    "features.barcode.f2": "द्रुत स्क्यानिङ",
    "features.barcode.f3": "मोबाइल स्क्यानर समर्थन",
    "features.barcode.f4": "लेबल प्रिन्ट गर्नुहोस्",
    "features.orders.title": "अर्डर व्यवस्थापन",
    "features.orders.desc": "बिक्री र खरिद सहज Rsपमा ह्यान्डल गर्नुहोस्",
    "features.orders.f1": "द्रुत अर्डर प्रविष्टि",
    "features.orders.f2": "अर्डर ट्र्याकिङ",
    "features.orders.f3": "खरिद अर्डरहRs",
    "features.orders.f4": "रिटर्न व्यवस्थापन",
    "features.billing.title": "बिलिङ र भुक्तानीहRs",
    "features.billing.desc": "स्थानीय भुक्तानी एकीकरणको साथ पूर्ण बिलिङ समाधान",
    "features.billing.f1": "NPR मुद्रा समर्थन",
    "features.billing.f2": "eSewa एकीकरण",
    "features.billing.f3": "FonePay एकीकरण",
    "features.billing.f4": "इनभ्वाइस उत्पादन",
    "features.roles.title": "बहु-भूमिका पहुँच",
    "features.roles.desc": "तपाईंको टोलीको लागि सुरक्षित पहुँच नियन्त्रण",
    "features.roles.f1": "सुपर एडमिन भूमिका",
    "features.roles.f2": "एडमिन भूमिका",
    "features.roles.f3": "सूची प्रबन्धक भूमिका",
    "features.roles.f4": "क्यासियर भूमिका",
    "features.roles.f5": "अनुकूलन अनुमतिहRs",
    "features.analytics.title": "उन्नत विश्लेषण",
    "features.analytics.desc":
      "राम्रो निर्णयहRsको लागि डाटा-संचालित अन्तर्दृष्टि",
    "features.analytics.f1": "बिक्री रिपोर्टहRs",
    "features.analytics.f2": "सूची रिपोर्टहRs",
    "features.analytics.f3": "नाफा विश्लेषण",
    "features.analytics.f4": "अनुकूलन ड्यासबोर्डहRs",
    "features.categories.title": "सुविधा कोटीहRs",
    "features.categories.subtitle":
      "तपाईंको सुविधाको लागि कार्यक्षमता अनुसार संगठित",
    "features.cat1.title": "सूची नियन्त्रण",
    "features.cat1.f1": "स्टक व्यवस्थापन",
    "features.cat1.f2": "पार्ट ट्र्याकिङ",
    "features.cat1.f3": "पुन: अर्डर अलर्टहRs",
    "features.cat1.f4": "म्याद समाप्ति ट्र्याकिङ",
    "features.cat1.f5": "स्थान व्यवस्थापन",
    "features.cat1.f6": "ब्याच ट्र्याकिङ",
    "features.cat2.title": "पार्टी व्यवस्थापन",
    "features.cat2.f1": "ग्राहक व्यवस्थापन",
    "features.cat2.f2": "विक्रेता व्यवस्थापन",
    "features.cat2.f3": "क्रेडिट व्यवस्थापन",
    "features.cat2.f4": "भुक्तानी ट्र्याकिङ",
    "features.cat2.f5": "सम्पर्क व्यवस्थापन",
    "features.cat2.f6": "लेनदेन इतिहास",
    "features.cat3.title": "व्यवसाय सञ्चालन",
    "features.cat3.f1": "बहु-शाखा समर्थन",
    "features.cat3.f2": "प्रयोगकर्ता व्यवस्थापन",
    "features.cat3.f3": "भूमिका अनुमतिहRs",
    "features.cat3.f4": "गतिविधि लगहRs",
    "features.cat3.f5": "ब्याकअप र पुनर्स्थापना",
    "features.cat3.f6": "डाटा निर्यात",
    "features.cat4.title": "स्थानीयकरण",
    "features.cat4.f1": "अंग्रेजी भाषा",
    "features.cat4.f2": "नेपाली भाषा",
    "features.cat4.f3": "NPR मुद्रा",
    "features.cat4.f4": "+९७७ फोन ढाँचा",
    "features.cat4.f5": "eSewa भुक्तानी",
    "features.cat4.f6": "FonePay भुक्तानी",
    "features.cat4.f7": "स्थानीय मिति ढाँचा",
    "features.cat4.f8": "नेपाल समय क्षेत्र",
    "features.technical.badge": "प्राविधिक सुविधाहRs",
    "features.technical.title": "आधुनिक प्रविधि स्ट्याक",
    "features.technical.subtitle":
      "प्रदर्शन र विश्वसनीयताको लागि नवीनतम प्रविधिहRsसँग निर्मित",
    "features.tech1.title": "बिजुली छिटो",
    "features.tech1.desc": "सुचारु सञ्चालनको लागि अनुकूलित प्रदर्शन",
    "features.tech2.title": "द्विभाषी समर्थन",
    "features.tech2.desc": "पूर्ण अंग्रेजी र नेपाली भाषा समर्थन",
    "features.tech3.title": "डाटा सुरक्षा",
    "features.tech3.desc": "बैंक-स्तर एन्क्रिप्शन र सुरक्षा",
    "features.tech4.title": "मोबाइल उत्तरदायी",
    "features.tech4.desc": "सबै उपकरणहRsमा पूर्ण Rsपमा काम गर्दछ",
    "features.tech5.title": "स्वत: ब्याकअप",
    "features.tech5.desc": "स्वचालित डाटा ब्याकअप र पुनर्प्राप्ति",
    "features.tech6.title": "सजिलो एकीकरण",
    "features.tech6.desc": "तपाईंको अवस्थित उपकरणहRsसँग जडान गर्नुहोस्",
    "features.security.title": "इन्टरप्राइज-ग्रेड सुरक्षा",
    "features.security.subtitle": "तपाईंको डाटा हामीसँग सुरक्षित र सुरक्षित छ",
    "features.security1.title": "डाटा एन्क्रिप्शन",
    "features.security1.desc": "सबै डाटा आराम र ट्रान्जिटमा एन्क्रिप्ट गरिएको",
    "features.security2.title": "नियमित ब्याकअपहRs",
    "features.security2.desc": "तपाईंको सबै डाटाको स्वचालित दैनिक ब्याकअप",
    "features.security3.title": "९९.९% अपटाइम",
    "features.security3.desc": "भरपर्दो सेवा जसमा तपाईं भरोसा गर्न सक्नुहुन्छ",
    "features.security4.title": "छिटो समर्थन",
    "features.security4.desc": "कुनै पनि समस्याको द्रुत प्रतिक्रिया",

    // Contact Page
    "contact.title": "सम्पर्कमा रहनुहोस्",
    "contact.subtitle":
      "हामी तपाईंलाई सफल हुन मद्दत गर्न यहाँ छौं। जुनसुकै बेला सम्पर्क गर्नुहोस्!",
    "contact.form.title": "हामीलाई सन्देश पठाउनुहोस्",
    "contact.form.subtitle":
      "फारम भर्नुहोस् र हामी २४ घण्टा भित्र तपाईंलाई फिर्ता गर्नेछौं",
    "contact.name": "तपाईंको नाम",
    "contact.name.placeholder": "जोन डो",
    "contact.email": "इमेल ठेगाना",
    "contact.email.placeholder": "john@example.com",
    "contact.phone": "फोन नम्बर",
    "contact.phone.placeholder": "+९७७ ९८००००००००",
    "contact.company": "कम्पनीको नाम",
    "contact.company.placeholder": "तपाईंको कम्पनी",
    "contact.message": "सन्देश",
    "contact.message.placeholder":
      "हामी तपाईंलाई कसरी मद्दत गर्न सक्छौं भन्नुहोस्...",
    "contact.send": "सन्देश पठाउनुहोस्",
    "contact.success":
      "धन्यवाद! हामीले तपाईंको सन्देश प्राप्त गरेका छौं र चाँडै प्रतिक्रिया दिनेछौं।",
    "contact.info.title": "सम्पर्क जानकारी",
    "contact.info.email": "हामीलाई इमेल गर्नुहोस्",
    "contact.info.email.value": "support@servespares.com",
    "contact.info.email.sub": "हामी २४ घण्टा भित्र जवाफ दिन्छौं",
    "contact.info.phone": "हामीलाई कल गर्नुहोस्",
    "contact.info.phone.value": "+९७७ ९८००००००००",
    "contact.info.phone.sub": "सोम-शुक्र, बिहान ९ - साँझ ६",
    "contact.info.visit": "हामीलाई भेट्नुहोस्",
    "contact.info.visit.value": "काठमाडौं, नेपाल",
    "contact.info.visit.sub": "मुख्य कार्यालय",
    "contact.map.title": "नक्सामा हामीलाई भेट्टाउनुहोस्",
    "contact.map.subtitle": "छिट्टै आउँदैछ",
    "contact.locations.title": "हाम्रा स्थानहRs",
    "contact.locations.subtitle":
      "नेपालका प्रमुख शहरहRsमा हामीलाई भेट्टाउनुहोस्",
    "contact.location.Kathmandu": "काठमाडौं",
    "contact.location.Kathmandu.region": "केन्द्रीय क्षेत्र",
    "contact.location.Kathmandu.address": "ठमेल, काठमाडौं",
    "contact.location.Pokhara": "पोखरा",
    "contact.location.Pokhara.region": "पश्चिम क्षेत्र",
    "contact.location.Pokhara.address": "लेकसाइड, पोखरा",
    "contact.location.biratnagar": "विराटनगर",
    "contact.location.biratnagar.region": "पूर्वी क्षेत्र",
    "contact.location.biratnagar.address": "मुख्य सडक, विराटनगर",
    "contact.location.bharatpur": "भरतपुर",
    "contact.location.bharatpur.region": "केन्द्रीय क्षेत्र",
    "contact.location.bharatpur.address": "नारायणगढ, चितवन",
  },
};

export const LandingLanguageProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [language, setLanguage] = useState<LandingLanguage>("en");

  const t = (key: string): string => {
    return translations[language][key] || translations["en"][key] || key;
  };

  return (
    <LandingLanguageContext.Provider
      value={{ language, setLanguage, t, languageNames, languageFlags }}
    >
      {children}
    </LandingLanguageContext.Provider>
  );
};

export const useLandingLanguage = () => {
  const context = useContext(LandingLanguageContext);
  if (!context) {
    throw new Error(
      "useLandingLanguage must be used within LandingLanguageProvider"
    );
  }
  return context;
};
