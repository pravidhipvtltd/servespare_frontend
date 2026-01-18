import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Package, Eye, RotateCcw, ShoppingBag, ArrowRight,
  Sparkles, Zap, Star, Award
} from 'lucide-react';
import { CustomerOrdersDashboard } from './CustomerOrdersDashboard';

interface OrderManagementShowcaseProps {
  onBack?: () => void;
}

export const OrderManagementShowcase: React.FC<OrderManagementShowcaseProps> = ({
  onBack
}) => {
  const [showDashboard, setShowDashboard] = useState(false);

  if (showDashboard) {
    return (
      <CustomerOrdersDashboard 
        onNavigateToCustomerPanel={() => setShowDashboard(false)}
      />
    );
  }

  const features = [
    {
      icon: Package,
      title: 'Orders List View',
      description: 'Clean card-based layout with order thumbnails, status badges, and smart filters',
      color: 'from-cyan-500 to-teal-500',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=400&fit=crop'
    },
    {
      icon: Eye,
      title: 'Order Tracking Timeline',
      description: 'Beautiful horizontal/vertical timeline with real-time status updates',
      color: 'from-purple-500 to-pink-500',
      image: 'https://images.unsplash.com/photo-1494412651409-8963ce7935a7?w=600&h=400&fit=crop'
    },
    {
      icon: RotateCcw,
      title: 'Return Request Flow',
      description: 'Step-by-step wizard with image uploads and reason selection',
      color: 'from-orange-500 to-red-500',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop'
    }
  ];

  const highlights = [
    { icon: Zap, label: 'Real-time Tracking', color: 'text-yellow-400' },
    { icon: Star, label: 'Premium Design', color: 'text-cyan-400' },
    { icon: Award, label: 'Automotive Theme', color: 'text-orange-400' },
    { icon: Sparkles, label: 'Smooth Animations', color: 'text-purple-400' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <span>← Back</span>
            </button>
          )}

          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-slate-300">Premium Order Management System</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-7xl mb-6 bg-gradient-to-r from-cyan-400 via-teal-400 to-orange-400 bg-clip-text text-transparent"
            >
              ServeSpare Orders
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-400 max-w-3xl mx-auto mb-8"
            >
              A complete customer order management interface with tracking, returns, and premium automotive design
            </motion.p>

            {/* Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-6 mb-12"
            >
              {highlights.map((highlight, index) => {
                const Icon = highlight.icon;
                return (
                  <div key={index} className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${highlight.color}`} />
                    <span className="text-slate-300">{highlight.label}</span>
                  </div>
                );
              })}
            </motion.div>

            {/* CTA Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              onClick={() => setShowDashboard(true)}
              className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl text-white text-lg hover:shadow-2xl hover:shadow-cyan-500/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6" />
                <span>View Live Demo</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="group relative bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={feature.image} 
                      alt={feature.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                    
                    {/* Icon */}
                    <div className={`absolute top-4 left-4 w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl text-white mb-2">{feature.title}</h3>
                    <p className="text-slate-400 text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Tech Stack */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <h3 className="text-slate-500 text-sm mb-4">Built With Premium Technologies</h3>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {['React', 'TypeScript', 'Tailwind CSS', 'Motion', 'Lucide Icons'].map((tech, index) => (
                <div key={index} className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-400 text-sm">
                  {tech}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Design Principles Section */}
      <div className="border-t border-slate-800 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl text-white mb-4">Design Principles</h2>
            <p className="text-slate-400">Inspired by Daraz, Amazon, and Flipkart with automotive aesthetics</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Dark Navy Theme', desc: 'Premium #020617 with gradient accents', color: 'from-slate-900 to-slate-950' },
              { title: 'Smooth Animations', desc: 'Motion-ready for future enhancements', color: 'from-cyan-500 to-teal-500' },
              { title: 'Automotive Icons', desc: 'Mechanical gear elements throughout', color: 'from-orange-500 to-red-500' },
              { title: 'Responsive Design', desc: 'Perfect on mobile and desktop', color: 'from-purple-500 to-pink-500' }
            ].map((principle, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
                className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl"
              >
                <div className={`w-full h-2 rounded-full bg-gradient-to-r ${principle.color} mb-4`} />
                <h4 className="text-white mb-2">{principle.title}</h4>
                <p className="text-sm text-slate-400">{principle.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column */}
            <div>
              <h3 className="text-2xl text-white mb-6">Complete Feature Set</h3>
              <div className="space-y-4">
                {[
                  'Multi-status order tracking (Pending, Confirmed, Shipped, Delivered)',
                  'Real-time order timeline with animated indicators',
                  'Courier tracking integration with AWB numbers',
                  'Order summary with payment method details',
                  'Comprehensive shipping address display',
                  'Activity log with system events tracking',
                  'Return request wizard with image uploads',
                  'Responsive navigation with tenant switcher'
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + index * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <p className="text-slate-300">{feature}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div>
              <h3 className="text-2xl text-white mb-6">Component Library</h3>
              <div className="space-y-3">
                {[
                  { name: 'CustomerOrderNav', desc: 'Top navigation with tenant switcher' },
                  { name: 'OrderCard', desc: 'Card component for order listings' },
                  { name: 'CustomerOrdersPage', desc: 'Orders list with search & filters' },
                  { name: 'OrderTimeline', desc: 'Horizontal/vertical timeline component' },
                  { name: 'CustomerOrderTrackingPage', desc: 'Detailed order tracking view' },
                  { name: 'ReturnRequestFlow', desc: 'Step-by-step return wizard' },
                  { name: 'CustomerOrdersDashboard', desc: 'Main orchestrator component' }
                ].map((component, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + index * 0.05 }}
                    className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-slate-700 transition-all"
                  >
                    <p className="text-white mb-1 font-mono text-sm">{component.name}</p>
                    <p className="text-xs text-slate-400">{component.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
            className="text-center mt-16"
          >
            <button
              onClick={() => setShowDashboard(true)}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl text-white text-lg hover:shadow-2xl hover:shadow-cyan-500/50 transition-all"
            >
              Experience the System →
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
