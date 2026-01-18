import React, { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDashboardLanguage, languageNames, languageFlags, DashboardLanguage } from '../contexts/DashboardLanguageContext';

export const LanguageSelector: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { language, setLanguage, t } = useDashboardLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (lang: DashboardLanguage) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
          compact 
            ? 'bg-white/10 hover:bg-white/20 text-white' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
        title={t('common.language')}
      >
        <Globe size={18} />
        {!compact && (
          <>
            <span className="text-xl">{languageFlags[language]}</span>
            <span className="text-sm font-medium">{languageNames[language].split('(')[0].trim()}</span>
          </>
        )}
        {compact && <span className="text-lg">{languageFlags[language]}</span>}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3">
                <div className="flex items-center space-x-2 text-white">
                  <Globe size={20} />
                  <span className="font-semibold">{t('common.language')}</span>
                </div>
              </div>

              {/* Language List */}
              <div className="max-h-96 overflow-y-auto">
                {(Object.keys(languageNames) as DashboardLanguage[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`w-full px-4 py-3 flex items-center justify-between hover:bg-indigo-50 transition-colors ${
                      language === lang ? 'bg-indigo-100' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{languageFlags[lang]}</span>
                      <div className="text-left">
                        <div className="font-medium text-gray-900">{languageNames[lang]}</div>
                        <div className="text-xs text-gray-500">{lang.toUpperCase()}</div>
                      </div>
                    </div>
                    {language === lang && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center"
                      >
                        <Check size={14} className="text-white" />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>

              {/* Footer Info */}
              <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                <p className="text-xs text-gray-600 text-center">
                  {t('common.language')} • 8 {t('common.language')}s
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Compact version for sidebars
export const LanguageSelectorCompact: React.FC = () => {
  return <LanguageSelector compact={true} />;
};
