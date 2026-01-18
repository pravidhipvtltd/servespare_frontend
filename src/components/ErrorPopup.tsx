import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X, AlertCircle, Info } from 'lucide-react';

interface ErrorPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export const ErrorPopup: React.FC<ErrorPopupProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'warning',
  autoClose = false,
  autoCloseDelay = 3000
}) => {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  const getConfig = () => {
    switch (type) {
      case 'error':
        return {
          icon: AlertCircle,
          bgGradient: 'from-red-500 to-rose-600',
          iconBg: 'from-red-400 to-rose-600',
          pulseColor: 'bg-red-500/20',
          bottomAccent: 'from-red-400 via-rose-500 to-red-500',
          defaultTitle: 'Error'
        };
      case 'info':
        return {
          icon: Info,
          bgGradient: 'from-blue-500 to-indigo-600',
          iconBg: 'from-blue-400 to-indigo-600',
          pulseColor: 'bg-blue-500/20',
          bottomAccent: 'from-blue-400 via-indigo-500 to-blue-500',
          defaultTitle: 'Information'
        };
      default: // warning
        return {
          icon: AlertTriangle,
          bgGradient: 'from-orange-500 to-amber-600',
          iconBg: 'from-orange-400 to-amber-600',
          pulseColor: 'bg-orange-500/20',
          bottomAccent: 'from-orange-400 via-amber-500 to-orange-500',
          defaultTitle: 'Warning'
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;
  const displayTitle = title || config.defaultTitle;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            {/* Popup */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Alert Ring Animation */}
              <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0.8 }}
                  animate={{ scale: 3, opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`w-20 h-20 rounded-full ${config.pulseColor}`}
                />
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors z-10"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {/* Content */}
              <div className="p-8 text-center">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring', damping: 15, stiffness: 200 }}
                  className="flex items-center justify-center mb-6"
                >
                  <div className="relative">
                    {/* Pulsing background */}
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className={`absolute inset-0 ${config.pulseColor} rounded-full blur-xl`}
                    />
                    
                    {/* Icon container */}
                    <div className={`relative bg-gradient-to-br ${config.iconBg} rounded-full p-4 shadow-lg`}>
                      <Icon className="w-16 h-16 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-gray-900 mb-3"
                >
                  {displayTitle}
                </motion.h3>

                {/* Message */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-600 mb-6 leading-relaxed"
                >
                  {message}
                </motion.p>

                {/* OK Button */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={onClose}
                  className={`px-8 py-3 bg-gradient-to-r ${config.bgGradient} text-white font-semibold rounded-xl hover:shadow-xl transition-all transform hover:scale-105`}
                >
                  OK
                </motion.button>
              </div>

              {/* Bottom Accent */}
              <div className={`h-2 bg-gradient-to-r ${config.bottomAccent}`} />
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
