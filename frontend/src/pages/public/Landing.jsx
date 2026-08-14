import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
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
  Sparkles,
  Boxes,
  Clock,
  Globe,
  Award,
  Target,
  RefreshCcw,
  Lock,
  Smartphone,
  ChevronRight,
  Star,
  Quote,
} from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

export default function Landing() {
  const [authMode, setAuthMode] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stats = [
    { value: '99.9%', label: 'Uptime', icon: Target },
    { value: '10K+', label: 'SKUs Managed', icon: Package },
    { value: '24/7', label: 'Support', icon: Clock },
    { value: '50+', label: 'Enterprises', icon: Award },
  ];

  const features = [
    {
      icon: Package,
      title: 'Inventory Management',
      description: 'Track stock levels, locations, and movements in real-time with advanced batch and serial number tracking.',
      color: 'blue',
    },
    {
      icon: Warehouse,
      title: 'Warehouse Operations',
      description: 'Streamline receiving, inspection, picking, packing, and shipping operations with barcode scanning.',
      color: 'emerald',
    },
    {
      icon: BarChart3,
      title: 'Reports & Analytics',
      description: 'Generate comprehensive reports on inventory, discrepancies, defects, and operational efficiency.',
      color: 'purple',
    },
    {
      icon: FileCheck,
      title: 'Quality Control',
      description: 'Manage inspections, create defect reports, and track quality metrics throughout your operations.',
      color: 'amber',
    },
    {
      icon: ClipboardCheck,
      title: 'Order Fulfillment',
      description: 'Process orders efficiently with integrated picking, packing, and multi-marketplace support.',
      color: 'indigo',
    },
    {
      icon: Users,
      title: 'Role-Based Access',
      description: 'Secure system with granular permissions for Admin, Manager, Operational, Warehouse, and Sales staff.',
      color: 'rose',
    },
  ];

  const testimonials = [
    {
      name: 'Maria Santos',
      role: 'Warehouse Manager',
      company: 'Global Logistics Corp',
      content: 'This system transformed our warehouse operations. We reduced processing time by 40% and virtually eliminated inventory discrepancies.',
      rating: 5,
    },
    {
      name: 'John Chen',
      role: 'Operations Director',
      company: 'E-Commerce Plus',
      content: 'The real-time tracking and reporting features are game-changers. We now have complete visibility across all our locations.',
      rating: 5,
    },
    {
      name: 'Sarah Williams',
      role: 'Supply Chain Lead',
      company: 'Metro Distribution',
      content: 'Best inventory system we\'ve used. The barcode scanning and batch tracking save us hours every day.',
      rating: 5,
    },
  ];

  const integrations = [
    { name: 'Shopee', icon: '🛍️' },
    { name: 'Lazada', icon: '🏪' },
    { name: 'TikTok Shop', icon: '🎵' },
  ];

  const benefits = [
    { icon: Zap, text: 'Real-time inventory visibility' },
    { icon: Clock, text: 'Automated stock level alerts' },
    { icon: Globe, text: 'Multi-location warehouse support' },
    { icon: Boxes, text: 'Batch and serial number tracking' },
    { icon: Smartphone, text: 'Barcode generation and scanning' },
    { icon: FileCheck, text: 'Discrepancy and defect tracking' },
    { icon: RefreshCcw, text: 'Marketplace integration' },
    { icon: Lock, text: 'Comprehensive audit trails' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden border-2 border-blue-600 shadow-lg group-hover:shadow-xl transition-shadow"
              >
                <img src={logo} alt="Logo" className="w-full h-full object-cover" />
              </motion.div>
              <div className="hidden sm:block">
                <h1 className="text-sm md:text-base font-bold text-slate-900">Red Indian Customs</h1>
                <p className="text-xs text-slate-500">Inventory Management System</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <a
                href="#features"
                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors relative group"
              >
                Features
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300" />
              </a>
              <a
                href="#benefits"
                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors relative group"
              >
                Benefits
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300" />
              </a>
              <a
                href="#testimonials"
                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors relative group"
              >
                Testimonials
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300" />
              </a>
              <a
                href="#contact"
                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors relative group"
              >
                Contact
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300" />
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setAuthMode('login')}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
              >
                Sign In
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 10px 30px -10px rgba(37, 99, 235, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setAuthMode('signup')}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30"
              >
                <Sparkles size={16} />
                Get Started
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X size={24} className="text-slate-900" /> : <Menu size={24} className="text-slate-900" />}
            </motion.button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden py-4 border-t border-slate-200"
            >
              <div className="flex flex-col gap-2">
                <a
                  href="#features"
                  className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#benefits"
                  className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Benefits
                </a>
                <a
                  href="#testimonials"
                  className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Testimonials
                </a>
                <a
                  href="#contact"
                  className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </a>
                <div className="h-px bg-slate-200 my-2" />
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-left"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setAuthMode('signup');
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <Sparkles size={16} />
                  Get Started
                </button>
              </div>
            </motion.div>
          )}
        </nav>
      </motion.header>


      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 pt-24 md:pt-32 pb-16 md:pb-24">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-400 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            style={{ opacity: heroOpacity, scale: heroScale }}
            className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
          >
            {/* Left Column */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="text-center lg:text-left"
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 text-blue-700 rounded-full text-xs md:text-sm font-medium mb-6 shadow-sm">
                <Sparkles size={16} className="animate-pulse" />
                Enterprise-Grade Warehouse Management
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 mb-6 leading-tight"
              >
                Transform Your{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Inventory
                </span>
                <br />
                Operations
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-base sm:text-lg lg:text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0"
              >
                Complete control over your warehouse with real-time tracking, automated workflows, and powerful analytics.
                Built for businesses that demand excellence.
              </motion.p>

              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 mb-10 justify-center lg:justify-start"
              >
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 40px -10px rgba(37, 99, 235, 0.4)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAuthMode('signup')}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-2xl shadow-blue-600/30"
                >
                  Get Started Free
                  <ArrowRight size={20} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAuthMode('login')}
                  className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-900 font-semibold rounded-xl border-2 border-slate-200 hover:border-slate-300 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <LogIn size={20} />
                  Sign In
                </motion.button>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-emerald-600" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-emerald-600" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-emerald-600" />
                  <span>Cancel anytime</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - Interactive Cards */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid grid-cols-2 gap-4 md:gap-6"
            >
              <motion.div
                variants={scaleIn}
                whileHover={{ y: -10, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
                className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-xl hover:shadow-2xl transition-all cursor-pointer"
              >
                <div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-4 shadow-lg">
                  <LayoutDashboard size={28} className="text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Real-Time</h3>
                <p className="text-sm md:text-base text-slate-600">Inventory Tracking</p>
              </motion.div>

              <motion.div
                variants={scaleIn}
                whileHover={{ y: -10, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-xl hover:shadow-2xl transition-all cursor-pointer mt-8"
              >
                <div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl mb-4 shadow-lg">
                  <Package size={28} className="text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Multi-Site</h3>
                <p className="text-sm md:text-base text-slate-600">Warehouse Support</p>
              </motion.div>

              <motion.div
                variants={scaleIn}
                whileHover={{ y: -10, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-xl hover:shadow-2xl transition-all cursor-pointer"
              >
                <div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mb-4 shadow-lg">
                  <BarChart3 size={28} className="text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Advanced</h3>
                <p className="text-sm md:text-base text-slate-600">Analytics & Reports</p>
              </motion.div>

              <motion.div
                variants={scaleIn}
                whileHover={{ y: -10, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-xl hover:shadow-2xl transition-all cursor-pointer mt-8"
              >
                <div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl mb-4 shadow-lg">
                  <Shield size={28} className="text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Enterprise</h3>
                <p className="text-sm md:text-base text-slate-600">Security & Access</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-blue-50 rounded-xl mx-auto mb-3">
                  <stat.icon size={24} className="text-blue-600" />
                </div>
                <p className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">{stat.value}</p>
                <p className="text-sm md:text-base text-slate-600">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>


      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
            className="text-center mb-12 md:mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs md:text-sm font-medium mb-4">
              <TrendingUp size={16} />
              Powerful Features
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 md:mb-6">
              Everything You Need in One Platform
            </h2>
            <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto">
              From receiving to shipping, our comprehensive system covers every aspect of warehouse operations
              with enterprise-grade features.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            {features.map((feature, index) => {
              const colorClasses = {
                blue: 'from-blue-500 to-blue-600 text-blue-600 bg-blue-50 border-blue-100',
                emerald: 'from-emerald-500 to-emerald-600 text-emerald-600 bg-emerald-50 border-emerald-100',
                purple: 'from-purple-500 to-purple-600 text-purple-600 bg-purple-50 border-purple-100',
                amber: 'from-amber-500 to-amber-600 text-amber-600 bg-amber-50 border-amber-100',
                indigo: 'from-indigo-500 to-indigo-600 text-indigo-600 bg-indigo-50 border-indigo-100',
                rose: 'from-rose-500 to-rose-600 text-rose-600 bg-rose-50 border-rose-100',
              };
              const colors = colorClasses[feature.color];
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ y: -8, boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)' }}
                  className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 hover:border-slate-300 transition-all group cursor-pointer"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className={`flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br ${colors.split(' ')[0]} ${colors.split(' ')[1]} rounded-xl mb-5 shadow-lg`}
                  >
                    <feature.icon size={28} className="text-white" />
                  </motion.div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm md:text-base text-slate-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-16 md:py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInLeft}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs md:text-sm font-medium mb-6">
                <CheckCircle size={16} />
                Key Benefits
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
                Built for Modern{' '}
                <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  Warehouse Operations
                </span>
              </h2>
              <p className="text-base md:text-lg text-slate-600 mb-8 md:mb-10 leading-relaxed">
                Our system is designed to handle the complexities of modern inventory management with features that
                save time, reduce errors, and improve efficiency across your entire operation.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 group"
                  >
                    <div className="flex items-center justify-center w-8 h-8 bg-emerald-50 rounded-lg flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
                      <benefit.icon size={16} className="text-emerald-600" />
                    </div>
                    <span className="text-sm md:text-base text-slate-700 font-medium">{benefit.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInRight}
              className="relative"
            >
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 md:p-12 border border-blue-200 shadow-2xl">
                <div className="space-y-6 md:space-y-8">
                  {[
                    {
                      icon: Package,
                      title: 'Comprehensive Tracking',
                      description: 'Track every item from receiving to shipping with full traceability and batch control',
                      gradient: 'from-blue-500 to-blue-600',
                    },
                    {
                      icon: Warehouse,
                      title: 'Multi-Location Support',
                      description: 'Manage multiple warehouses with location-specific inventory and transfers',
                      gradient: 'from-emerald-500 to-emerald-600',
                    },
                    {
                      icon: BarChart3,
                      title: 'Powerful Reporting',
                      description: 'Generate insights with comprehensive analytics, KPIs, and custom reports',
                      gradient: 'from-purple-500 to-purple-600',
                    },
                    {
                      icon: Shield,
                      title: 'Enterprise Security',
                      description: 'Role-based access control with full audit trails and compliance support',
                      gradient: 'from-amber-500 to-amber-600',
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ x: 10 }}
                      className="flex items-start gap-4 bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all cursor-pointer"
                    >
                      <div className={`flex items-center justify-center w-12 h-12 bg-gradient-to-br ${item.gradient} rounded-xl flex-shrink-0 shadow-lg`}>
                        <item.icon size={22} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 mb-1 text-base md:text-lg">{item.title}</h4>
                        <p className="text-sm md:text-base text-slate-600 leading-relaxed">{item.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 md:py-24 lg:py-32 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
            className="text-center mb-12 md:mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-xs md:text-sm font-medium mb-4">
              <Star size={16} className="fill-amber-600" />
              Customer Testimonials
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 md:mb-6">
              Trusted by Industry Leaders
            </h2>
            <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto">
              See what warehouse managers and operations directors say about our platform
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                whileHover={{ y: -10, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
                className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-xl hover:shadow-2xl transition-all"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={18} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <Quote size={32} className="text-blue-200 mb-4" />
                <p className="text-sm md:text-base text-slate-700 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full text-white font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm md:text-base">{testimonial.name}</h4>
                    <p className="text-xs md:text-sm text-slate-600">{testimonial.role}</p>
                    <p className="text-xs text-slate-500">{testimonial.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 text-purple-700 rounded-full text-xs md:text-sm font-medium mb-6">
              <Globe size={16} />
              Integrations
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-4 md:mb-6">
              Connect with Your Favorite Marketplaces
            </h2>
            <p className="text-base md:text-lg text-slate-600 mb-8 md:mb-12 max-w-2xl mx-auto">
              Seamlessly integrate with popular e-commerce platforms to sync inventory in real-time
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
              {integrations.map((integration, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.1, y: -5 }}
                  className="flex items-center gap-3 px-6 md:px-8 py-4 md:py-5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer"
                >
                  <span className="text-3xl md:text-4xl">{integration.icon}</span>
                  <span className="font-semibold text-slate-800 text-base md:text-lg">{integration.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 lg:py-32 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6">
              Ready to Transform Your Warehouse?
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-blue-100 mb-8 md:mb-10 max-w-3xl mx-auto leading-relaxed">
              Join forward-thinking businesses using our inventory management system to streamline operations,
              reduce costs, and boost efficiency.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px -10px rgba(255, 255, 255, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setAuthMode('signup')}
                className="px-8 md:px-10 py-4 md:py-5 bg-white hover:bg-slate-50 text-blue-600 font-bold rounded-xl transition-all inline-flex items-center gap-3 shadow-2xl text-base md:text-lg"
              >
                Get Started Free
                <ArrowRight size={22} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setAuthMode('login')}
                className="px-8 md:px-10 py-4 md:py-5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white font-bold rounded-xl transition-all inline-flex items-center gap-3 text-base md:text-lg"
              >
                <LogIn size={22} />
                Sign In
              </motion.button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-sm md:text-base text-blue-100">
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-emerald-400" />
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-emerald-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-emerald-400" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-10 md:mb-12">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-slate-700 shadow-lg">
                  <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Red Indian Customs</h3>
                  <p className="text-xs text-slate-400">Inventory Management</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Professional enterprise-grade inventory management system for modern warehouse operations.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
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
                  <a href="#testimonials" className="hover:text-white transition-colors">
                    Testimonials
                  </a>
                </li>
                <li>
                  <button onClick={() => setAuthMode('signup')} className="hover:text-white transition-colors">
                    Get Started
                  </button>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li>
                  <button onClick={() => setAuthMode('login')} className="hover:text-white transition-colors">
                    Sign In
                  </button>
                </li>
                <li>
                  <a href="#contact" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-center sm:text-left text-sm text-slate-400">
                © {new Date().getFullYear()} Red Indian Customs. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onSwitchMode={(mode) => setAuthMode(mode)} />
    </div>
  );
}
