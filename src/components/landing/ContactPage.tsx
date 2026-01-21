import React, { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "motion/react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageCircle,
  Clock,
  Globe,
  X,
  Bot,
  User,
  Headphones,
  BookOpen,
  Users,
  Minimize2,
  Maximize2,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useLandingLanguage } from "../../contexts/LandingLanguageContext";

interface ChatMessage {
  id: number;
  sender: "user" | "bot" | "agent";
  message: string;
  timestamp: string;
}

export const ContactPage: React.FC = () => {
  const [showChatWidget, setShowChatWidget] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showHelpCenterModal, setShowHelpCenterModal] = useState(false);
  const [showForumModal, setShowForumModal] = useState(false);

  return (
    <div className="pt-20">
      {/* Hero */}
      <HeroSection />

      {/* Contact Form & Info */}
      <ContactSection />

      {/* Locations */}
      <Locations />

      {/* Support */}
      <Support
        onStartChat={() => setShowChatWidget(true)}
        onSendEmail={() => setShowEmailModal(true)}
        onOpenHelpCenter={() => setShowHelpCenterModal(true)}
        onOpenForum={() => setShowForumModal(true)}
      />

      {/* AI Chat Widget */}
      <AIChatWidget
        isOpen={showChatWidget}
        onClose={() => setShowChatWidget(false)}
      />

      {/* Email Support Modal */}
      <EmailSupportModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
      />

      {/* Help Center Modal */}
      <HelpCenterModal
        isOpen={showHelpCenterModal}
        onClose={() => setShowHelpCenterModal(false)}
      />

      {/* Community Forum Modal */}
      <CommunityForumModal
        isOpen={showForumModal}
        onClose={() => setShowForumModal(false)}
      />
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
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
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
            {t("contact.title")}
          </h1>
          <p className="text-2xl max-w-3xl mx-auto">{t("contact.subtitle")}</p>
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
    name: "",
    email: "",
    phone: "+977",
    company: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/messages/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone_number: formData.phone,
            company: formData.company,
            message: formData.message,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "+977",
        company: "",
        message: "",
      });
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to send message. Please try again.");
      setTimeout(() => {
        setErrorMessage("");
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <Mail />,
      titleKey: "contact.info.email",
      contentKey: "contact.info.email.value",
      subtextKey: "contact.info.email.sub",
    },
    {
      icon: <Phone />,
      titleKey: "contact.info.phone",
      contentKey: "contact.info.phone.value",
      subtextKey: "contact.info.phone.sub",
    },
    {
      icon: <MapPin />,
      titleKey: "contact.info.visit",
      contentKey: "contact.info.visit.value",
      subtextKey: "contact.info.visit.sub",
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
            <h2 className="text-4xl font-bold mb-6">
              {t("contact.form.title")}
            </h2>
            <p className="text-gray-600 mb-8">{t("contact.form.subtitle")}</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  {t("contact.name")} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder={t("contact.name.placeholder")}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  {t("contact.email")} *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder={t("contact.email.placeholder")}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  {t("contact.phone")}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="+977"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  {t("contact.company")}
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder={t("contact.company.placeholder")}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  {t("contact.message")} *
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  placeholder={t("contact.message.placeholder")}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold flex items-center justify-center space-x-2 hover:shadow-lg transition-all ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={20} />
                )}
                <span>{isSubmitting ? "Sending..." : t("contact.send")}</span>
              </motion.button>

              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border-2 border-red-500 text-red-700 px-6 py-4 rounded-xl"
                >
                  {errorMessage}
                </motion.div>
              )}

              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 border-2 border-green-500 text-green-700 px-6 py-4 rounded-xl"
                >
                  {t("contact.success")}
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
            <h2 className="text-4xl font-bold mb-8">
              {t("contact.info.title")}
            </h2>

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
                    <h3 className="font-bold text-lg mb-1">
                      {t(info.titleKey)}
                    </h3>
                    <p className="text-gray-800 font-medium mb-1">
                      {t(info.contentKey)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t(info.subtextKey)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Google Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="h-64 rounded-2xl shadow-lg overflow-hidden border-2 border-white"
            >
              <iframe
                title="Location Map"
                src="https://maps.google.com/maps?q=Pravidhi+Digital+Innovations+Nepal+Pvt+Ltd&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
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
      cityKey: "contact.location.Kathmandu",
      regionKey: "contact.location.Kathmandu.region",
      addressKey: "contact.location.Kathmandu.address",
      phone: "+977 1234567890",
      flag: "🇳🇵",
    },
    {
      cityKey: "contact.location.Pokhara",
      regionKey: "contact.location.Pokhara.region",
      addressKey: "contact.location.Pokhara.address",
      phone: "+977 9876543210",
      flag: "🇳🇵",
    },
    {
      cityKey: "contact.location.biratnagar",
      regionKey: "contact.location.biratnagar.region",
      addressKey: "contact.location.biratnagar.address",
      phone: "+977 5551234567",
      flag: "🇳🇵",
    },
    {
      cityKey: "contact.location.bharatpur",
      regionKey: "contact.location.bharatpur.region",
      addressKey: "contact.location.bharatpur.address",
      phone: "+977 4445556677",
      flag: "🇳🇵",
    },
  ];

  return (
    <section
      ref={ref}
      className="py-20 bg-gradient-to-br from-gray-50 to-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6">
            {t("contact.locations.title")}
          </h2>
          <p className="text-xl text-gray-600">
            {t("contact.locations.subtitle")}
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
              <p className="text-indigo-600 font-semibold mb-4">
                {t(location.regionKey)}
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <p>{t(location.addressKey)}</p>
                <p className="font-semibold text-indigo-600">
                  {location.phone}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Support: React.FC<{
  onStartChat: () => void;
  onSendEmail: () => void;
  onOpenHelpCenter: () => void;
  onOpenForum: () => void;
}> = ({ onStartChat, onSendEmail, onOpenHelpCenter, onOpenForum }) => {
  const { t } = useLandingLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const supportOptions = [
    {
      icon: <MessageCircle />,
      title: "Live Chat",
      desc: "Chat with our support team in real-time during business hours",
      action: "Start Chat →",
      color: "from-blue-500 to-blue-600",
      onClick: onStartChat,
    },
    {
      icon: <Mail />,
      title: "Email Support",
      desc: "Send us an email and get a response within 24 hours",
      action: "Send Email →",
      color: "from-purple-500 to-purple-600",
      onClick: onSendEmail,
    },
    {
      icon: <BookOpen />,
      title: "Help Center",
      desc: "Browse our comprehensive documentation and video tutorials",
      action: "Visit Help Center →",
      color: "from-green-500 to-green-600",
      onClick: onOpenHelpCenter,
    },
    {
      icon: <Users />,
      title: "Community Forum",
      desc: "Connect with other auto parts shop owners using Serve Spares",
      action: "Join Forum →",
      color: "from-orange-500 to-red-600",
      onClick: onOpenForum,
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
          <h2 className="text-5xl font-bold mb-6">Need Help?</h2>
          <p className="text-xl text-gray-600">
            Multiple ways to get the support you need, when you need it.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {supportOptions.map((option, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.05 }}
              className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all text-center cursor-pointer border-2 border-gray-100"
              onClick={option.onClick}
            >
              <div
                className={`w-16 h-16 bg-gradient-to-br ${option.color} rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg`}
              >
                {option.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">
                {option.title}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {option.desc}
              </p>
              <button className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors flex items-center justify-center mx-auto space-x-2">
                <span>{option.action}</span>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const AIChatWidget: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: "bot",
      message: "Hello! I'm your AI assistant. How can I help you today?",
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [transferToAgent, setTransferToAgent] = useState(false);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newUserMessage: ChatMessage = {
      id: messages.length + 1,
      sender: "user",
      message: inputMessage,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, newUserMessage]);
    setInputMessage("");

    // Simulate AI response
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: messages.length + 2,
        sender: "bot",
        message:
          "Thank you for your message! I'm analyzing your request. Would you like me to transfer you to a human agent?",
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  const handleTransferToAgent = () => {
    setTransferToAgent(true);
    const agentMessage: ChatMessage = {
      id: messages.length + 1,
      sender: "agent",
      message:
        "Hi! I'm Sarah from Serve Spares support. I've reviewed your conversation. How can I assist you further?",
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages([...messages, agentMessage]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            height: isMinimized ? "60px" : "500px",
          }}
          exit={{ opacity: 0, y: 100, scale: 0.8 }}
          className="fixed bottom-6 right-6 z-50 w-96 bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-indigo-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                {transferToAgent ? (
                  <Headphones className="text-indigo-600" size={20} />
                ) : (
                  <Bot className="text-indigo-600" size={20} />
                )}
              </div>
              <div className="text-white">
                <h3 className="font-bold">
                  {transferToAgent ? "Support Agent" : "AI Assistant"}
                </h3>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-xs">Online</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
              >
                {isMinimized ? (
                  <Maximize2 size={18} />
                ) : (
                  <Minimize2 size={18} />
                )}
              </button>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    } items-start space-x-2`}
                  >
                    {msg.sender !== "user" && (
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          msg.sender === "agent"
                            ? "bg-green-500"
                            : "bg-indigo-600"
                        }`}
                      >
                        {msg.sender === "agent" ? (
                          <Headphones className="text-white" size={16} />
                        ) : (
                          <Bot className="text-white" size={16} />
                        )}
                      </div>
                    )}
                    <div
                      className={`max-w-xs ${
                        msg.sender === "user" ? "order-first" : ""
                      }`}
                    >
                      <div
                        className={`${
                          msg.sender === "user"
                            ? "bg-indigo-600 text-white"
                            : msg.sender === "agent"
                            ? "bg-green-100 text-gray-800"
                            : "bg-white text-gray-800"
                        } p-3 rounded-2xl shadow-sm`}
                      >
                        <p className="text-sm">{msg.message}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 px-2">
                        {msg.timestamp}
                      </p>
                    </div>
                    {msg.sender === "user" && (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="text-gray-600" size={16} />
                      </div>
                    )}
                  </div>
                ))}

                {!transferToAgent && messages.length > 1 && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={handleTransferToAgent}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <Headphones size={18} />
                    <span>Transfer to Human Agent</span>
                  </motion.button>
                )}
              </div>

              {/* Input */}
              <div className="p-4 bg-white border-t-2 border-gray-100">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-full hover:shadow-lg transition-all"
                  >
                    <Send size={20} />
                  </motion.button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const EmailSupportModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    priority: "normal",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        priority: "normal",
      });
      onClose();
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          ></div>

          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                    <Mail className="text-purple-600" size={24} />
                  </div>
                  <div className="text-white">
                    <h3 className="text-2xl font-bold">Email Support</h3>
                    <p className="text-sm opacity-90">
                      We&apos;ll respond within 24 hours
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="p-8">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Priority Level
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({ ...formData, priority: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                      placeholder="Please describe your issue or question in detail..."
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-full font-semibold flex items-center justify-center space-x-2 hover:shadow-lg transition-all"
                  >
                    <Send size={20} />
                    <span>Send Email</span>
                  </motion.button>
                </form>
              ) : (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="text-green-600" size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    Email Sent Successfully!
                  </h3>
                  <p className="text-gray-600">
                    We&apos;ll get back to you within 24 hours.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const HelpCenterModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    {
      title: "Getting Started",
      icon: "🚀",
      articles: [
        "Setting up your account",
        "Dashboard overview",
        "Adding your first inventory items",
        "Creating user roles",
      ],
    },
    {
      title: "Inventory Management",
      icon: "📦",
      articles: [
        "Adding new parts",
        "Tracking stock levels",
        "Setting up alerts",
        "Barcode scanning",
      ],
    },
    {
      title: "Billing & Invoices",
      icon: "💰",
      articles: [
        "Creating invoices",
        "Payment methods",
        "Tax configuration",
        "Receipt printing",
      ],
    },
    {
      title: "Reports & Analytics",
      icon: "📊",
      articles: [
        "Sales reports",
        "Inventory reports",
        "Performance metrics",
        "Export data",
      ],
    },
  ];

  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      articles: cat.articles.filter(
        (article) =>
          article.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((cat) => cat.articles.length > 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          ></div>

          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                    <BookOpen className="text-green-600" size={24} />
                  </div>
                  <div className="text-white">
                    <h3 className="text-2xl font-bold">Help Center</h3>
                    <p className="text-sm opacity-90">
                      Find answers to your questions
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Search */}
              <div className="mt-6">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for help articles..."
                  className="w-full px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-800"
                />
              </div>
            </div>

            {/* Content */}
            <div className="p-8 max-h-[60vh] overflow-y-auto">
              <div className="grid md:grid-cols-2 gap-6">
                {filteredCategories.map((category, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border-2 border-gray-100"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-4xl">{category.icon}</span>
                      <h4 className="text-xl font-bold text-gray-800">
                        {category.title}
                      </h4>
                    </div>
                    <ul className="space-y-2">
                      {category.articles.map((article, articleIdx) => (
                        <li key={articleIdx}>
                          <button className="text-indigo-600 hover:text-indigo-700 hover:underline text-left flex items-center space-x-2">
                            <ArrowRight size={16} />
                            <span>{article}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>

              {filteredCategories.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-500">
                    No articles found for "{searchQuery}"
                  </p>
                  <p className="text-gray-400 mt-2">Try different keywords</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const CommunityForumModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const forumTopics = [
    {
      title: "Best practices for inventory organization",
      author: "Rajesh K.",
      replies: 24,
      views: 156,
      category: "Inventory",
      emoji: "📦",
    },
    {
      title: "How to handle seasonal demand variations?",
      author: "Sita M.",
      replies: 18,
      views: 203,
      category: "Strategy",
      emoji: "📈",
    },
    {
      title: "Integration with eSewa - Success Story",
      author: "Amit P.",
      replies: 32,
      views: 421,
      category: "Payments",
      emoji: "💰",
    },
    {
      title: "Multi-branch management tips",
      author: "Krishna B.",
      replies: 15,
      views: 189,
      category: "Operations",
      emoji: "🏢",
    },
    {
      title: "Customer retention strategies that work",
      author: "Deepak S.",
      replies: 27,
      views: 312,
      category: "Marketing",
      emoji: "🎯",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          ></div>

          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                    <Users className="text-orange-600" size={24} />
                  </div>
                  <div className="text-white">
                    <h3 className="text-2xl font-bold">Community Forum</h3>
                    <p className="text-sm opacity-90">
                      Connect with 5,000+ auto parts business owners
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 max-h-[60vh] overflow-y-auto">
              <div className="space-y-4">
                {forumTopics.map((topic, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ x: 5 }}
                    className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border-2 border-gray-100 cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <span className="text-3xl">{topic.emoji}</span>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-800 mb-2">
                            {topic.title}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <User size={14} />
                              <span>{topic.author}</span>
                            </span>
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-semibold">
                              {topic.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2 text-sm text-gray-600">
                        <span>{topic.replies} replies</span>
                        <span>{topic.views} views</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Join Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-8 bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-full font-semibold flex items-center justify-center space-x-2 hover:shadow-lg transition-all"
              >
                <Users size={20} />
                <span>Join the Community</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
