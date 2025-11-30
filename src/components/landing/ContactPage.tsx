import React, { useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, Globe } from 'lucide-react';
import { useLandingLanguage } from '../../contexts/LandingLanguageContext';

export const ContactPage: React.FC = () => {
  return (
    <div className="pt-20">
      {/* Hero */}
      <HeroSection />
      
      {/* Contact Form & Info */}
      <ContactSection />
      
      {/* Locations */}
      <Locations />
      
      {/* Support */}
      <Support />
    </div>
  );
};

const HeroSection: React.FC = () => {
  const { t } = useLandingLanguage();
  
  return (
    <section className="relative min-h-[50vh] flex items-center bg-gradient-to-br from-pink-600 via-red-600 to-orange-600 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-white"
        >
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            {t('contact.title')}
          </h1>
          <p className="text-2xl max-w-3xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

const ContactSection: React.FC = () => {
  const { t } = useLandingLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', company: '', message: '' });
    }, 3000);
  };

  const contactInfo = [
    {
      icon: <Mail />,
      titleKey: 'contact.info.email',
      contentKey: 'contact.info.email.value',
      subtextKey: 'contact.info.email.sub'
    },
    {
      icon: <Phone />,
      titleKey: 'contact.info.phone',
      contentKey: 'contact.info.phone.value',
      subtextKey: 'contact.info.phone.sub'
    },
    {
      icon: <MapPin />,
      titleKey: 'contact.info.visit',
      contentKey: 'contact.info.visit.value',
      subtextKey: 'contact.info.visit.sub'
    },
  ];

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
          >
            <h2 className="text-4xl font-bold mb-6">{t('contact.form.title')}</h2>
            <p className="text-gray-600 mb-8">
              {t('contact.form.subtitle')}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">{t('contact.name')} *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder={t('contact.name.placeholder')}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">{t('contact.email')} *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder={t('contact.email.placeholder')}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">{t('contact.phone')}</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder={t('contact.phone.placeholder')}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">{t('contact.company')}</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder={t('contact.company.placeholder')}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">{t('contact.message')} *</label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  placeholder={t('contact.message.placeholder')}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold flex items-center justify-center space-x-2 hover:shadow-lg transition-all"
              >
                <Send size={20} />
                <span>{t('contact.send')}</span>
              </motion.button>

              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 border-2 border-green-500 text-green-700 px-6 py-4 rounded-xl"
                >
                  {t('contact.success')}
                </motion.div>
              )}
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            className="space-y-6"
          >
            <h2 className="text-4xl font-bold mb-8">{t('contact.info.title')}</h2>
            
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                    {info.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{t(info.titleKey)}</h3>
                    <p className="text-gray-800 font-medium mb-1">{t(info.contentKey)}</p>
                    <p className="text-sm text-gray-600">{t(info.subtextKey)}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Map Placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 h-64 rounded-2xl flex items-center justify-center text-white shadow-lg overflow-hidden"
            >
              <div className="text-center">
                <MapPin size={48} className="mx-auto mb-3" />
                <p className="text-lg font-bold">{t('contact.map.title')}</p>
                <p className="text-sm opacity-70 mt-2">{t('contact.map.subtitle')}</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Locations: React.FC = () => {
  const { t } = useLandingLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const locations = [
    {
      cityKey: 'contact.location.kathmandu',
      regionKey: 'contact.location.kathmandu.region',
      addressKey: 'contact.location.kathmandu.address',
      phone: '+977 1234567890',
      flag: '🇳🇵'
    },
    {
      cityKey: 'contact.location.pokhara',
      regionKey: 'contact.location.pokhara.region',
      addressKey: 'contact.location.pokhara.address',
      phone: '+977 9876543210',
      flag: '🇳🇵'
    },
    {
      cityKey: 'contact.location.biratnagar',
      regionKey: 'contact.location.biratnagar.region',
      addressKey: 'contact.location.biratnagar.address',
      phone: '+977 5551234567',
      flag: '🇳🇵'
    },
    {
      cityKey: 'contact.location.bharatpur',
      regionKey: 'contact.location.bharatpur.region',
      addressKey: 'contact.location.bharatpur.address',
      phone: '+977 4445556677',
      flag: '🇳🇵'
    },
  ];

  return (
    <section ref={ref} className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6">{t('contact.locations.title')}</h2>
          <p className="text-xl text-gray-600">
            {t('contact.locations.subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {locations.map((location, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all text-center"
            >
              <div className="text-6xl mb-4">{location.flag}</div>
              <h3 className="text-2xl font-bold mb-2">{t(location.cityKey)}</h3>
              <p className="text-indigo-600 font-semibold mb-4">{t(location.regionKey)}</p>
              <div className="space-y-2 text-sm text-gray-600">
                <p>{t(location.addressKey)}</p>
                <p className="font-semibold text-indigo-600">{location.phone}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Support: React.FC = () => {
  const { t } = useLandingLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const supportOptions = [
    {
      icon: <MessageCircle />,
      titleKey: 'contact.support.chat',
      descKey: 'contact.support.chat.desc',
      actionKey: 'contact.support.chat.action',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <Mail />,
      titleKey: 'contact.support.email',
      descKey: 'contact.support.email.desc',
      actionKey: 'contact.support.email.action',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: <Clock />,
      titleKey: 'contact.support.help',
      descKey: 'contact.support.help.desc',
      actionKey: 'contact.support.help.action',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: <Globe />,
      titleKey: 'contact.support.forum',
      descKey: 'contact.support.forum.desc',
      actionKey: 'contact.support.forum.action',
      color: 'from-orange-500 to-red-600'
    },
  ];

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6">{t('contact.support.title')}</h2>
          <p className="text-xl text-gray-600">
            {t('contact.support.subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {supportOptions.map((option, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all text-center"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${option.color} rounded-2xl flex items-center justify-center text-white mx-auto mb-6`}>
                {option.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{t(option.titleKey)}</h3>
              <p className="text-gray-600 mb-6">{t(option.descKey)}</p>
              <button className="text-indigo-600 font-semibold hover:underline">
                {t(option.actionKey)} →
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};