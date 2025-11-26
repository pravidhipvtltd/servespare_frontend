// System Settings - Clean & Comprehensive
import React, { useState, useEffect } from 'react';
import {
  Settings, Building2, Mail, Phone, Globe, MapPin, Save, Upload,
  DollarSign, Percent, Clock, Bell, Database, Shield, Key, Lock,
  AlertCircle, CheckCircle, Palette, FileText, Printer, Download,
  RefreshCw, Trash2, Eye, EyeOff, Languages
} from 'lucide-react';
import { getFromStorage, saveToStorage } from '../utils/mockData';
import { useLanguage } from '../contexts/LanguageContext';

interface SystemSettings {
  // Company Information
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  companyWebsite: string;
  taxNumber: string;
  
  // Business Settings
  currency: string;
  taxRate: number;
  lowStockThreshold: number;
  fiscalYearStart: string;
  
  // Notification Settings
  emailNotifications: boolean;
  lowStockAlerts: boolean;
  paymentReminders: boolean;
  dailyReports: boolean;
  
  // Security Settings
  passwordMinLength: number;
  sessionTimeout: number;
  twoFactorAuth: boolean;
  
  // Billing Settings
  invoicePrefix: string;
  invoiceNumbering: string;
  receiptFooter: string;
  
  // System Settings
  autoBackup: boolean;
  backupFrequency: string;
  dataRetention: number;
}

