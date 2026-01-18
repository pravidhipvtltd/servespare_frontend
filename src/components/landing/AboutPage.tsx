import React, { useRef } from "react";
import { motion, useInView } from "motion/react";
import {
  Users,
  Target,
  Heart,
  Award,
  TrendingUp,
  Globe2,
  Zap,
  Shield,
  Settings,
  Package,
} from "lucide-react";
import { useLandingLanguage } from "../../contexts/LandingLanguageContext";

export const AboutPage: React.FC = () => {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <HeroSection />

      {/* Mission & Vision */}
      <MissionVision />

      {/* Our Story */}
      <OurStory />

      {/* Values */}
      <Values />

      {/* Stats */}
      <Stats />
    </div>
  );
};

const HeroSection: React.FC = () => {
  const { t } = useLandingLanguage();

  return (
    <section className="relative min-h-[60vh] flex items-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 overflow-hidden">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 opacity-10"
      >
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 2px, transparent 2px)",
            backgroundSize: "50px 50px",
          }}
        />
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center text-white"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-7xl font-bold mb-6"
          >
            {t("about.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-2xl max-w-3xl mx-auto leading-relaxed"
          >
            {t("about.subtitle")}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

const MissionVision: React.FC = () => {
  const { t } = useLandingLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const cards = [
    {
      icon: <Target size={48} />,
      titleKey: "about.mission.title",
      descKey: "about.mission.desc",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: <Heart size={48} />,
      titleKey: "about.vision.title",
      descKey: "about.vision.desc",
      color: "from-indigo-500 to-purple-600",
    },
  ];

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.2 }}
              className="bg-gradient-to-br from-gray-50 to-gray-100 p-10 rounded-3xl shadow-lg hover:shadow-xl transition-all"
            >
              <div
                className={`w-20 h-20 bg-gradient-to-br ${card.color} rounded-2xl flex items-center justify-center text-white mb-6`}
              >
                {card.icon}
              </div>
              <h2 className="text-3xl font-bold mb-4">{t(card.titleKey)}</h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                {t(card.descKey)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const OurStory: React.FC = () => {
  const { t } = useLandingLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section
      ref={ref}
      className="py-20 bg-gradient-to-br from-gray-50 to-gray-100"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6">{t("about.story.title")}</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto"></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
          className="bg-white p-10 rounded-3xl shadow-lg"
        >
          <p className="text-xl text-gray-700 leading-relaxed mb-6">
            {t("about.story.p1")}
          </p>
          <p className="text-xl text-gray-700 leading-relaxed mb-6">
            {t("about.story.p2")}
          </p>
          <p className="text-xl text-gray-700 leading-relaxed">
            {t("about.story.p3")}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

const Values: React.FC = () => {
  const { t } = useLandingLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const values = [
    {
      icon: <Zap />,
      titleKey: "about.values.innovation",
      descKey: "about.values.innovation.desc",
    },
    {
      icon: <Users />,
      titleKey: "about.values.customer",
      descKey: "about.values.customer.desc",
    },
    {
      icon: <Shield />,
      titleKey: "about.values.reliability",
      descKey: "about.values.reliability.desc",
    },
    {
      icon: <Heart />,
      titleKey: "about.values.local",
      descKey: "about.values.local.desc",
    },
    {
      icon: <Globe2 />,
      titleKey: "about.values.scalability",
      descKey: "about.values.scalability.desc",
    },
    {
      icon: <TrendingUp />,
      titleKey: "about.values.efficiency",
      descKey: "about.values.efficiency.desc",
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
          <h2 className="text-5xl font-bold mb-6">{t("about.values.title")}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t("about.values.subtitle")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-6">
                {value.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3">{t(value.titleKey)}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t(value.descKey)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Stats: React.FC = () => {
  const { t } = useLandingLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const stats = [
    { number: "1000+", labelKey: "about.stats.users", icon: <Users /> },
    { number: "50,000+", labelKey: "about.stats.parts", icon: <Package /> },
    { number: "99.9%", labelKey: "about.stats.uptime", icon: <Shield /> },
    { number: "24/7", labelKey: "about.stats.support", icon: <Heart /> },
  ];

  return (
    <section
      ref={ref}
      className="py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: index * 0.1 }}
              className="text-center text-white"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  {stat.icon}
                </div>
              </div>
              <div className="text-5xl font-bold mb-2">{stat.number}</div>
              <div className="text-xl opacity-90">{t(stat.labelKey)}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
