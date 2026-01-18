import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, User, Package, Bell, Menu, X, LogOut, 
  Home, Settings, Heart, Search, ChevronDown, Crown, Sparkles 
} from 'lucide-react';

interface CustomerOrderNavProps {
  activePage: 'dashboard' | 'orders' | 'profile' | 'wishlist';
  onNavigate?: (page: string) => void;
  userName?: string;
  tenantInfo?: {
    countryFlag: string;
    currency: string;
    branchName: string;
  };
  notificationCount?: number;
}

export const CustomerOrderNav: React.FC<CustomerOrderNavProps> = ({
  activePage,
  onNavigate,
  userName = 'Customer',
  tenantInfo,
  notificationCount = 0
}) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const handleNavigation = (page: string) => {
    onNavigate?.(page);
    setShowMobileMenu(false);
    setShowProfileMenu(false);
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/95 border-b border-amber-500/10 shadow-2xl">
      {/* Premium accent line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Premium Logo */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl blur-xl opacity-50"></div>
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-2xl shadow-amber-500/50">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 bg-clip-text text-transparent">
                  ServeSpare
                </h1>
                <Crown className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xs text-amber-600/80 font-light hidden sm:block">Premium Auto Parts Portal</p>
            </div>
          </motion.div>

          {/* Premium Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNavigation(item.id)}
                  className={`
                    relative flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300
                    ${isActive 
                      ? 'text-white' 
                      : 'text-slate-400 hover:text-white'
                    }
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 rounded-xl border border-amber-500/30"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10" />
                  <span className="text-sm relative z-10">{item.label}</span>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Premium Right Side Icons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Premium Search */}
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative p-2.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/50 transition-all group"
            >
              <Search className="w-5 h-5" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/0 to-orange-500/0 group-hover:from-amber-500/10 group-hover:to-orange-500/10 transition-all"></div>
            </motion.button>

            {/* Premium Notifications */}
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative p-2.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/50 transition-all group"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs rounded-full flex items-center justify-center shadow-lg shadow-red-500/50"
                >
                  {notificationCount}
                </motion.span>
              )}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/0 to-orange-500/0 group-hover:from-amber-500/10 group-hover:to-orange-500/10 transition-all"></div>
            </motion.button>

            {/* Premium User Profile */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-slate-800/50 to-slate-800/30 hover:from-slate-800/70 hover:to-slate-800/50 border border-amber-500/10 rounded-xl transition-all backdrop-blur-sm"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full blur opacity-50"></div>
                  <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-slate-950 rounded-full"></div>
                </div>
                <span className="text-sm text-white hidden lg:block font-light">{userName}</span>
                <ChevronDown className={`w-4 h-4 text-amber-500 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
              </motion.button>

              {/* Premium Dropdown Menu */}
              <AnimatePresence>
                {showProfileMenu && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-40"
                      onClick={() => setShowProfileMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ type: "spring", bounce: 0.3 }}
                      className="absolute right-0 mt-3 w-72 bg-slate-900/95 backdrop-blur-xl border border-amber-500/20 rounded-2xl shadow-2xl overflow-hidden z-50"
                    >
                      {/* Profile Header */}
                      <div className="relative px-6 py-5 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border-b border-amber-500/10">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg">
                              <User className="w-6 h-6 text-white" />
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-slate-900 rounded-full"></div>
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-light">{userName}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-amber-500">Premium Member</span>
                              <Crown className="w-3 h-3 text-amber-500" />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span>{tenantInfo?.countryFlag}</span>
                          <span>•</span>
                          <span>{tenantInfo?.branchName}</span>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <button
                          onClick={() => handleNavigation('profile')}
                          className="w-full px-6 py-3 text-left text-sm text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-transparent transition-all flex items-center gap-3 group"
                        >
                          <User className="w-4 h-4 group-hover:text-amber-500 transition-colors" />
                          <span>My Profile</span>
                        </button>
                        <button
                          onClick={() => handleNavigation('orders')}
                          className="w-full px-6 py-3 text-left text-sm text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-transparent transition-all flex items-center gap-3 group"
                        >
                          <Package className="w-4 h-4 group-hover:text-amber-500 transition-colors" />
                          <span>My Orders</span>
                        </button>
                        <button
                          onClick={() => handleNavigation('wishlist')}
                          className="w-full px-6 py-3 text-left text-sm text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-transparent transition-all flex items-center gap-3 group"
                        >
                          <Heart className="w-4 h-4 group-hover:text-amber-500 transition-colors" />
                          <span>Wishlist</span>
                        </button>
                        <button
                          onClick={() => handleNavigation('settings')}
                          className="w-full px-6 py-3 text-left text-sm text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-transparent transition-all flex items-center gap-3 group"
                        >
                          <Settings className="w-4 h-4 group-hover:text-amber-500 transition-colors" />
                          <span>Settings</span>
                        </button>
                        
                        <div className="my-2 mx-4 border-t border-slate-800"></div>
                        
                        <button className="w-full px-6 py-3 text-left text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all flex items-center gap-3 group">
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2.5 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800/50 transition-all"
          >
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>

        {/* Premium Mobile Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-amber-500/10 py-4 overflow-hidden"
            >
              <div className="space-y-2">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleNavigation(item.id)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all
                        ${isActive 
                          ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 text-white border border-amber-500/30' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                      {isActive && <Sparkles className="w-4 h-4 ml-auto text-amber-500" />}
                    </motion.button>
                  );
                })}
                
                <div className="my-3 border-t border-amber-500/10"></div>
                
                <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all">
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};