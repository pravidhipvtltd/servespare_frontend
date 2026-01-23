import React, { useState } from "react";
import { motion } from "motion/react";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Clock,
  CreditCard,
  Shield,
  Truck,
  Award,
  ChevronRight,
  Settings,
  Heart,
} from "lucide-react";

export const CustomerFooter: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <button className="flex items-center space-x-3">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center"
              >
                <Settings className="text-white" size={28} />
              </motion.div>
            </button>
            <h3 className="font-bold text-xl mb-3">
              Serve Spares - Inventory System
            </h3>
            <p className="text-gray-400 mb-4">
              Nepal's premier destination for authentic auto parts. Quality you
              can trust, prices you'll love.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                <span className="text-gray-300">, Nepal</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <span className="text-gray-300">+977 9864430493</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <span className="text-gray-300">support@servespares.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <span className="text-gray-300">24/7 Customer Support</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Follow Us</h4>
              <div className="flex space-x-3">
                <motion.a
                  whileHover={{ scale: 1.1, y: -2 }}
                  href="#"
                  className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center hover:from-blue-500 hover:to-blue-600 transition-all"
                >
                  <Facebook className="w-5 h-5" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1, y: -2 }}
                  href="#"
                  className="w-10 h-10 bg-gradient-to-br from-pink-600 to-purple-700 rounded-full flex items-center justify-center hover:from-pink-500 hover:to-purple-600 transition-all"
                >
                  <Instagram className="w-5 h-5" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1, y: -2 }}
                  href="#"
                  className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center hover:from-blue-300 hover:to-blue-400 transition-all"
                >
                  <Twitter className="w-5 h-5" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1, y: -2 }}
                  href="#"
                  className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center hover:from-red-500 hover:to-red-600 transition-all"
                >
                  <Youtube className="w-5 h-5" />
                </motion.a>
              </div>
            </div>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-bold text-lg mb-4">Customer Service</h4>
            <ul className="space-y-2">
              {[
                "Help Center",
                "Track Order",
                "Returns & Refunds",
                "Shipping Info",
                "Warranty Policy",
                "Payment Methods",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-purple-400 transition-colors flex items-center space-x-2 group"
                  >
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    <span>{item}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                "About Us",
                "Our Story",
                "Careers",
                "Blog",
                "Press Kit",
                "Contact Us",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-purple-400 transition-colors flex items-center space-x-2 group"
                  >
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    <span>{item}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="font-bold text-lg mb-4">Popular Categories</h4>
            <ul className="space-y-2">
              {[
                "Engine Parts",
                "Brake Systems",
                "Lighting",
                "Suspension",
                "Wheels & Tires",
                "Electronics",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-purple-400 transition-colors flex items-center space-x-2 group"
                  >
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    <span>{item}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Features Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-t border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h5 className="font-semibold text-sm">Free Delivery</h5>
              <p className="text-xs text-gray-400">On orders over NPR 5000</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h5 className="font-semibold text-sm">Secure Payment</h5>
              <p className="text-xs text-gray-400">100% Protected</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h5 className="font-semibold text-sm">Authentic Parts</h5>
              <p className="text-xs text-gray-400">Genuine Products</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h5 className="font-semibold text-sm">Easy Returns</h5>
              <p className="text-xs text-gray-400">7 Day Return Policy</p>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="py-6 border-b border-gray-700">
          <h4 className="font-semibold mb-4">Accepted Payment Methods</h4>
          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-white px-4 py-2 rounded-lg">
              <span className="text-purple-600 font-bold">eSewa</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg">
              <span className="text-blue-600 font-bold">FonePay</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg">
              <span className="text-gray-900 font-bold">Cash on Delivery</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg">
              <span className="text-red-600 font-bold">Khalti</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © 2024 Serve Spares - Inventory System. All rights reserved. Made
              with{" "}
              <Heart className="w-4 h-4 inline text-red-500 fill-red-500" /> in
              Nepal
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <a
                href="#"
                className="text-gray-400 hover:text-purple-400 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-purple-400 transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-purple-400 transition-colors"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
