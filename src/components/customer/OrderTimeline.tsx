import React from 'react';
import { motion } from 'motion/react';
import { 
  Package, CheckCircle, FileCheck, PackageCheck, 
  Truck, MapPin, Home, Clock, XCircle, RotateCcw, Award, Sparkles
} from 'lucide-react';

interface TimelineStep {
  id: string;
  label: string;
  sublabel?: string;
  timestamp?: string;
  icon: any;
  status: 'completed' | 'active' | 'pending' | 'cancelled';
}

interface OrderTimelineProps {
  currentStep: number;
  steps?: TimelineStep[];
  orientation?: 'horizontal' | 'vertical';
  orderStatus?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
}

// Different timelines based on order status
const getTimelineSteps = (orderStatus: string, currentStep: number): TimelineStep[] => {
  // For cancelled orders
  if (orderStatus === 'cancelled') {
    return [
      {
        id: 'placed',
        label: 'Order Placed',
        sublabel: 'Order confirmed',
        timestamp: 'Dec 8, 10:30 AM',
        icon: Package,
        status: 'completed'
      },
      {
        id: 'confirmed',
        label: 'Confirmed',
        sublabel: 'Seller confirmed',
        timestamp: 'Dec 8, 11:15 AM',
        icon: CheckCircle,
        status: currentStep >= 1 ? 'completed' : 'active'
      },
      {
        id: 'cancelled',
        label: 'Cancelled',
        sublabel: 'Order cancelled',
        timestamp: 'Dec 8, 2:00 PM',
        icon: XCircle,
        status: 'cancelled'
      }
    ];
  }

  // For returned orders
  if (orderStatus === 'returned') {
    return [
      {
        id: 'placed',
        label: 'Order Placed',
        sublabel: 'Order confirmed',
        timestamp: 'Nov 15, 4:30 PM',
        icon: Package,
        status: 'completed'
      },
      {
        id: 'delivered',
        label: 'Delivered',
        sublabel: 'Package delivered',
        timestamp: 'Nov 20, 3:00 PM',
        icon: Home,
        status: 'completed'
      },
      {
        id: 'return-requested',
        label: 'Return Requested',
        sublabel: 'Return initiated',
        timestamp: 'Nov 22, 10:00 AM',
        icon: RotateCcw,
        status: 'completed'
      },
      {
        id: 'returned',
        label: 'Returned',
        sublabel: 'Item returned',
        timestamp: 'Nov 25, 2:00 PM',
        icon: CheckCircle,
        status: 'completed'
      }
    ];
  }

  // For delivered orders
  if (orderStatus === 'delivered') {
    return [
      {
        id: 'placed',
        label: 'Order Placed',
        sublabel: 'Order confirmed',
        timestamp: 'Dec 3, 9:20 AM',
        icon: Package,
        status: 'completed'
      },
      {
        id: 'confirmed',
        label: 'Confirmed',
        sublabel: 'Seller confirmed',
        timestamp: 'Dec 3, 10:00 AM',
        icon: CheckCircle,
        status: 'completed'
      },
      {
        id: 'packed',
        label: 'Packed',
        sublabel: 'Ready to ship',
        timestamp: 'Dec 3, 2:30 PM',
        icon: PackageCheck,
        status: 'completed'
      },
      {
        id: 'shipped',
        label: 'Shipped',
        sublabel: 'In transit',
        timestamp: 'Dec 4, 8:00 AM',
        icon: Truck,
        status: 'completed'
      },
      {
        id: 'delivered',
        label: 'Delivered',
        sublabel: 'Package delivered',
        timestamp: 'Dec 5, 3:45 PM',
        icon: Award,
        status: 'completed'
      }
    ];
  }

  // For active orders (pending, confirmed, shipped)
  return [
    {
      id: 'placed',
      label: 'Order Placed',
      sublabel: 'Order confirmed',
      timestamp: 'Dec 8, 10:30 AM',
      icon: Package,
      status: 'completed'
    },
    {
      id: 'confirmed',
      label: 'Confirmed',
      sublabel: 'Seller confirmed',
      timestamp: 'Dec 8, 11:15 AM',
      icon: CheckCircle,
      status: currentStep >= 1 ? 'completed' : 'active'
    },
    {
      id: 'picked',
      label: 'Picked',
      sublabel: 'Item picked',
      timestamp: currentStep >= 2 ? 'Dec 8, 2:30 PM' : undefined,
      icon: FileCheck,
      status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'active' : 'pending'
    },
    {
      id: 'packed',
      label: 'Packed',
      sublabel: 'Ready to ship',
      timestamp: currentStep >= 3 ? 'Dec 8, 4:45 PM' : undefined,
      icon: PackageCheck,
      status: currentStep > 3 ? 'completed' : currentStep === 3 ? 'active' : 'pending'
    },
    {
      id: 'shipped',
      label: 'Shipped',
      sublabel: 'In transit',
      timestamp: currentStep >= 4 ? 'Dec 9, 9:00 AM' : undefined,
      icon: Truck,
      status: currentStep > 4 ? 'completed' : currentStep === 4 ? 'active' : 'pending'
    },
    {
      id: 'in-transit',
      label: 'In Transit',
      sublabel: 'On the way',
      timestamp: currentStep >= 5 ? 'Dec 10, 11:30 AM' : undefined,
      icon: MapPin,
      status: currentStep > 5 ? 'completed' : currentStep === 5 ? 'active' : 'pending'
    },
    {
      id: 'delivered',
      label: 'Delivered',
      sublabel: 'Package delivered',
      timestamp: currentStep >= 6 ? 'Dec 12, 2:00 PM' : undefined,
      icon: Home,
      status: currentStep >= 6 ? 'completed' : 'pending'
    }
  ];
};

