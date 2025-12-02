import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  label: string;
  value: string | number;
  change?: string;
  subtext?: string;
  icon: LucideIcon;
  color: string;
  glow: string;
  delay?: number;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  label,
  value,
  change,
  subtext,
  icon: Icon,
  color,
  glow,
  delay = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', damping: 20 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="relative group"
    >
      {/* Glow Effect */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500`} />
      
      {/* Card Content */}
      <div className="relative bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <Icon className="w-full h-full text-white" />
        </div>

        {/* Icon */}
        <motion.div
          className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-4 shadow-xl ${glow}`}
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.6 }}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>

        {/* Label */}
        <p className="text-gray-400 text-sm mb-2">{label}</p>

        {/* Value */}
        <div className="flex items-baseline space-x-2 mb-2">
          <motion.h3
            className="text-white text-3xl font-bold"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.2, type: 'spring' }}
          >
            {value}
          </motion.h3>
          {change && (
            <motion.span
              className="text-green-400 text-sm font-semibold"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.3 }}
            >
              {change}
            </motion.span>
          )}
        </div>

        {/* Subtext */}
        {subtext && (
          <p className="text-gray-500 text-xs">{subtext}</p>
        )}

        {/* Sparkle Effect */}
        <motion.div
          className="absolute top-4 right-4 w-2 h-2 bg-white rounded-full"
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        />
      </div>
    </motion.div>
  );
};
