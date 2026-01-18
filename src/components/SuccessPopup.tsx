import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, X, Sparkles, PartyPopper } from 'lucide-react';

interface SuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export const SuccessPopup: React.FC<SuccessPopupProps> = ({
  isOpen,
  onClose,
  title = 'Success',
  message,
  autoClose = false,
  autoCloseDelay = 3000
}) => {
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; rotation: number; delay: number }[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Generate confetti particles
      const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100 - 50,
        y: Math.random() * -100 - 20,
        rotation: Math.random() * 360,
        delay: Math.random() * 0.3
      }));
      setConfetti(particles);

      // Auto close
      if (autoClose) {
        const timer = setTimeout(() => {
          onClose();
        }, autoCloseDelay);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

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
              {/* Confetti Animation */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {confetti.map((particle) => (
                  <motion.div
                    key={particle.id}
                    initial={{ x: '50%', y: -20, opacity: 1, rotate: 0 }}
                    animate={{
                      x: `calc(50% + ${particle.x}px)`,
                      y: particle.y,
                      opacity: 0,
                      rotate: particle.rotation
                    }}
                    transition={{ duration: 1.5, delay: particle.delay, ease: 'easeOut' }}
                    className="absolute top-1/3 left-1/2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </motion.div>
                ))}
              </div>

              {/* Success Ring Animation */}
              <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0.8 }}
                  animate={{ scale: 3, opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="w-20 h-20 rounded-full bg-green-500/30"
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
                {/* Success Icon */}
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
                      className="absolute inset-0 bg-green-500/20 rounded-full blur-xl"
                    />
                    
                    {/* Icon container */}
                    <div className="relative bg-gradient-to-br from-green-400 to-emerald-600 rounded-full p-4 shadow-lg">
                      <CheckCircle className="w-16 h-16 text-white" strokeWidth={2.5} />
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
                  {title}
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
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  OK
                </motion.button>
              </div>

              {/* Bottom Accent */}
              <div className="h-2 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500" />
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
