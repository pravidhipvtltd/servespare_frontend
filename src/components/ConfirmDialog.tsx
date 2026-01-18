import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Info, HelpCircle, CheckCircle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info' | 'success';
  details?: string[];
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  details = []
}) => {
  const getConfig = () => {
    switch (type) {
      case 'danger':
        return {
          icon: AlertTriangle,
          bgGradient: 'from-red-500 to-rose-600',
          iconBg: 'from-red-400 to-rose-600',
          pulseColor: 'bg-red-500/20',
          confirmBg: 'from-red-500 to-rose-600',
          confirmHover: 'hover:from-red-600 hover:to-rose-700'
        };
      case 'success':
        return {
          icon: CheckCircle,
          bgGradient: 'from-green-500 to-emerald-600',
          iconBg: 'from-green-400 to-emerald-600',
          pulseColor: 'bg-green-500/20',
          confirmBg: 'from-green-500 to-emerald-600',
          confirmHover: 'hover:from-green-600 hover:to-emerald-700'
        };
      case 'info':
        return {
          icon: Info,
          bgGradient: 'from-blue-500 to-indigo-600',
          iconBg: 'from-blue-400 to-indigo-600',
          pulseColor: 'bg-blue-500/20',
          confirmBg: 'from-blue-500 to-indigo-600',
          confirmHover: 'hover:from-blue-600 hover:to-indigo-700'
        };
      default: // warning
        return {
          icon: AlertTriangle,
          bgGradient: 'from-orange-500 to-amber-600',
          iconBg: 'from-orange-400 to-amber-600',
          pulseColor: 'bg-orange-500/20',
          confirmBg: 'from-orange-500 to-amber-600',
          confirmHover: 'hover:from-orange-600 hover:to-amber-700'
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            {/* Dialog */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={onCancel}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors z-10"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {/* Content */}
              <div className="p-8">
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
                      <Icon className="w-12 h-12 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-gray-900 mb-3 text-center"
                >
                  {title}
                </motion.h3>

                {/* Message */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-600 mb-4 text-center leading-relaxed"
                >
                  {message}
                </motion.p>

                {/* Details List */}
                {details.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gray-50 rounded-xl p-4 mb-6"
                  >
                    <p className="text-gray-700 font-semibold mb-3">This will:</p>
                    <ul className="space-y-2">
                      {details.map((detail, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + (index * 0.1) }}
                          className="flex items-start space-x-2 text-gray-700"
                        >
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex space-x-3"
                >
                  <button
                    onClick={onCancel}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                  >
                    {cancelText}
                  </button>
                  <button
                    onClick={onConfirm}
                    className={`flex-1 px-6 py-3 bg-gradient-to-r ${config.confirmBg} text-white font-semibold rounded-xl ${config.confirmHover} shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}
                  >
                    {confirmText}
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