export const SystemSettingsFixed: React.FC<{ onUpdate: () => void }> = ({ onUpdate }) => {
  const [activeTab, setActiveTab] = useState('company');
  const [settings, setSettings] = useState<SystemSettings>({
    // Company Information
    companyName: 'Serve Spares',
    companyEmail: 'info@servespares.com',
    companyPhone: '+977-9800000000',
    companyAddress: 'Kathmandu, Nepal',
    companyWebsite: 'www.servespares.com',
    taxNumber: 'TAX-123456',
    
    // Business Settings
    currency: 'NPR',
    taxRate: 13,
    lowStockThreshold: 10,
    fiscalYearStart: '01-01',
    
    // Notification Settings
    emailNotifications: true,
    lowStockAlerts: true,
    paymentReminders: true,
    dailyReports: false,
    
    // Security Settings
    passwordMinLength: 6,
    sessionTimeout: 60,
    twoFactorAuth: false,
    
    // Billing Settings
    invoicePrefix: 'INV',
    invoiceNumbering: 'sequential',
    receiptFooter: 'Thank you for your business!',
    
    // System Settings
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetention: 365,
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const savedSettings = getFromStorage('systemSettings', null);
    if (savedSettings) {
      setSettings(savedSettings);
    }
  }, []);

  const handleChange = (field: keyof SystemSettings, value: any) => {
    setSettings({ ...settings, [field]: value });
    setHasChanges(true);
  };

  const saveSettings = () => {
    saveToStorage('systemSettings', settings);
    setHasChanges(false);
    onUpdate();
    alert('✅ System settings saved successfully!');
  };

  const resetToDefaults = () => {
    if (window.confirm('⚠️ Reset all settings to default values? This cannot be undone.')) {
      const defaultSettings: SystemSettings = {
        companyName: 'Serve Spares',
        companyEmail: 'info@servespares.com',
        companyPhone: '+977-9800000000',
        companyAddress: 'Kathmandu, Nepal',
        companyWebsite: 'www.servespares.com',
        taxNumber: 'TAX-123456',
        currency: 'NPR',
        taxRate: 13,
        lowStockThreshold: 10,
        fiscalYearStart: '01-01',
        emailNotifications: true,
        lowStockAlerts: true,
        paymentReminders: true,
        dailyReports: false,
        passwordMinLength: 6,
        sessionTimeout: 60,
        twoFactorAuth: false,
        invoicePrefix: 'INV',
        invoiceNumbering: 'sequential',
        receiptFooter: 'Thank you for your business!',
        autoBackup: true,
        backupFrequency: 'daily',
        dataRetention: 365,
      };
      setSettings(defaultSettings);
      saveToStorage('systemSettings', defaultSettings);
      setHasChanges(false);
      onUpdate();
      alert('✅ Settings reset to defaults!');
    }
  };

  const tabs = [
    { id: 'company', label: 'Company Info', icon: Building2 },
    { id: 'business', label: 'Business', icon: DollarSign },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: FileText },
    { id: 'system', label: 'System', icon: Database },
  ];

  const { language, setLanguage } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 text-2xl font-bold flex items-center">
            <Settings className="w-7 h-7 mr-3 text-purple-600" />
            System Settings
          </h2>
          <p className="text-gray-600 mt-1">Configure system-wide settings and preferences</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-gray-700 flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Defaults</span>
          </button>
          {hasChanges && (
            <button
              onClick={saveSettings}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg font-semibold flex items-center space-x-2 animate-pulse"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          )}
        </div>
      </div>

      {/* Unsaved Changes Alert */}
      {hasChanges && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-800 font-bold">⚠️ You have unsaved changes</p>
            <p className="text-yellow-700 text-sm mt-1">Click "Save Changes" to apply your modifications.</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[150px] px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Company Information Tab */}
        {activeTab === 'company' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-gray-900 font-bold text-lg mb-4 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-purple-600" />
                Company Information
              </h3>
              <p className="text-gray-600 text-sm mb-6">Update your business details and contact information</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Tax/PAN Number
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={settings.taxNumber}
                    onChange={(e) => handleChange('taxNumber', e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={settings.companyEmail}
                    onChange={(e) => handleChange('companyEmail', e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={settings.companyPhone}
                    onChange={(e) => handleChange('companyPhone', e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Website
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={settings.companyWebsite}
                    onChange={(e) => handleChange('companyWebsite', e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    value={settings.companyAddress}
                    onChange={(e) => handleChange('companyAddress', e.target.value)}
                    rows={3}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Business Settings Tab */}
        {activeTab === 'business' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-gray-900 font-bold text-lg mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                Business Settings
              </h3>
              <p className="text-gray-600 text-sm mb-6">Configure business rules and financial settings</p>
            </div>

            {/* Language Selection Section */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
              <h4 className="text-gray-900 font-bold text-lg mb-2 flex items-center">
                <Languages className="w-6 h-6 mr-2 text-blue-600" />
                System Language
              </h4>
              <p className="text-gray-600 text-sm mb-4">
                Choose the language for the entire system. This will update all menus, labels, and messages.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { code: 'en' as const, name: 'English', nativeName: 'English', flag: '🇬🇧' },
                  { code: 'ne' as const, name: 'Nepali', nativeName: 'नेपाली', flag: '🇳🇵' },
                  { code: 'hi' as const, name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      alert(`✅ ${lang.name} (${lang.nativeName}) language activated successfully! The system will now display in ${lang.name}.`);
                    }}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      language === lang.code
                        ? 'border-blue-600 bg-blue-100 shadow-lg scale-105'
                        : 'border-gray-300 bg-white hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-4xl">{lang.flag}</span>
                      {language === lang.code && (
                        <CheckCircle className="w-8 h-8 text-blue-600" />
                      )}
                    </div>
                    <div className="text-gray-900 font-bold text-lg mb-1">{lang.name}</div>
                    <div className="text-gray-600 text-lg">{lang.nativeName}</div>
                    {language === lang.code && (
                      <div className="mt-3 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full inline-block">
                        ACTIVE
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-6 bg-white border border-blue-200 rounded-lg p-4">
                <h5 className="text-gray-900 font-bold mb-2 flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-blue-600" />
                  Current Language
                </h5>
                <div className="text-gray-700">
                  The system is currently set to{' '}
                  <span className="font-bold text-blue-600">
                    {language === 'en' ? 'English' : language === 'ne' ? 'Nepali (नेपाली)' : 'Hindi (हिन्दी)'}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mt-2">
                  All users will see the interface in this language. Changes take effect immediately.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Currency
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="NPR">NPR - Nepali Rupee</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="INR">INR - Indian Rupee</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Tax Rate (%)
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={settings.taxRate}
                    onChange={(e) => handleChange('taxRate', parseFloat(e.target.value))}
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  value={settings.lowStockThreshold}
                  onChange={(e) => handleChange('lowStockThreshold', parseInt(e.target.value))}
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-gray-500 text-xs mt-1">Alert when stock falls below this number</p>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Fiscal Year Start
                </label>
                <input
                  type="text"
                  value={settings.fiscalYearStart}
                  onChange={(e) => handleChange('fiscalYearStart', e.target.value)}
                  placeholder="MM-DD"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-gray-500 text-xs mt-1">Format: MM-DD (e.g., 01-01 for January 1st)</p>
              </div>
            </div>
          </div>
        )}

        {/* Notification Settings Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-gray-900 font-bold text-lg mb-4 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-blue-600" />
                Notification Settings
              </h3>
              <p className="text-gray-600 text-sm mb-6">Manage notification preferences and alerts</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="text-gray-900 font-semibold">Email Notifications</div>
                  <div className="text-gray-600 text-sm">Receive system notifications via email</div>
                </div>
                <button
                  onClick={() => handleChange('emailNotifications', !settings.emailNotifications)}
                  className={`relative w-16 h-8 rounded-full transition-colors ${
                    settings.emailNotifications ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      settings.emailNotifications ? 'translate-x-8' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="text-gray-900 font-semibold">Low Stock Alerts</div>
                  <div className="text-gray-600 text-sm">Get notified when items are running low</div>
                </div>
                <button
                  onClick={() => handleChange('lowStockAlerts', !settings.lowStockAlerts)}
                  className={`relative w-16 h-8 rounded-full transition-colors ${
                    settings.lowStockAlerts ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      settings.lowStockAlerts ? 'translate-x-8' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="text-gray-900 font-semibold">Payment Reminders</div>
                  <div className="text-gray-600 text-sm">Send reminders for pending payments</div>
                </div>
                <button
                  onClick={() => handleChange('paymentReminders', !settings.paymentReminders)}
                  className={`relative w-16 h-8 rounded-full transition-colors ${
                    settings.paymentReminders ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      settings.paymentReminders ? 'translate-x-8' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="text-gray-900 font-semibold">Daily Reports</div>
                  <div className="text-gray-600 text-sm">Receive daily summary reports</div>
                </div>
                <button
                  onClick={() => handleChange('dailyReports', !settings.dailyReports)}
                  className={`relative w-16 h-8 rounded-full transition-colors ${
                    settings.dailyReports ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      settings.dailyReports ? 'translate-x-8' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Security Settings Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-gray-900 font-bold text-lg mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-red-600" />
                Security Settings
              </h3>
              <p className="text-gray-600 text-sm mb-6">Configure security and authentication settings</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Minimum Password Length
                </label>
                <input
                  type="number"
                  value={settings.passwordMinLength}
                  onChange={(e) => handleChange('passwordMinLength', parseInt(e.target.value))}
                  min="6"
                  max="20"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-gray-500 text-xs mt-1">Minimum 6 characters recommended</p>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                  min="15"
                  max="480"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-gray-500 text-xs mt-1">Auto logout after inactivity</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="text-gray-900 font-semibold flex items-center">
                    <Lock className="w-5 h-5 mr-2 text-blue-600" />
                    Two-Factor Authentication
                  </div>
                  <div className="text-gray-600 text-sm mt-1">Add extra security layer to login</div>
                </div>
                <button
                  onClick={() => handleChange('twoFactorAuth', !settings.twoFactorAuth)}
                  className={`relative w-16 h-8 rounded-full transition-colors ${
                    settings.twoFactorAuth ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      settings.twoFactorAuth ? 'translate-x-8' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-800 font-semibold">Security Recommendations</p>
                    <ul className="text-blue-700 text-sm mt-2 space-y-1 list-disc list-inside">
                      <li>Use strong, unique passwords for all accounts</li>
                      <li>Enable two-factor authentication for added security</li>
                      <li>Regularly update passwords every 90 days</li>
                      <li>Review user access permissions monthly</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Billing Settings Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-gray-900 font-bold text-lg mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-orange-600" />
                Billing Settings
              </h3>
              <p className="text-gray-600 text-sm mb-6">Configure invoice and receipt settings</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Invoice Prefix
                </label>
                <input
                  type="text"
                  value={settings.invoicePrefix}
                  onChange={(e) => handleChange('invoicePrefix', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-gray-500 text-xs mt-1">Example: INV-001, INV-002, etc.</p>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Invoice Numbering
                </label>
                <select
                  value={settings.invoiceNumbering}
                  onChange={(e) => handleChange('invoiceNumbering', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="sequential">Sequential (1, 2, 3...)</option>
                  <option value="yearly">Yearly Reset (2024-001, 2024-002...)</option>
                  <option value="monthly">Monthly Reset (202401-001, 202401-002...)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Receipt Footer Message
                </label>
                <textarea
                  value={settings.receiptFooter}
                  onChange={(e) => handleChange('receiptFooter', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-gray-500 text-xs mt-1">This message appears at the bottom of every receipt</p>
              </div>

              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <h4 className="text-green-900 font-bold mb-3">Receipt Preview</h4>
                <div className="bg-white p-4 rounded border border-gray-300 text-sm">
                  <div className="text-center mb-4">
                    <div className="font-bold text-lg">{settings.companyName}</div>
                    <div className="text-gray-600 text-xs">{settings.companyAddress}</div>
                  </div>
                  <div className="border-t border-b border-gray-300 py-2 my-2">
                    <div className="font-bold">{settings.invoicePrefix}-001</div>
                  </div>
                  <div className="text-gray-600 text-xs mt-4 text-center">
                    {settings.receiptFooter}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Settings Tab */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-gray-900 font-bold text-lg mb-4 flex items-center">
                <Database className="w-5 h-5 mr-2 text-purple-600" />
                System Settings
              </h3>
              <p className="text-gray-600 text-sm mb-6">Configure backup and data retention settings</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="text-gray-900 font-semibold flex items-center">
                    <Database className="w-5 h-5 mr-2 text-purple-600" />
                    Automatic Backups
                  </div>
                  <div className="text-gray-600 text-sm mt-1">Automatically backup data periodically</div>
                </div>
                <button
                  onClick={() => handleChange('autoBackup', !settings.autoBackup)}
                  className={`relative w-16 h-8 rounded-full transition-colors ${
                    settings.autoBackup ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      settings.autoBackup ? 'translate-x-8' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {settings.autoBackup && (
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Backup Frequency
                  </label>
                  <select
                    value={settings.backupFrequency}
                    onChange={(e) => handleChange('backupFrequency', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="hourly">Every Hour</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Data Retention (days)
                </label>
                <input
                  type="number"
                  value={settings.dataRetention}
                  onChange={(e) => handleChange('dataRetention', parseInt(e.target.value))}
                  min="30"
                  max="3650"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-gray-500 text-xs mt-1">How long to keep historical data (30-3650 days)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center space-x-2">
                  <Download className="w-5 h-5" />
                  <span>Backup Now</span>
                </button>
                <button className="px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>Restore Backup</span>
                </button>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-800 font-semibold">Danger Zone</p>
                    <p className="text-red-700 text-sm mt-1 mb-3">
                      These actions are irreversible. Proceed with caution.
                    </p>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center space-x-2">
                      <Trash2 className="w-4 h-4" />
                      <span>Clear All Data</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};