export const OrderTimeline: React.FC<OrderTimelineProps> = ({
  currentStep = 4,
  steps,
  orientation = 'horizontal',
  orderStatus = 'shipped'
}) => {
  // Use custom steps or generate based on order status
  const timelineSteps = steps || getTimelineSteps(orderStatus, currentStep);

  if (orientation === 'vertical') {
    return (
      <div className="relative">
        {timelineSteps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = step.status === 'completed';
          const isActive = step.status === 'active';
          const isPending = step.status === 'pending';
          const isCancelled = step.status === 'cancelled';

          return (
            <div key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
              {/* Vertical Line */}
              {index < timelineSteps.length - 1 && (
                <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-slate-800/50">
                  {(isCompleted || isCancelled) && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: '100%' }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`w-full ${
                        isCancelled 
                          ? 'bg-gradient-to-b from-red-500 to-orange-500' 
                          : 'bg-gradient-to-b from-amber-500 via-orange-500 to-amber-600'
                      }`}
                    />
                  )}
                </div>
              )}

              {/* Icon */}
              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center relative
                    ${isCompleted ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 shadow-2xl shadow-amber-500/50' : ''}
                    ${isActive ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-2xl shadow-orange-500/50 animate-pulse' : ''}
                    ${isCancelled ? 'bg-gradient-to-br from-red-500 to-orange-500 shadow-2xl shadow-red-500/50' : ''}
                    ${isPending ? 'bg-slate-800/50 border-2 border-slate-700/50' : ''}
                  `}
                >
                  {(isCompleted && step.id === 'delivered') && (
                    <div className="absolute -top-1 -right-1">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                    </div>
                  )}
                  <Icon className={`w-6 h-6 relative z-10 ${isPending ? 'text-slate-600' : 'text-white'}`} />
                </motion.div>
              </div>

              {/* Content */}
              <div className="flex-1 pt-2">
                <h4 className={`text-base mb-1 font-light ${isPending ? 'text-slate-500' : 'text-white'}`}>
                  {step.label}
                </h4>
                {step.sublabel && (
                  <p className={`text-sm mb-1 font-light ${isPending ? 'text-slate-600' : 'text-slate-400'}`}>
                    {step.sublabel}
                  </p>
                )}
                {step.timestamp && !isPending && (
                  <div className={`flex items-center gap-1 text-xs ${isCancelled ? 'text-red-400/70' : 'text-amber-500/70'}`}>
                    <Clock className="w-3 h-3" />
                    <span className="font-light">{step.timestamp}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal Timeline (Desktop)
  // Calculate completed steps for progress bar
  const completedSteps = timelineSteps.filter(s => s.status === 'completed').length;
  const progressPercentage = ((completedSteps - 1) / (timelineSteps.length - 1)) * 100;

  return (
    <div className="relative">
      {/* Progress Bar Background */}
      <div className="absolute top-6 left-0 right-0 h-1 bg-slate-800/50 rounded-full">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0, Math.min(100, progressPercentage))}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-full shadow-lg shadow-amber-500/50"
        />
      </div>

      {/* Steps */}
      <div className="relative flex justify-between">
        {timelineSteps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = step.status === 'completed';
          const isActive = step.status === 'active';
          const isPending = step.status === 'pending';
          const isCancelled = step.status === 'cancelled';

          return (
            <div key={step.id} className="flex flex-col items-center" style={{ width: `${100 / timelineSteps.length}%` }}>
              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
                className={`
                  relative z-10 w-12 h-12 rounded-full flex items-center justify-center mb-3
                  ${isCompleted ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 shadow-2xl shadow-amber-500/50' : ''}
                  ${isActive ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-2xl shadow-orange-500/50' : ''}
                  ${isCancelled ? 'bg-gradient-to-br from-red-500 to-orange-500 shadow-2xl shadow-red-500/50' : ''}
                  ${isPending ? 'bg-slate-800/50 border-2 border-slate-700/50' : ''}
                `}
              >
                {isActive && (
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 rounded-full bg-orange-500 opacity-30"
                  />
                )}
                {(isCompleted && step.id === 'delivered') && (
                  <div className="absolute -top-1 -right-1">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  </div>
                )}
                <Icon className={`w-6 h-6 relative z-10 ${isPending ? 'text-slate-600' : 'text-white'}`} />
              </motion.div>

              {/* Label */}
              <h4 className={`text-xs sm:text-sm text-center mb-1 font-light ${isPending ? 'text-slate-500' : 'text-white'}`}>
                {step.label}
              </h4>
              
              {/* Sublabel */}
              {step.sublabel && (
                <p className={`text-[10px] sm:text-xs text-center mb-1 font-light ${isPending ? 'text-slate-600' : 'text-slate-400'}`}>
                  {step.sublabel}
                </p>
              )}
              
              {/* Timestamp */}
              {step.timestamp && !isPending && (
                <div className={`flex items-center gap-1 text-[10px] font-light ${isCancelled ? 'text-red-400/70' : 'text-amber-500/70'}`}>
                  <Clock className="w-3 h-3" />
                  <span className="hidden sm:inline">{step.timestamp}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};