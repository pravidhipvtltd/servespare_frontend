import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Circle, AlertCircle } from 'lucide-react';

interface ShiftStatusBarProps {
  shift: any;
}

export const ShiftStatusBar: React.FC<ShiftStatusBarProps> = ({ shift }) => {
  const [elapsed, setElapsed] = useState('00:00:00');

  useEffect(() => {
    if (!shift) return;

    const interval = setInterval(() => {
      const start = new Date(shift.startTime);
      const now = new Date();
      const diff = now.getTime() - start.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setElapsed(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [shift]);

  if (!shift) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center space-x-3 bg-orange-500/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-orange-500/30"
      >
        <AlertCircle className="w-5 h-5 text-orange-400" />
        <span className="text-orange-400 font-semibold text-sm">No Active Shift</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center space-x-4"
    >
      {/* Shift Active Indicator */}
      <div className="flex items-center space-x-2 bg-green-500/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-green-500/30">
        <motion.div
          className="relative flex items-center justify-center"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="absolute w-3 h-3 bg-green-400 rounded-full blur-md" />
          <Circle className="w-3 h-3 text-green-400 fill-current" />
        </motion.div>
        <span className="text-green-400 font-semibold text-sm">SHIFT ACTIVE</span>
      </div>

      {/* Shift Timer */}
      <div className="flex items-center space-x-2 bg-blue-500/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-blue-500/30">
        <Clock className="w-5 h-5 text-blue-400" />
        <span className="text-blue-400 font-mono font-bold text-lg">{elapsed}</span>
      </div>

      {/* Shift Info */}
      <div className="bg-white/5 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
        <p className="text-gray-400 text-xs">Starting Cash</p>
        <p className="text-white font-bold">NPR {shift.startCash?.toLocaleString()}</p>
      </div>
    </motion.div>
  );
};
