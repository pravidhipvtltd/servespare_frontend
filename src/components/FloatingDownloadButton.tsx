import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Monitor, Apple, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type Platform = 'windows' | 'macos' | 'linux' | null;

interface FloatingDownloadButtonProps {
  showOnScroll?: boolean;
}

export const FloatingDownloadButton: React.FC<FloatingDownloadButtonProps> = ({ showOnScroll = true }) => {
  const [showButton, setShowButton] = useState(!showOnScroll);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<'platform' | 'login'>('platform');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  // Show/hide button on scroll
  useEffect(() => {
    if (!showOnScroll) return;

    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showOnScroll]);

  const platforms = [
    {
      id: 'windows' as Platform,
      name: 'Windows',
      icon: '🪟',
      size: '~120 MB',
      requirements: 'Windows 10 or later',
      downloadUrl: '/downloads/serve-spares-setup.exe',
    },
    {
      id: 'macos' as Platform,
      name: 'macOS',
      icon: '🍎',
      size: '~130 MB',
      requirements: 'macOS 10.15 or later',
      downloadUrl: '/downloads/serve-spares.dmg',
    },
    {
      id: 'linux' as Platform,
      name: 'Linux',
      icon: '🐧',
      size: '~125 MB',
      requirements: 'Ubuntu 20.04+ / Debian 10+',
      downloadUrl: '/downloads/serve-spares.AppImage',
    },
  ];

  const handlePlatformSelect = (platform: Platform) => {
    setSelectedPlatform(platform);
    setStep('login');
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Attempt to login
      const success = await login(email, password);
      
      if (success) {
        // Login successful, trigger download
        const platform = platforms.find(p => p.id === selectedPlatform);
        if (platform) {
          // Create a temporary link and trigger download
          const link = document.createElement('a');
          link.href = platform.downloadUrl;
          link.download = platform.downloadUrl.split('/').pop() || 'serve-spares-installer';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Show success message
          alert(`✅ Download started for ${platform.name}!\n\nYour installer will be saved to your downloads folder.`);
          
          // Reset modal
          setShowModal(false);
          setStep('platform');
          setSelectedPlatform(null);
          setEmail('');
          setPassword('');
        }
      } else {
        setError('Invalid email or password. Please try again or register first.');
      }
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToPlatform = () => {
    setStep('platform');
    setSelectedPlatform(null);
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setStep('platform');
    setSelectedPlatform(null);
    setEmail('');
    setPassword('');
    setError('');
  };

  return (
    <>
      {/* Floating Download Button */}
      <AnimatePresence>
        {showButton && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowModal(true)}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-green-500/50 transition-all flex items-center space-x-3"
          >
            <Download size={24} className="animate-bounce" />
            <span>Download Desktop App</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Download Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-t-2xl relative">
                <button
                  onClick={handleCloseModal}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
                <div className="flex items-center space-x-3">
                  <Download size={32} />
                  <div>
                    <h2 className="text-2xl font-bold">Download Desktop App</h2>
                    <p className="text-green-100 text-sm">
                      {step === 'platform' ? 'Choose your platform' : 'Login to download'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {step === 'platform' ? (
                  // Step 1: Platform Selection
                  <div className="space-y-4">
                    <p className="text-gray-600 mb-6">
                      Select your operating system to continue:
                    </p>
                    {platforms.map((platform) => (
                      <motion.button
                        key={platform.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePlatformSelect(platform.id)}
                        className="w-full bg-gradient-to-br from-gray-50 to-gray-100 hover:from-green-50 hover:to-emerald-50 border-2 border-gray-200 hover:border-green-500 rounded-xl p-6 transition-all text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="text-5xl">{platform.icon}</div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{platform.name}</h3>
                              <p className="text-sm text-gray-600">{platform.requirements}</p>
                              <p className="text-xs text-gray-500 mt-1">Size: {platform.size}</p>
                            </div>
                          </div>
                          <Download className="text-green-600" size={24} />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  // Step 2: Login Form
                  <div>
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">
                          {platforms.find(p => p.id === selectedPlatform)?.icon}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {platforms.find(p => p.id === selectedPlatform)?.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {platforms.find(p => p.id === selectedPlatform)?.size}
                          </p>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          required
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-red-50 border-2 border-red-200 rounded-xl p-4"
                        >
                          <p className="text-red-800 text-sm font-semibold">⚠️ {error}</p>
                          <p className="text-red-600 text-xs mt-1">
                            Do not have an account? Please register first from the main page.
                          </p>
                        </motion.div>
                      )}

                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={handleBackToPlatform}
                          className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 size={20} className="animate-spin" />
                              <span>Verifying...</span>
                            </>
                          ) : (
                            <>
                              <Download size={20} />
                              <span>Login & Download</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>

                    <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-600 text-center">
                        🔒 Your credentials are verified securely. After successful login, your download will start automatically.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
