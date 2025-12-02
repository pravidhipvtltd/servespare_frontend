import React, { useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { Smartphone, MessageCircle } from 'lucide-react';
import { useLandingLanguage } from '../../contexts/LandingLanguageContext';
import { ContactModal } from '../ContactModal';
import serveSparesLogo from 'figma:asset/21c6740f21b1ace618daa199363b9be61bdfe73e.png';

type PageType = 'home' | 'about' | 'features' | 'pricing' | 'contact' | 'blog';

interface ModernFooterProps {
  setShowLogin: (show: boolean) => void;
  onNavigate: (page: PageType) => void;
  currentPage?: PageType; // Add currentPage prop
}

export const ModernFooter: React.FC<ModernFooterProps> = ({ setShowLogin, onNavigate, currentPage }) => {
  const { t, language } = useLandingLanguage();
  const [isContactModalOpen, setContactModalOpen] = useState(false);

  return (
    <>
      {/* Only show Blog and Mobile App sections on home page */}
      {currentPage === 'home' && (
        <>
          {/* Blog Section */}
          <BlogSection onNavigate={onNavigate} />
          
          {/* Mobile App Section */}
          <MobileAppSection onNavigate={onNavigate} setContactModalOpen={setContactModalOpen} />
        </>
      )}
      
      {/* Main Footer - Always visible on all pages */}
      <MainFooter setShowLogin={setShowLogin} onNavigate={onNavigate} currentPage={currentPage} />
      
      {/* Contact Modal */}
      <ContactModal isOpen={isContactModalOpen} onClose={() => setContactModalOpen(false)} />
    </>
  );
};

// Blog Section
const BlogSection: React.FC<{ onNavigate: (page: PageType) => void }> = ({ onNavigate }) => {
  const { t, language } = useLandingLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const blogPosts = [
    {
      title: language === 'en' ? 'Revolutionizing Auto Parts Operations: The Power of Automation' : 'अटो पार्ट्स सञ्चालनमा क्रान्ति: स्वचालनको शक्ति',
      date: language === 'en' ? 'Published on Nov 22, 2024' : 'नोभेम्बर २२, २०२४ मा प्रकाशित',
      image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop'
    },
    {
      title: language === 'en' ? 'New Inventory Management Systems: Enhance Guest Satisfaction' : 'नयाँ सूची व्यवस्थापन प्रणाली: अतिथि सन्तुष्टि बढाउनुहोस्',
      date: language === 'en' ? 'Published on Nov 22, 2024' : 'नोभेम्बर २२, २०२४ मा प्रकाशित',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop'
    },
    {
      title: language === 'en' ? 'From Manual Chaos to Digital Order: Why Every Business Needs Auto Parts Software' : 'म्यानुअल अराजकता देखि डिजिटल व्यवस्था: किन हरेक व्यवसायलाई अटो पार्ट्स सफ्टवेयर चाहिन्छ',
      date: language === 'en' ? 'Published on Nov 22, 2024' : 'नोभेम्बर २२, २०२४ मा प्रकाशित',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop'
    }
  ];

  return (
    <section ref={ref} className="py-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 items-start">
          {/* Blog Posts - 3 columns */}
          {blogPosts.map((post, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1 }}
              onClick={() => onNavigate('blog')}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-dashed border-indigo-200"
            >
              <div className="h-40 overflow-hidden">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <h3 className="font-bold mb-2 line-clamp-2 h-12">{post.title}</h3>
                <p className="text-sm text-gray-500">{post.date}</p>
              </div>
            </motion.div>
          ))}

          {/* Call to Action - 1 column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-indigo-50 to-purple-100 rounded-2xl p-8 border-2 border-dashed border-indigo-300 flex flex-col justify-center items-center text-center h-full"
          >
            <h3 className="text-xl font-bold text-indigo-600 mb-4">{t('footer.blog.title')}</h3>
            <p className="text-gray-700 mb-6">{t('footer.blog.subtitle')}</p>
            <button
              onClick={() => onNavigate('blog')}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all hover:scale-105"
            >
              {t('footer.blog.readmore')}
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Mobile App Section
const MobileAppSection: React.FC<{ onNavigate: (page: PageType) => void; setContactModalOpen: (open: boolean) => void }> = ({ onNavigate, setContactModalOpen }) => {
  const { t } = useLandingLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-10 left-10 w-72 h-72 bg-indigo-300 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-10 right-10 w-96 h-96 bg-purple-300 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <motion.h2 
              className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
            >
              {t('footer.app.title')}
            </motion.h2>
            
            <motion.p 
              className="text-gray-700 mb-8 leading-relaxed text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
            >
              {t('footer.app.subtitle')}
            </motion.p>
            
            {/* Download Buttons */}
            <motion.div 
              className="flex flex-wrap gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
            >
              <motion.a 
                href="#" 
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="hover:opacity-80 transition-all shadow-lg hover:shadow-xl"
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" className="h-14" />
              </motion.a>
              <motion.a 
                href="#" 
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="hover:opacity-80 transition-all shadow-lg hover:shadow-xl"
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="Download on the App Store" className="h-14" />
              </motion.a>
            </motion.div>

            {/* Contact Us Button */}
            <motion.button
              onClick={() => setContactModalOpen(true)}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(99, 102, 241, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all group"
            >
              <MessageCircle className="h-6 w-6 mr-2" />
              <span className="text-lg">Need Help? Contact Us Now</span>
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </motion.svg>
            </motion.button>
          </motion.div>

          {/* Right - Phone Mockups */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative flex justify-center items-center"
          >
            <div className="relative">
              {/* Phone 1 - Main */}
              <motion.div
                animate={{ 
                  y: [0, -15, 0],
                  rotateY: [0, 5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
                className="w-64 h-[520px] bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 rounded-[3rem] shadow-2xl relative overflow-hidden border-8 border-gray-900"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-3xl z-20"></div>
                
                {/* Screen Content */}
                <div className="p-6 mt-10 flex flex-col items-center justify-center h-full text-white relative">
                  {/* Animated Gradient Overlay */}
                  <motion.div
                    animate={{
                      background: [
                        'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                        'linear-gradient(225deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                        'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0"
                  />
                  
                  <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 w-full shadow-xl border border-white/20 relative z-10">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <Smartphone size={80} className="mx-auto mb-4" />
                    </motion.div>
                    <p className="text-center font-bold text-xl">ServeSpares</p>
                    <p className="text-center text-sm opacity-90">Inventory System</p>
                  </div>
                </div>

                {/* Shine Effect */}
                <motion.div
                  animate={{
                    x: [-100, 400],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: "easeInOut"
                  }}
                  className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                />
              </motion.div>

              {/* Phone 2 - Overlapping */}
              <motion.div
                animate={{ 
                  y: [0, 15, 0],
                  rotateY: [0, -5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse', delay: 0.5 }}
                className="absolute top-12 -right-20 w-56 h-[470px] bg-gradient-to-br from-purple-600 via-pink-600 to-purple-800 rounded-[3rem] shadow-2xl overflow-hidden border-8 border-gray-900"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-28 h-6 bg-gray-900 rounded-b-3xl z-20"></div>
                
                {/* Screen Content */}
                <div className="p-6 mt-9 flex flex-col items-center justify-center h-full text-white relative">
                  {/* Animated Gradient Overlay */}
                  <motion.div
                    animate={{
                      background: [
                        'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                        'linear-gradient(315deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                        'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                    className="absolute inset-0"
                  />
                  
                  <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-5 w-full shadow-xl border border-white/20 relative z-10">
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <Smartphone size={70} className="mx-auto mb-3" />
                    </motion.div>
                    <p className="text-center font-bold text-lg">ServeSpares</p>
                    <p className="text-center text-xs opacity-90">Inventory System</p>
                  </div>
                </div>

                {/* Shine Effect */}
                <motion.div
                  animate={{
                    x: [-100, 400],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2,
                    delay: 1,
                    ease: "easeInOut"
                  }}
                  className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Tagline Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-16 relative"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden"
          >
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <motion.div
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%'],
                }}
                transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
                className="w-full h-full"
                style={{
                  backgroundImage: 'radial-gradient(circle, white 2px, transparent 2px)',
                  backgroundSize: '50px 50px'
                }}
              />
            </div>
            
            <motion.p 
              className="text-3xl font-bold text-white relative z-10"
              animate={{
                textShadow: [
                  '0 0 20px rgba(255,255,255,0.5)',
                  '0 0 30px rgba(255,255,255,0.8)',
                  '0 0 20px rgba(255,255,255,0.5)',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {t('footer.app.tagline')}
            </motion.p>
            
            {/* Decorative Elements */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute top-4 left-4 w-16 h-16 border-4 border-white/30 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-4 right-4 w-20 h-20 border-4 border-white/30 rounded-full"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// Main Footer
const MainFooter: React.FC<{ setShowLogin: (show: boolean) => void; onNavigate: (page: PageType) => void; currentPage?: PageType }> = ({ setShowLogin, onNavigate, currentPage }) => {
  const { t } = useLandingLanguage();

  return (
    <footer className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                <motion.img 
                  src={serveSparesLogo} 
                  alt="Serve Spares Logo" 
                  className="w-7 h-7 object-contain"
                  animate={{ rotate: [0, 360] }}
                  transition={{ 
                    duration: 20, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                />
              </div>
              <div>
                <div className="font-bold text-lg">ServeSpares</div>
              </div>
            </div>
            <p className="text-white/80 text-sm leading-relaxed mb-6">
              {t('footer.description')}
            </p>
            
            {/* Social Media Icons - FontAwesome Style */}
            <div className="flex space-x-3">
              <a href="#" className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.441 16.892c-2.102.144-6.784.144-8.883 0C5.282 16.736 5.017 15.622 5 12c.017-3.629.285-4.736 2.558-4.892 2.099-.144 6.782-.144 8.883 0C18.718 7.264 18.982 8.378 19 12c-.018 3.629-.285 4.736-2.559 4.892zM10 9.658l4.917 2.338L10 14.342V9.658z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">{t('footer.quicklinks')}</h3>
            <ul className="space-y-2 text-white/80 text-sm">
              <li><button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">{t('nav.home')}</button></li>
              <li><button onClick={() => onNavigate('features')} className="hover:text-white transition-colors">{t('footer.features')}</button></li>
              <li><button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">{t('footer.about')}</button></li>
              <li><button onClick={() => onNavigate('blog')} className="hover:text-white transition-colors">{t('footer.blog')}</button></li>
            </ul>
          </div>

          {/* Plans */}
          <div>
            <h3 className="font-bold text-lg mb-4">{t('footer.plans')}</h3>
            <ul className="space-y-2 text-white/80 text-sm">
              <li><button onClick={() => onNavigate('pricing')} className="hover:text-white transition-colors">Standard Plan</button></li>
              <li><button onClick={() => onNavigate('pricing')} className="hover:text-white transition-colors">Premium Plan</button></li>
              <li><button onClick={() => onNavigate('pricing')} className="hover:text-white transition-colors">Pro Plan</button></li>
              <li><button onClick={() => onNavigate('pricing')} className="hover:text-white transition-colors">Life time Plan</button></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-lg mb-4">{t('footer.support')}</h3>
            <ul className="space-y-2 text-white/80 text-sm">
              <li><button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">About Us</button></li>
              <li><button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">{t('footer.terms')}</button></li>
              <li><button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">{t('footer.privacy')}</button></li>
              <li><button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">{t('footer.contactus')}</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-2 text-white/80 text-sm">
              <li className="flex items-center space-x-2">
                <span>📧</span>
                <span>{t('footer.email')}</span>
              </li>
              <li className="flex items-center space-x-2">
                <span>📞</span>
                <span>{t('footer.phone')}</span>
              </li>
              <li className="flex items-center space-x-2">
                <span>📍</span>
                <span>{t('footer.address')}</span>
              </li>
              <li className="flex items-center space-x-2">
                <span>🕐</span>
                <span>{t('footer.hours')}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-white/80 text-sm">
            <p>© {new Date().getFullYear()} SERVE SPARES. DEVELOPED IN PARTNERSHIP WITH <span className="text-white font-bold">PRAVIDHI</span></p>
          </div>
        </div>
      </div>
    </footer>
  );
};