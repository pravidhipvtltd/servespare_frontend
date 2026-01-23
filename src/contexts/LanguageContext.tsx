// Language Context - Multi-language Support System
import React, { createContext, useContext, useState, useEffect } from "react";
import { getFromStorage, saveToStorage } from "../utils/mockData";

type Language = "en" | "ne" | "hi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  languages: { code: Language; name: string; nativeName: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// Translation object
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Common
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.view": "View",
    "common.add": "Add",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.export": "Export",
    "common.import": "Import",
    "common.print": "Print",
    "common.refresh": "Refresh",
    "common.close": "Close",
    "common.submit": "Submit",
    "common.confirm": "Confirm",
    "common.yes": "Yes",
    "common.no": "No",
    "common.ok": "OK",
    "common.loading": "Loading...",
    "common.success": "Success",
    "common.error": "Error",
    "common.warning": "Warning",
    "common.info": "Information",
    "common.details": "Details",
    "common.status": "Status",
    "common.actions": "Actions",
    "common.date": "Date",
    "common.time": "Time",
    "common.name": "Name",
    "common.email": "Email",
    "common.phone": "Phone",
    "common.address": "Address",
    "common.total": "Total",
    "common.subtotal": "Subtotal",
    "common.discount": "Discount",
    "common.tax": "Tax",
    "common.notes": "Notes",
    "common.description": "Description",
    "common.quantity": "Quantity",
    "common.price": "Price",
    "common.amount": "Amount",

    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.inventory": "Inventory",
    "nav.billing": "Billing",
    "nav.parties": "Parties",
    "nav.reports": "Reports",
    "nav.settings": "Settings",
    "nav.users": "User Management",
    "nav.branches": "Branch Management",
    "nav.maintenance": "Maintenance CRM",
    "nav.crm": "CRM",
    "nav.audit": "Audit Log",
    "nav.notifications": "Notifications",
    "nav.logout": "Logout",

    // Dashboard
    "dashboard.welcome": "Welcome",
    "dashboard.total_revenue": "Total Revenue",
    "dashboard.total_sales": "Total Sales",
    "dashboard.total_profit": "Total Profit",
    "dashboard.total_expenses": "Total Expenses",
    "dashboard.inventory_value": "Inventory Value",
    "dashboard.low_stock": "Low Stock Items",
    "dashboard.out_of_stock": "Out of Stock",
    "dashboard.recent_sales": "Recent Sales",
    "dashboard.top_products": "Top Products",
    "dashboard.system_status": "System Status",
    "dashboard.quick_actions": "Quick Actions",

    // Inventory
    "inventory.title": "Inventory Management",
    "inventory.add_item": "Add New Item",
    "inventory.part_number": "Part Number",
    "inventory.category": "Category",
    "inventory.supplier": "Supplier",
    "inventory.stock_level": "Stock Level",
    "inventory.min_stock": "Min Stock",
    "inventory.reorder": "Reorder",
    "inventory.in_stock": "In Stock",
    "inventory.low_stock_alert": "Low Stock Alert",

    // Billing
    "billing.title": "Billing & Invoices",
    "billing.new_invoice": "New Invoice",
    "billing.invoice_number": "Invoice Number",
    "billing.customer": "Customer",
    "billing.payment_method": "Payment Method",
    "billing.cash": "Cash",
    "billing.credit": "Credit",
    "billing.esewa": "eSewa",
    "billing.khalti": "Khalti",
    "billing.fonepay": "FonePay",
    "billing.paid": "Paid",
    "billing.unpaid": "Unpaid",
    "billing.partially_paid": "Partially Paid",

    // Parties
    "parties.title": "Parties Management",
    "parties.customers": "Customers",
    "parties.suppliers": "Suppliers",
    "parties.add_customer": "Add Customer",
    "parties.add_supplier": "Add Supplier",
    "parties.company": "Company",
    "parties.contact_person": "Contact Person",
    "parties.balance_due": "Balance Due",

    // Users
    "users.title": "User Management",
    "users.add_user": "Add New User",
    "users.role": "Role",
    "users.super_admin": "Super Admin",
    "users.admin": "Admin",
    "users.manager": "Inventory Manager",
    "users.cashier": "Cashier",
    "users.active": "Active",
    "users.inactive": "Inactive",
    "users.reset_password": "Reset Password",

    // Settings
    "settings.title": "System Settings",
    "settings.company_info": "Company Information",
    "settings.business_settings": "Business Settings",
    "settings.language": "Language",
    "settings.currency": "Currency",
    "settings.timezone": "Timezone",
    "settings.date_format": "Date Format",
    "settings.tax_settings": "Tax Settings",
    "settings.notification_settings": "Notification Settings",
    "settings.security": "Security Settings",
    "settings.backup": "Backup & Restore",
    "settings.language_changed": "Language changed successfully!",
    "settings.select_language": "Select System Language",
    "settings.language_description":
      "Choose the language for the entire system",

    // Messages
    "message.save_success": "Saved successfully!",
    "message.delete_confirm": "Are you sure you want to delete this?",
    "message.delete_success": "Deleted successfully!",
    "message.update_success": "Updated successfully!",
    "message.error_occurred": "An error occurred. Please try again.",
    "message.no_data": "No data available",
    "message.loading_data": "Loading data...",

    // CRM
    "crm.contacts": "Contacts",
    "crm.deals": "Deals",
    "crm.activities": "Activities",
    "crm.lead": "Lead",
    "crm.customer": "Customer",
    "crm.prospect": "Prospect",
    "crm.new_contact": "New Contact",
    "crm.new_deal": "New Deal",
    "crm.new_activity": "New Activity",

    // Maintenance
    "maintenance.title": "Maintenance CRM",
    "maintenance.service_request": "Service Request",
    "maintenance.vehicle_type": "Vehicle Type",
    "maintenance.two_wheeler": "Two Wheeler",
    "maintenance.four_wheeler": "Four Wheeler",
    "maintenance.service_type": "Service Type",
    "maintenance.pending": "Pending",
    "maintenance.in_progress": "In Progress",
    "maintenance.completed": "Completed",
    "maintenance.cancelled": "Cancelled",

    // Reports
    "reports.sales_report": "Sales Report",
    "reports.inventory_report": "Inventory Report",
    "reports.financial_report": "Financial Report",
    "reports.generate": "Generate Report",
    "reports.date_range": "Date Range",

    // Branding
    "brand.name": "Serve Spares",
    "brand.tagline": "Inventory Management System",
    "brand.super_admin": "Super Admin Panel",
  },
  ne: {
    // Common - Nepali
    "common.save": "सुरक्षित गर्नुहोस्",
    "common.cancel": "रद्द गर्नुहोस्",
    "common.delete": "मेटाउनुहोस्",
    "common.edit": "सम्पादन गर्नुहोस्",
    "common.view": "हेर्नुहोस्",
    "common.add": "थप्नुहोस्",
    "common.search": "खोज्नुहोस्",
    "common.filter": "फिल्टर",
    "common.export": "निर्यात",
    "common.import": "आयात",
    "common.print": "प्रिन्ट",
    "common.refresh": "ताजा गर्नुहोस्",
    "common.close": "बन्द गर्नुहोस्",
    "common.submit": "पेश गर्नुहोस्",
    "common.confirm": "पुष्टि गर्नुहोस्",
    "common.yes": "हो",
    "common.no": "होइन",
    "common.ok": "ठीक छ",
    "common.loading": "लोड हुँदै...",
    "common.success": "सफलता",
    "common.error": "त्रुटि",
    "common.warning": "चेतावनी",
    "common.info": "जानकारी",
    "common.details": "विवरण",
    "common.status": "स्थिति",
    "common.actions": "कार्यहरु",
    "common.date": "मिति",
    "common.time": "समय",
    "common.name": "नाम",
    "common.email": "इमेल",
    "common.phone": "फोन",
    "common.address": "ठेगाना",
    "common.total": "कुल",
    "common.subtotal": "उप-योग",
    "common.discount": "छुट",
    "common.tax": "कर",
    "common.notes": "टिप्पणी",
    "common.description": "विवरण",
    "common.quantity": "मात्रा",
    "common.price": "मूल्य",
    "common.amount": "रकम",

    // Navigation - Nepali
    "nav.dashboard": "ड्यासबोर्ड",
    "nav.inventory": "सूची व्यवस्थापन",
    "nav.billing": "बिलिङ",
    "nav.parties": "पार्टीहरु",
    "nav.reports": "रिपोर्टहरु",
    "nav.settings": "सेटिङहरु",
    "nav.users": "प्रयोगकर्ता व्यवस्थापन",
    "nav.branches": "शाखा व्यवस्थापन",
    "nav.maintenance": "मर्मत CRM",
    "nav.crm": "CRM",
    "nav.audit": "लेखा परीक्षण लग",
    "nav.notifications": "सूचनाहरु",
    "nav.logout": "लगआउट",

    // Dashboard - Nepali
    "dashboard.welcome": "स्वागत छ",
    "dashboard.total_revenue": "कुल राजस्व",
    "dashboard.total_sales": "कुल बिक्री",
    "dashboard.total_profit": "कुल नाफा",
    "dashboard.total_expenses": "कुल खर्च",
    "dashboard.inventory_value": "सूची मूल्य",
    "dashboard.low_stock": "कम स्टक वस्तुहरु",
    "dashboard.out_of_stock": "स्टक सकिएको",
    "dashboard.recent_sales": "हालको बिक्री",
    "dashboard.top_products": "शीर्ष उत्पादनहरु",
    "dashboard.system_status": "प्रणाली स्थिति",
    "dashboard.quick_actions": "द्रुत कार्यहरु",

    // Inventory - Nepali
    "inventory.title": "सूची व्यवस्थापन",
    "inventory.add_item": "नयाँ वस्तु थप्नुहोस्",
    "inventory.part_number": "भाग नम्बर",
    "inventory.category": "वर्ग",
    "inventory.supplier": "आपूर्तिकर्ता",
    "inventory.stock_level": "स्टक स्तर",
    "inventory.min_stock": "न्यूनतम स्टक",
    "inventory.reorder": "पुन: अर्डर",
    "inventory.in_stock": "स्टकमा छ",
    "inventory.low_stock_alert": "कम स्टक चेतावनी",

    // Billing - Nepali
    "billing.title": "बिलिङ र इनभ्वाइस",
    "billing.new_invoice": "नयाँ इनभ्वाइस",
    "billing.invoice_number": "इनभ्वाइस नम्बर",
    "billing.customer": "ग्राहक",
    "billing.payment_method": "भुक्तानी विधि",
    "billing.cash": "नगद",
    "billing.credit": "उधारो",
    "billing.esewa": "इसेवा",
    "billing.khalti": "खल्ती",
    "billing.fonepay": "फोनपे",
    "billing.paid": "भुक्तानी गरिएको",
    "billing.unpaid": "भुक्तानी नगरिएको",
    "billing.partially_paid": "आंशिक भुक्तानी",

    // Parties - Nepali
    "parties.title": "पार्टी व्यवस्थापन",
    "parties.customers": "ग्राहकहरु",
    "parties.suppliers": "आपूर्तिकर्ताहरु",
    "parties.add_customer": "ग्राहक थप्नुहोस्",
    "parties.add_supplier": "आपूर्तिकर्ता थप्नुहोस्",
    "parties.company": "कम्पनी",
    "parties.contact_person": "सम्पर्क व्यक्ति",
    "parties.balance_due": "बाँकी रकम",

    // Users - Nepali
    "users.title": "प्रयोगकर्ता व्यवस्थापन",
    "users.add_user": "नयाँ प्रयोगकर्ता थप्नुहोस्",
    "users.role": "भूमिका",
    "users.super_admin": "सुपर एडमिन",
    "users.admin": "एडमिन",
    "users.manager": "सूची प्रबन्धक",
    "users.cashier": "कैशियर",
    "users.active": "सक्रिय",
    "users.inactive": "निष्क्रिय",
    "users.reset_password": "पासवर्ड रिसेट गर्नुहोस्",

    // Settings - Nepali
    "settings.title": "प्रणाली सेटिङहरु",
    "settings.company_info": "कम्पनी जानकारी",
    "settings.business_settings": "व्यापार सेटिङहरु",
    "settings.language": "भाषा",
    "settings.currency": "मुद्रा",
    "settings.timezone": "समय क्षेत्र",
    "settings.date_format": "मिति ढाँचा",
    "settings.tax_settings": "कर सेटिङहरु",
    "settings.notification_settings": "सूचना सेटिङहरु",
    "settings.security": "सुरक्षा सेटिङहरु",
    "settings.backup": "ब्याकअप र पुनर्स्थापना",
    "settings.language_changed": "भाषा सफलतापूर्वक परिवर्तन भयो!",
    "settings.select_language": "प्रणाली भाषा चयन गर्नुहोस्",
    "settings.language_description": "सम्पूर्ण प्रणालीको लागि भाषा छान्नुहोस्",

    // Messages - Nepali
    "message.save_success": "सफलतापूर्वक सुरक्षित गरियो!",
    "message.delete_confirm": "के तपाईं यसलाई मेटाउन निश्चित हुनुहुन्छ?",
    "message.delete_success": "सफलतापूर्वक मेटाइयो!",
    "message.update_success": "सफलतापूर्वक अपडेट गरियो!",
    "message.error_occurred":
      "एक त्रुटि देखा पर्यो। कृपया फेरि प्रयास गर्नुहोस्।",
    "message.no_data": "कुनै डाटा उपलब्ध छैन",
    "message.loading_data": "डाटा लोड हुँदै...",

    // CRM - Nepali
    "crm.contacts": "सम्पर्कहरु",
    "crm.deals": "सम्झौताहरु",
    "crm.activities": "गतिविधिहरु",
    "crm.lead": "लिड",
    "crm.customer": "ग्राहक",
    "crm.prospect": "सम्भावित",
    "crm.new_contact": "नयाँ सम्पर्क",
    "crm.new_deal": "नयाँ सम्झौता",
    "crm.new_activity": "नयाँ गतिविधि",

    // Maintenance - Nepali
    "maintenance.title": "मर्मत CRM",
    "maintenance.service_request": "सेवा अनुरोध",
    "maintenance.vehicle_type": "सवारी प्रकार",
    "maintenance.two_wheeler": "दुई पाङ्ग्रे",
    "maintenance.four_wheeler": "चार ��ाङ्ग्रे",
    "maintenance.service_type": "सेवा प्रकार",
    "maintenance.pending": "पेन्डिङ",
    "maintenance.in_progress": "प्रगतिमा",
    "maintenance.completed": "पूरा भयो",
    "maintenance.cancelled": "रद्द गरियो",

    // Reports - Nepali
    "reports.sales_report": "बिक्री रिपोर्ट",
    "reports.inventory_report": "सूची रिपोर्ट",
    "reports.financial_report": "वित्तीय रिपोर्ट",
    "reports.generate": "रिपोर्ट उत्पन्न गर्नुहोस्",
    "reports.date_range": "मिति दायरा",

    // Branding - Nepali
    "brand.name": "सर्व स्पेयर्स",
    "brand.tagline": "सूची व्यवस्थापन प्रणाली",
    "brand.super_admin": "सुपर एडमिन प्यानल",
  },
  hi: {
    // Common - Hindi
    "common.save": "सहेजें",
    "common.cancel": "रद्द करें",
    "common.delete": "हटाएं",
    "common.edit": "संपादित करें",
    "common.view": "देखें",
    "common.add": "जोड़ें",
    "common.search": "खोजें",
    "common.filter": "फ़िल्टर",
    "common.export": "निर्यात",
    "common.import": "आयात",
    "common.print": "प्रिंट",
    "common.refresh": "रीफ्रेश",
    "common.close": "बंद करें",
    "common.submit": "जमा करें",
    "common.confirm": "पुष्टि करें",
    "common.yes": "हाँ",
    "common.no": "नहीं",
    "common.ok": "ठीक है",
    "common.loading": "लोड हो रहा है...",
    "common.success": "सफलता",
    "common.error": "त्रुटि",
    "common.warning": "चेतावनी",
    "common.info": "जानकारी",
    "common.details": "विवरण",
    "common.status": "स्थिति",
    "common.actions": "कार्य",
    "common.date": "तारीख",
    "common.time": "समय",
    "common.name": "नाम",
    "common.email": "ईमेल",
    "common.phone": "फोन",
    "common.address": "पता",
    "common.total": "कुल",
    "common.subtotal": "उप-योग",
    "common.discount": "छूट",
    "common.tax": "कर",
    "common.notes": "नोट्स",
    "common.description": "विवरण",
    "common.quantity": "मात्रा",
    "common.price": "मूल्य",
    "common.amount": "राशि",

    // Navigation - Hindi
    "nav.dashboard": "डैशबोर्ड",
    "nav.inventory": "इन्वेंटरी",
    "nav.billing": "बिलिंग",
    "nav.parties": "पार्टियां",
    "nav.reports": "रिपोर्ट",
    "nav.settings": "सेटिंग्स",
    "nav.users": "उपयोगकर्ता प्रबंधन",
    "nav.branches": "शाखा प्रबंधन",
    "nav.maintenance": "रखरखाव CRM",
    "nav.crm": "CRM",
    "nav.audit": "ऑडिट लॉग",
    "nav.notifications": "सूचनाएं",
    "nav.logout": "लॉगआउट",

    // Dashboard - Hindi
    "dashboard.welcome": "स्वागत है",
    "dashboard.total_revenue": "कुल राजस्व",
    "dashboard.total_sales": "कुल बिक्री",
    "dashboard.total_profit": "कुल लाभ",
    "dashboard.total_expenses": "कुल खर्च",
    "dashboard.inventory_value": "इन्वेंटरी मूल्य",
    "dashboard.low_stock": "कम स्टॉक आइटम",
    "dashboard.out_of_stock": "स्टॉक समाप्त",
    "dashboard.recent_sales": "हाल की बिक्री",
    "dashboard.top_products": "शीर्ष उत्पाद",
    "dashboard.system_status": "सिस्टम स्थिति",
    "dashboard.quick_actions": "त्वरित कार्य",

    // Inventory - Hindi
    "inventory.title": "इन्वेंटरी प्रबंधन",
    "inventory.add_item": "नया आइटम जोड़ें",
    "inventory.part_number": "पार्ट नंबर",
    "inventory.category": "श्रेणी",
    "inventory.supplier": "आपूर्तिकर्ता",
    "inventory.stock_level": "स्टॉक स्तर",
    "inventory.min_stock": "न्यूनतम स्टॉक",
    "inventory.reorder": "पुनः ऑर्डर",
    "inventory.in_stock": "स्टॉक में",
    "inventory.low_stock_alert": "कम स्टॉक चेतावनी",

    // Billing - Hindi
    "billing.title": "बिलिंग और चालान",
    "billing.new_invoice": "नया चालान",
    "billing.invoice_number": "चालान संख्या",
    "billing.customer": "ग्राहक",
    "billing.payment_method": "भुगतान विधि",
    "billing.cash": "नकद",
    "billing.credit": "उधार",
    "billing.esewa": "ईसेवा",
    "billing.khalti": "खल्ती",
    "billing.fonepay": "फोनपे",
    "billing.paid": "भुगतान किया",
    "billing.unpaid": "अवैतनिक",
    "billing.partially_paid": "आंशिक भुगतान",

    // Parties - Hindi
    "parties.title": "पार्टी प्रबंधन",
    "parties.customers": "ग्राहक",
    "parties.suppliers": "आपूर्तिकर्ता",
    "parties.add_customer": "ग्राहक जोड़ें",
    "parties.add_supplier": "आपूर्तिकर्ता जोड़ें",
    "parties.company": "कंपनी",
    "parties.contact_person": "संपर्क व्यक्ति",
    "parties.balance_due": "शेष राशि",

    // Users - Hindi
    "users.title": "उपयोगकर्ता प्रबंधन",
    "users.add_user": "नया उपयोगकर्ता जोड़ें",
    "users.role": "भूमिका",
    "users.super_admin": "सुपर एडमिन",
    "users.admin": "एडमिन",
    "users.manager": "इन्वेंटरी मैनेजर",
    "users.cashier": "कैशियर",
    "users.active": "सक्रिय",
    "users.inactive": "निष्क्रिय",
    "users.reset_password": "पासवर्ड रीसेट करें",

    // Settings - Hindi
    "settings.title": "सिस्टम सेटिंग्स",
    "settings.company_info": "कंपनी जानकारी",
    "settings.business_settings": "व्यापार सेटिंग्स",
    "settings.language": "भाषा",
    "settings.currency": "मुद्रा",
    "settings.timezone": "समय क्षेत्र",
    "settings.date_format": "तिथि प्रारुप",
    "settings.tax_settings": "कर सेटिंग्स",
    "settings.notification_settings": "सूचना सेटिंग्स",
    "settings.security": "सुरक्षा सेटिंग्स",
    "settings.backup": "बैकअप और पुनर्स्थापना",
    "settings.language_changed": "भाषा सफलतापूर्वक बदल गई!",
    "settings.select_language": "सिस्टम भाषा चुनें",
    "settings.language_description": "संपूर्ण सिस्टम के लिए भाषा चुनें",

    // Messages - Hindi
    "message.save_success": "सफलतापूर्वक सहेजा गया!",
    "message.delete_confirm": "क्या आप इसे हटाना चाहते हैं?",
    "message.delete_success": "सफलतापूर्वक हटाया गया!",
    "message.update_success": "सफलतापूर्वक अपडेट किया गया!",
    "message.error_occurred": "एक त्रुटि हुई। कृपया पुनः प्रयास करें।",
    "message.no_data": "कोई डेटा उपलब्ध नहीं",
    "message.loading_data": "डेटा लोड हो रहा है...",

    // CRM - Hindi
    "crm.contacts": "संपर्क",
    "crm.deals": "सौदे",
    "crm.activities": "गतिविधियां",
    "crm.lead": "लीड",
    "crm.customer": "ग्राहक",
    "crm.prospect": "संभावित",
    "crm.new_contact": "नया संपर्क",
    "crm.new_deal": "नया सौदा",
    "crm.new_activity": "नई गतिविधि",

    // Maintenance - Hindi
    "maintenance.title": "रखरखाव CRM",
    "maintenance.service_request": "सेवा अनुरोध",
    "maintenance.vehicle_type": "वाहन प्रकार",
    "maintenance.two_wheeler": "दो पहिया",
    "maintenance.four_wheeler": "चार पहिया",
    "maintenance.service_type": "सेवा प्रकार",
    "maintenance.pending": "लंबित",
    "maintenance.in_progress": "प्रगति में",
    "maintenance.completed": "पूर्ण",
    "maintenance.cancelled": "रद्द",

    // Reports - Hindi
    "reports.sales_report": "बिक्री रिपोर्ट",
    "reports.inventory_report": "इन्वेंटरी रिपोर्ट",
    "reports.financial_report": "वित्तीय रिपोर्ट",
    "reports.generate": "रिपोर्ट जनरेट करें",
    "reports.date_range": "तिथि सीमा",

    // Branding - Hindi
    "brand.name": "सर्व स्पेयर्स",
    "brand.tagline": "इन्वेंटरी प्रबंधन प्रणाली",
    "brand.super_admin": "सुपर एडमिन पैनल",
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return getFromStorage("systemLanguage", "en") as Language;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    saveToStorage("systemLanguage", lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const languages = [
    { code: "en" as Language, name: "English", nativeName: "English" },
    { code: "ne" as Language, name: "Nepali", nativeName: "नेपाली" },
    { code: "hi" as Language, name: "Hindi", nativeName: "हिन्दी" },
  ];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages }}>
      {children}
    </LanguageContext.Provider>
  );
};
