import React, { useState, useEffect } from 'react';
import { LogIn, Package, Shield, Users, Zap, Settings, Sparkles, ChevronRight, Lock, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredDemo, setHoveredDemo] = useState<number | null>(null);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);
    
    if (!result.success) {
      setError(result.message || 'Login failed');
    }
    
    setIsLoading(false);
  };

  const handleQuickLogin = async (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
    setError('');
    setIsLoading(true);

    const result = await login(email, password);
    
    if (!result.success) {
      setError(result.message || 'Login failed');
    }
    
    setIsLoading(false);
  };

  const demoAccounts = [
    { email: 'superadmin@autoparts.com', password: 'super123', role: 'Super Admin', icon: Shield, color: 'from-red-500 to-pink-600', glow: 'shadow-red-500/50' },
    { email: 'admin@autoparts.com', password: 'admin123', role: 'Admin', icon: Users, color: 'from-blue-500 to-indigo-600', glow: 'shadow-blue-500/50' },
    { email: 'manager@autoparts.com', password: 'manager123', role: 'Inventory Manager', icon: Package, color: 'from-green-500 to-emerald-600', glow: 'shadow-green-500/50' },
    { email: 'cashier@autoparts.com', password: 'cashier123', role: 'Cashier', icon: Zap, color: 'from-yellow-500 to-orange-600', glow: 'shadow-yellow-500/50' },
    { email: 'finance@autoparts.com', password: 'finance123', role: 'Finance', icon: Settings, color: 'from-purple-500 to-pink-600', glow: 'shadow-purple-500/50' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated Background - Spare Parts */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Gears */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`gear-${i}`}
            className="absolute animate-float-slow opacity-10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
            }}
          >
            <svg
              width="80"
              height="80"
              viewBox="0 0 100 100"
              className="text-orange-500 animate-spin-slow"
              style={{ animationDuration: `${20 + Math.random() * 10}s` }}
            >
              <path
                d="M50 10 L55 25 L70 25 L58 35 L63 50 L50 42 L37 50 L42 35 L30 25 L45 25 Z"
                fill="currentColor"
                opacity="0.3"
              />
              <circle cx="50" cy="50" r="15" fill="currentColor" opacity="0.5" />
              <circle cx="50" cy="50" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
        ))}

        {/* Floating Wrenches */}
        {[...Array(6)].map((_, i) => (
          <div
            key={`wrench-${i}`}
            className="absolute animate-float opacity-10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${12 + Math.random() * 8}s`,
            }}
          >
            <svg width="60" height="60" viewBox="0 0 24 24" className="text-yellow-500 animate-wiggle">
              <path
                fill="currentColor"
                d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"
              />
            </svg>
          </div>
        ))}

        {/* Engine Pistons */}
        {[...Array(5)].map((_, i) => (
          <div
            key={`piston-${i}`}
            className="absolute animate-bounce-slow opacity-10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          >
            <div className="w-12 h-16 bg-gradient-to-b from-blue-500 to-blue-700 rounded-lg opacity-50">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full mx-auto mt-2"></div>
            </div>
          </div>
        ))}

        {/* Oil Drops */}
        {[...Array(10)].map((_, i) => (
          <div
            key={`oil-${i}`}
            className="absolute animate-float-slow opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${-20 + Math.random() * 50}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${10 + Math.random() * 5}s`,
            }}
          >
            <div className="w-3 h-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-full blur-sm"></div>
          </div>
        ))}

        {/* Spark Particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={`spark-${i}`}
            className="absolute animate-pulse-slow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          >
            <div className="w-1 h-1 bg-orange-400 rounded-full shadow-lg shadow-orange-500/50"></div>
          </div>
        ))}

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Side - Branding & Features */}
        <div className="hidden lg:block space-y-10 animate-fade-in-up">
          {/* Logo Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              {/* Animated Logo */}
              <div className="relative w-20 h-20 group">
                {/* Triple Glow Layers */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-yellow-500 to-red-500 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 animate-pulse-slow"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-yellow-600 to-red-600 rounded-2xl blur-lg opacity-60 animate-pulse-slow" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-yellow-400 to-red-400 rounded-2xl blur-md opacity-80 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
                
                {/* Logo Container */}
                <div className="relative w-20 h-20 bg-gradient-to-br from-orange-600 via-yellow-500 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden">
                  {/* Rotating Gear */}
                  <svg
                    className="absolute w-16 h-16 text-white/20 animate-spin-slow"
                    viewBox="0 0 100 100"
                  >
                    <path
                      d="M50 10 L55 25 L70 25 L58 35 L63 50 L50 42 L37 50 L42 35 L30 25 L45 25 Z"
                      fill="currentColor"
                    />
                    <circle cx="50" cy="50" r="15" fill="currentColor" />
                  </svg>
                  
                  {/* Wrench Icon */}
                  <svg className="w-10 h-10 text-white relative z-10 animate-wiggle" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"
                    />
                  </svg>
                  
                  {/* Spark Effect */}
                  <Sparkles className="absolute top-1 right-1 w-4 h-4 text-yellow-300 animate-pulse" />
                  
                  {/* Oil Drop */}
                  <div className="absolute bottom-2 left-2 w-2 h-2 bg-orange-400 rounded-full animate-bounce-slow"></div>
                </div>
              </div>

              {/* Brand Name */}
              <div>
                <h1 className="text-6xl font-black bg-gradient-to-r from-orange-400 via-yellow-300 to-red-400 bg-clip-text text-transparent relative">
                  Serve Spares
                  {/* Triple Glow Text Effect */}
                  <span className="absolute inset-0 text-6xl font-black bg-gradient-to-r from-orange-500 via-yellow-500 to-red-500 bg-clip-text text-transparent blur-lg opacity-50 animate-pulse-slow"></span>
                  <span className="absolute inset-0 text-6xl font-black bg-gradient-to-r from-orange-600 via-yellow-600 to-red-600 bg-clip-text text-transparent blur-md opacity-30 animate-pulse-slow" style={{ animationDelay: '0.5s' }}></span>
                </h1>
                <p className="text-orange-300 text-lg mt-1 tracking-wider">Inventory System</p>
              </div>
            </div>
            
            <p className="text-slate-300 text-lg leading-relaxed">
              Professional inventory management solution for two-wheeler and four-wheeler spare parts.
              <span className="text-orange-400 font-semibold"> Manage stock, track sales, and streamline operations</span> with powerful multi-role access.
            </p>
          </div>

          {/* Features Grid */}
          <div className="space-y-4">
            <h3 className="text-white text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
              Powerful Features
            </h3>
            <div className="grid gap-4">
              {[
                { 
                  icon: Shield, 
                  title: 'Multi-Role Security', 
                  desc: 'Super Admin, Admin, Manager, Cashier & Finance roles',
                  gradient: 'from-red-500/20 to-pink-500/20',
                  iconColor: 'text-red-400',
                  border: 'border-red-500/30'
                },
                { 
                  icon: Package, 
                  title: 'Smart Inventory', 
                  desc: 'Track parts, manage stock levels, and auto-alerts',
                  gradient: 'from-blue-500/20 to-indigo-500/20',
                  iconColor: 'text-blue-400',
                  border: 'border-blue-500/30'
                },
                { 
                  icon: Zap, 
                  title: 'Real-Time Updates', 
                  desc: 'Instant sync across all devices and branches',
                  gradient: 'from-yellow-500/20 to-orange-500/20',
                  iconColor: 'text-yellow-400',
                  border: 'border-yellow-500/30'
                },
                { 
                  icon: Users, 
                  title: 'Multi-Workspace', 
                  desc: 'Manage multiple branches with separate inventories',
                  gradient: 'from-green-500/20 to-emerald-500/20',
                  iconColor: 'text-green-400',
                  border: 'border-green-500/30'
                },
              ].map((feature, idx) => (
                <div 
                  key={idx} 
                  className={`group relative bg-gradient-to-br ${feature.gradient} backdrop-blur-xl p-5 rounded-2xl border-2 ${feature.border} hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden`}
                >
                  {/* Glow Effect on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  <div className="flex items-start space-x-4 relative z-10">
                    <div className={`w-12 h-12 ${feature.iconColor} bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:rotate-12 transition-transform duration-300`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-bold text-lg mb-1">{feature.title}</div>
                      <p className="text-slate-300 text-sm leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Badge */}
          <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-2 border-orange-500/30 rounded-2xl backdrop-blur-xl">
            <Shield className="w-12 h-12 text-orange-400" />
            <div>
              <div className="text-white font-bold text-lg">Secure & Reliable</div>
              <p className="text-slate-300 text-sm">Trusted by 500+ auto parts businesses in Nepal</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="relative w-20 h-20 mx-auto mb-4 group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-yellow-500 to-red-500 rounded-2xl blur-xl opacity-75 animate-pulse-slow"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-orange-600 via-yellow-500 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <svg className="w-10 h-10 text-white" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-orange-400 via-yellow-300 to-red-400 bg-clip-text text-transparent">
              Serve Spares
            </h1>
            <p className="text-orange-300 mt-1">Inventory System</p>
          </div>

          {/* Login Card */}
          <div className="relative group">
            {/* Card Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-yellow-500 to-red-500 rounded-3xl blur-2xl opacity-25 group-hover:opacity-40 transition-opacity duration-500 animate-pulse-slow"></div>
            
            {/* Card Content */}
            <div className="relative bg-slate-900/80 backdrop-blur-2xl border-2 border-slate-700/50 rounded-3xl shadow-2xl p-8 lg:p-10">
              <div className="mb-8">
                <h2 className="text-white text-3xl font-bold mb-2 flex items-center gap-2">
                  Welcome Back
                  <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                </h2>
                <p className="text-slate-400">Sign in to access your dashboard</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div className="space-y-2">
                  <label className="block text-slate-300 font-semibold mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-orange-400" />
                    Email Address
                  </label>
                  <div className="relative group">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-800/50 border-2 border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all group-hover:border-slate-500"
                      placeholder="your.email@autoparts.com"
                      required
                    />
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="block text-slate-300 font-semibold mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-orange-400" />
                    Password
                  </label>
                  <div className="relative group">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-800/50 border-2 border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all group-hover:border-slate-500"
                      placeholder="Enter your password"
                      required
                    />
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-500/10 border-2 border-red-500/50 rounded-xl text-red-400 text-sm animate-shake">
                    {error}
                  </div>
                )}

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full py-4 bg-gradient-to-r from-orange-600 via-yellow-500 to-red-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
                >
                  {/* Button Glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-yellow-400 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                  
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  {/* Button Content */}
                  <span className="relative flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-slate-900 text-slate-400">Quick Login Demo Accounts</span>
                </div>
              </div>

              {/* Demo Accounts */}
              <div className="space-y-3">
                {demoAccounts.map((account, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickLogin(account.email, account.password)}
                    onMouseEnter={() => setHoveredDemo(idx)}
                    onMouseLeave={() => setHoveredDemo(null)}
                    className={`group relative w-full p-4 bg-gradient-to-r ${account.color} rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl ${account.glow} overflow-hidden`}
                  >
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    
                    {/* Content */}
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                          <account.icon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold">{account.role}</div>
                          <div className="text-xs opacity-80">{account.email}</div>
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 transition-transform ${hoveredDemo === idx ? 'translate-x-1' : ''}`} />
                    </div>
                  </button>
                ))}
              </div>

              {/* Footer Note */}
              <p className="mt-6 text-center text-slate-500 text-sm">
                Click any demo account to quick login
              </p>
            </div>
          </div>

          {/* Security Badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-slate-400 text-sm">
            <Shield className="w-4 h-4 text-green-400" />
            <span>Secured with end-to-end encryption</span>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        
        .animate-float {
          animation: float 15s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 20s ease-in-out infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 10s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        .animate-wiggle {
          animation: wiggle 2s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};