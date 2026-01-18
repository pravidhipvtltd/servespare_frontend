import React from 'react';
import { motion } from 'motion/react';
import { Package, Clock, CheckCircle, XCircle, Truck, RotateCcw, Eye, Download, MessageCircle, Sparkles, Award } from 'lucide-react';

type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

interface OrderCardProps {
  orderId: string;
  orderDate: string;
  status: OrderStatus;
  items: Array<{
    id: string;
    name: string;
    sku: string;
    quantity: number;
    image: string;
  }>;
  totalAmount: number;
  expectedDelivery?: string;
  thumbnail: string;
  onClick?: () => void;
}

const statusConfig: Record<OrderStatus, {
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  gradient: string;
}> = {
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    gradient: 'from-amber-500/20 to-orange-500/5'
  },
  confirmed: {
    label: 'Confirmed',
    icon: CheckCircle,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    gradient: 'from-blue-500/20 to-cyan-500/5'
  },
  shipped: {
    label: 'Shipped',
    icon: Truck,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    gradient: 'from-purple-500/20 to-pink-500/5'
  },
  delivered: {
    label: 'Delivered',
    icon: Award,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    gradient: 'from-emerald-500/20 to-green-500/5'
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    gradient: 'from-red-500/20 to-orange-500/5'
  },
  returned: {
    label: 'Returned',
    icon: RotateCcw,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    gradient: 'from-orange-500/20 to-amber-500/5'
  }
};

export const OrderCard: React.FC<OrderCardProps> = ({
  orderId,
  orderDate,
  status,
  items,
  totalAmount,
  expectedDelivery,
  thumbnail,
  onClick
}) => {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative bg-gradient-to-br from-slate-900/80 via-slate-900/50 to-slate-900/30 backdrop-blur-sm border border-slate-800/50 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all duration-500 cursor-pointer group shadow-2xl"
      onClick={onClick}
    >
      {/* Premium glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-orange-500/0 to-amber-500/0 group-hover:from-amber-500/5 group-hover:via-orange-500/5 group-hover:to-amber-500/5 transition-all duration-500 rounded-2xl"></div>
      
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-2xl blur-2xl"></div>

      {/* Header with Image and Status */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={thumbnail} 
          alt={orderId}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent"></div>
        
        {/* Premium Status Badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-xl ${config.bg} ${config.border} border shadow-lg`}
        >
          <StatusIcon className={`w-4 h-4 ${config.color}`} />
          <span className={`text-xs font-light ${config.color}`}>{config.label}</span>
          {status === 'delivered' && <Sparkles className="w-3 h-3 text-emerald-400" />}
        </motion.div>

        {/* Order ID with premium styling */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between">
            <div className="backdrop-blur-xl bg-slate-950/80 rounded-xl px-4 py-2 border border-amber-500/20">
              <p className="text-xs text-amber-500 font-light mb-0.5">Order ID</p>
              <p className="text-sm text-white font-light tracking-wide">{orderId}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-xl flex items-center justify-center border border-amber-500/30 shadow-xl">
              <Package className="w-6 h-6 text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Content with premium spacing */}
      <div className="relative p-6 space-y-4">
        {/* Items Summary with elegant display */}
        <div>
          <p className="text-xs text-amber-500/80 font-light mb-3 tracking-wide uppercase">Items ({items.length})</p>
          <div className="flex -space-x-3 mb-3">
            {items.slice(0, 4).map((item, idx) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="relative w-12 h-12 rounded-xl border-2 border-slate-900 overflow-hidden ring-2 ring-amber-500/20 shadow-lg"
                style={{ zIndex: items.length - idx }}
              >
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </motion.div>
            ))}
            {items.length > 4 && (
              <div className="w-12 h-12 rounded-xl border-2 border-slate-900 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-xs text-amber-400 font-light ring-2 ring-amber-500/20 shadow-lg">
                +{items.length - 4}
              </div>
            )}
          </div>
          <p className="text-sm text-white font-light truncate mb-1">{items[0]?.name}</p>
          {items.length > 1 && (
            <p className="text-xs text-slate-500 font-light">and {items.length - 1} more item{items.length > 2 ? 's' : ''}</p>
          )}
        </div>

        {/* Date and Delivery with premium layout */}
        <div className="flex items-center justify-between text-xs py-3 px-4 bg-gradient-to-r from-slate-800/30 to-slate-800/10 rounded-xl border border-slate-800/50">
          <div>
            <p className="text-slate-500 font-light mb-1">Ordered</p>
            <p className="text-slate-300 font-light">{orderDate.split(',')[0]}</p>
          </div>
          {expectedDelivery && status !== 'delivered' && status !== 'cancelled' && status !== 'returned' && (
            <div className="text-right">
              <p className="text-slate-500 font-light mb-1">Delivery</p>
              <p className="text-amber-400 font-light">{expectedDelivery.split(',')[0]}</p>
            </div>
          )}
        </div>

        {/* Amount and Action with premium design */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
          <div>
            <p className="text-xs text-slate-500 font-light mb-1">Total Amount</p>
            <p className="text-2xl text-transparent bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 bg-clip-text">
              NPR {totalAmount.toLocaleString()}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
            className="relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white text-sm rounded-xl hover:shadow-2xl hover:shadow-amber-500/50 transition-all duration-300 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Eye className="w-4 h-4 relative z-10" />
            <span className="relative z-10 font-light">View Details</span>
          </motion.button>
        </div>

        {/* Premium Quick Actions */}
        <div className="flex items-center gap-2 pt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.stopPropagation();
              // Handle download invoice
            }}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-slate-800/50 to-slate-800/30 hover:from-slate-800/70 hover:to-slate-800/50 border border-slate-700/50 hover:border-amber-500/30 text-slate-300 hover:text-white text-xs rounded-xl transition-all backdrop-blur-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="font-light">Invoice</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.stopPropagation();
              // Handle support
            }}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-slate-800/50 to-slate-800/30 hover:from-slate-800/70 hover:to-slate-800/50 border border-slate-700/50 hover:border-amber-500/30 text-slate-300 hover:text-white text-xs rounded-xl transition-all backdrop-blur-sm"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="font-light">Support</span>
          </motion.button>
        </div>
      </div>

      {/* Premium shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
      </div>
    </motion.div>
  );
};