import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthModal from '../../components/landing/AuthModal.jsx';
import logo from '../../Image/logo.jpg';
import {
  LogIn,
  LayoutDashboard,
  Package,
  Warehouse,
  BarChart3,
  Users,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  FileCheck,
  ClipboardCheck,
  TrendingUp,
} from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

export default function Landing() {
  const [authMode, setAuthMode] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const features = [
    {
      icon: Package,
      title: 'Inventory Management',
      description: 'Track stock levels, locations, and movements in real-time with advanced batch and serial number tracking.',
    },
    {
      icon: Warehouse,
      title: 'Warehouse Operations',
      description: 'Streamline receiving, inspection, picking, packing, and shipping operations with barcode scanning.',
    },
    {
      icon: BarChart3,
      title: 'Reports & Analytics',
      description: 'Generate comprehensive reports on inventory, discrepancies, defects, and operational efficiency.',
    },
    {
      icon: FileCheck,
      title: 'Quality Control',
      description: 'Manage inspections, create defect reports, and track quality metrics throughout your operations.',
    },
    {
      icon: ClipboardCheck,
      title: 'Order Fulfillment',
      description: 'Process orders efficiently with integrated picking, packing, and multi-marketplace support.',
    },
    {
      icon: Users,
      title: 'Role-Based Access',
      description: 'Secure system with granular permissions for Admin, Manager, Operational, Warehouse, and Sales staff.',
    },
  ];

  const benefits = [
    'Real-time inventory visibility',
    'Automated stock level alerts',
    'Multi-location warehouse support',
    'Batch and serial number tracking',
    'Barcode generation and scanning',
    'Discrepancy and defect tracking',
    'Marketplace integration (Shopee, TikTok, Lazada)',
    'Comprehensive audit trails',
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200">
                <img src={logo} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-900">Inventory Management</h1>
                <p className="text-xs text-slate-500">Warehouse Operations</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Features
              </a>
              <a href="#benefits" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Benefits
              </a>
              <a href="#contact" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Contact
              </a>
            </div>

            {/* CTA Button */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setAuthMode('login')}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <LogIn size={16} />
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 border-t border-slate-200"
            >
              <div className="flex flex-col gap-3">
                <a
                  href="#features"
                  className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#benefits"
                  className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Benefits
                </a>
                <a
                  href="#contact"
                  className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </a>
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setMobileMenuOpen(false);
                  }}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <LogIn size={16} />
                  Get Started
                </button>
              </div>
            </motion.div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            {/* Left Column */}
            <motion.div variants={fadeInUp}>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium mb-6">
                <Zap size={14} />
                Enterprise Warehouse Management
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Streamline Your Inventory Operations
              </h1>

              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Comprehensive inventory management system designed for modern warehouses. Track inventory, manage
                orders, and optimize operations with real-time visibility and powerful reporting.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setAuthMode('signup')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                >
                  Get Started
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => setAuthMode('login')}
                  className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-900 font-medium rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                  <LogIn size={18} />
                  Sign In
                </button>
              </div>
            </motion.div>

            {/* Right Column - Stats Cards */}
            <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <LayoutDashboard size={32} className="text-blue-600 mb-3" />
                <p className="text-2xl font-bold text-slate-900 mb-1">Real-Time</p>
                <p className="text-sm text-slate-600">Inventory Tracking</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <Package size={32} className="text-emerald-600 mb-3" />
                <p className="text-2xl font-bold text-slate-900 mb-1">Multi-Location</p>
                <p className="text-sm text-slate-600">Warehouse Support</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <BarChart3 size={32} className="text-purple-600 mb-3" />
                <p className="text-2xl font-bold text-slate-900 mb-1">Advanced</p>
                <p className="text-sm text-slate-600">Reporting & Analytics</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <Shield size={32} className="text-amber-600 mb-3" />
                <p className="text-2xl font-bold text-slate-900 mb-1">Secure</p>
                <p className="text-sm text-slate-600">Role-Based Access</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium mb-4">
              <TrendingUp size={14} />
              Powerful Features
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to Manage Your Warehouse
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From receiving to shipping, our comprehensive system covers every aspect of warehouse operations.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-lg mb-4">
                  <feature.icon size={24} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeInUp}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium mb-4">
                <CheckCircle size={14} />
                Key Benefits
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Built for Modern Warehouse Operations
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Our system is designed to handle the complexities of modern inventory management with features that
                save time, reduce errors, and improve efficiency.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeInUp}
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm"
            >
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-lg flex-shrink-0">
                    <Package size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Comprehensive Tracking</h4>
                    <p className="text-sm text-slate-600">
                      Track every item from receiving to shipping with full traceability
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-emerald-50 rounded-lg flex-shrink-0">
                    <Warehouse size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Multi-Location Support</h4>
                    <p className="text-sm text-slate-600">
                      Manage multiple warehouses with location-specific inventory
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-purple-50 rounded-lg flex-shrink-0">
                    <BarChart3 size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Powerful Reporting</h4>
                    <p className="text-sm text-slate-600">Generate insights with comprehensive analytics and reports</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-amber-50 rounded-lg flex-shrink-0">
                    <Shield size={20} className="text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Enterprise Security</h4>
                    <p className="text-sm text-slate-600">Role-based access control with full audit trails</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Warehouse Operations?
            </h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Join modern businesses using our inventory management system to streamline operations and boost
              efficiency.
            </p>
            <button
              onClick={() => setAuthMode('signup')}
              className="px-8 py-3 bg-white hover:bg-slate-50 text-blue-600 font-medium rounded-lg transition-colors inline-flex items-center gap-2 shadow-lg"
            >
              Get Started Now
              <ArrowRight size={18} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-700">
                  <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Inventory Management</h3>
                  <p className="text-xs text-slate-400">Warehouse Operations</p>
                </div>
              </div>
              <p className="text-sm text-slate-400">
                Professional inventory management system for modern warehouse operations.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#benefits" className="hover:text-white transition-colors">
                    Benefits
                  </a>
                </li>
                <li>
                  <button onClick={() => setAuthMode('login')} className="hover:text-white transition-colors">
                    Sign In
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Contact</h4>
              <p className="text-sm text-slate-400">
                For inquiries about the system, please contact your system administrator.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8">
            <p className="text-center text-sm text-slate-400">
              © {new Date().getFullYear()} Inventory Management System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onSwitchMode={(mode) => setAuthMode(mode)} />
    </div>
  );
}
