import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  useTransform,
  useMotionValue
} from 'framer-motion';
import GifScrollHero from '../../components/landing/GifScrollHero.jsx';
import AuthModal from '../../components/landing/AuthModal.jsx';
import FeaturedProducts from '../../components/landing/FeaturedProducts.jsx';
import ContactSection from '../../components/landing/ContactSection.jsx';
import ProductImage from '../../components/landing/ProductImage.jsx';
import RefundPolicy from '../../components/landing/RefundPolicy.jsx';
import TermsOfService from '../../components/landing/TermsOfService.jsx';
import ShippingPolicy from '../../components/landing/ShippingPolicy.jsx';
import { NEW_ARRIVALS, formatPeso } from '../../data/newArrivals.js';
import {
  LogIn,
  Wrench,
  ShieldCheck,
  Compass,
  Star,
  ArrowRight,
  Award,
  Sparkles,
  ChevronRight,
  Zap,
  Timer,
  Gauge,
  Cog,
  Phone,
  Mail,
  MapPin,
  Bike,
  Instagram,
  Facebook,
  Youtube,
  Menu,
  X,
  ChevronDown,
  Users
} from 'lucide-react';

const REVEAL_EASE = [0.22, 1, 0.36, 1];

const revealGroup = {
  hidden: {},
  visible: { transition: { delayChildren: 0.08, staggerChildren: 0.12 } }
};

const revealItem = {
  hidden: { opacity: 0, y: 28, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: REVEAL_EASE }
  }
};

const revealOnScroll = {
  variants: revealGroup,
  initial: 'hidden',
  whileInView: 'visible',
  viewport: { once: true, amount: 0.2 }
};

const NAV_SECTIONS = ['products', 'featured', 'about', 'contact'];

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerSolid, setHeaderSolid] = useState(false);
  const [authMode, setAuthMode] = useState(null);
  const [refundPolicyOpen, setRefundPolicyOpen] = useState(false);
  const [termsOfServiceOpen, setTermsOfServiceOpen] = useState(false);
  const [shippingPolicyOpen, setShippingPolicyOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('products');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const sections = NAV_SECTIONS
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const inView = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (inView) setActiveSection(inView.target.id);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const openAuth = (mode) => {
    setMobileMenuOpen(false);
    setAuthMode(mode);
  };

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (y) => {
    setHeaderSolid(y > 50);
  });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      mouseX.set(x);
      mouseY.set(y);
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const handleProductInquire = () => {
    openAuth('signup');
  };

  const handleNavClick = (e, href, target) => {
    e.preventDefault();
    const targetId = target || href.slice(1);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const featuredArrivals = NEW_ARRIVALS.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F3F4F6] relative overflow-x-hidden font-sans selection:bg-[#E52E2E] selection:text-white" ref={containerRef}>
      <motion.div 
        className="fixed inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(229,46,46,0.08),transparent_45%)] pointer-events-none z-0"
        style={{
          x: useTransform(mouseX, [-10, 10], [-5, 5]),
          y: useTransform(mouseY, [-10, 10], [-5, 5])
        }}
      />
      <motion.div 
        className="fixed inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(245,158,11,0.04),transparent_50%)] pointer-events-none z-0"
        style={{
          x: useTransform(mouseX, [-10, 10], [5, -5]),
          y: useTransform(mouseY, [-10, 10], [5, -5])
        }}
      />

      <motion.header 
        className={`fixed top-0 left-0 right-0 z-40 px-5 lg:px-10 py-3 flex items-center justify-between transition-all duration-500 ${
          headerSolid 
            ? 'backdrop-blur-2xl bg-[#090A0F]/95 border-b border-white/8 shadow-2xl shadow-black/50' 
            : 'backdrop-blur-md bg-transparent border-b border-transparent'
        }`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-white/10 shadow-lg shadow-red-950/60 bg-[#0b0d14]">
            <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.3em] text-white/60">RIC</div>
          </div>
          <div>
            <div className="text-sm font-black uppercase tracking-[0.2em] leading-tight">
              <span className="text-[#ff0000]">Red</span> Indian <span className="text-[#2563eb]">Customs</span>
            </div>
            <div className="text-[9px] text-[#F59E0B] font-mono uppercase tracking-[0.3em] opacity-80">
              Est. 2014 • Custom Garage
            </div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {[
            { href: '#products', label: 'Products', icon: Sparkles, target: 'featured', activeSections: ['products', 'featured'] },
            { href: '#about', label: 'About', icon: Users },
            { href: '#contact', label: 'Contact', icon: Phone }
          ].map((item) => {
            const isActive = item.activeSections ? item.activeSections.includes(activeSection) : activeSection === item.href.slice(1);
            return (
              <motion.a
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href, item.target)}
                whileTap={{ scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-mono tracking-wider transition-colors duration-200 group ${
                  isActive
                    ? 'text-[#E52E2E]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-lg bg-[#E52E2E]/15 border border-[#E52E2E]/20"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <item.icon size={12} className="relative z-10" />
                <span className="relative z-10 group-hover:after:content-[''] group-hover:after:absolute group-hover:after:bottom-0 group-hover:after:left-0 group-hover:after:w-full group-hover:after:h-[2px] group-hover:after:bg-[#E52E2E] group-hover:after:transition-all group-hover:after:duration-300">{item.label}</span>
              </motion.a>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <button
            type="button"
            onClick={() => openAuth('login')}
            className="relative group bg-gradient-to-r from-[#E52E2E] to-[#CC2424] hover:from-[#FF3B3B] hover:to-[#E52E2E] text-white px-5 py-2.5 rounded-xl text-[11px] font-mono font-extrabold tracking-wider shadow-lg shadow-red-950/50 transition-all hover:scale-[1.03] hover:-translate-y-0.5 active:scale-95 active:translate-y-0 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <LogIn size={13} />
              Get Started
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>
        </div>

        <button 
          className="md:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </motion.header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-[60px] z-30 bg-[#0D0F16]/98 backdrop-blur-2xl border-b border-white/10 p-6 flex flex-col gap-4 md:hidden shadow-2xl"
          >
            {[
              { href: '#products', label: 'Products', target: 'featured' },
              { href: '#about', label: 'About' },
              { href: '#contact', label: 'Contact' }
            ].map((item) => (
              <a 
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  handleNavClick(e, item.href, item.target);
                  setMobileMenuOpen(false);
                }}
                className="text-sm font-mono uppercase tracking-wider text-gray-300 hover:text-[#E52E2E] transition-colors py-2 border-b border-white/5"
              >
                {item.label}
              </a>
            ))}
            <div className="flex gap-3 mt-2">
              <button type="button" className="flex-1 text-center py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm font-bold" onClick={() => openAuth('login')}>
                SIGN IN
              </button>
              <button type="button" className="flex-1 text-center py-3 rounded-xl bg-[#E52E2E] text-white font-mono text-sm font-bold shadow-lg" onClick={() => openAuth('signup')}>
                REGISTER
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <GifScrollHero forceComplete={false} />

      <section id="products" className="relative z-20 bg-[#0B0D14] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
          <motion.div
            className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-12"
            {...revealOnScroll}
          >
            <motion.div variants={revealItem}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#F59E0B] uppercase tracking-[0.3em] mb-4">
                <Sparkles size={13} />
                NEW ARRIVALS
              </div>
              <h2 className="font-sans text-4xl sm:text-5xl font-extrabold text-white mb-4" style={{ textShadow: '0 0 30px rgba(59, 130, 246, 0.5), 0 0 60px rgba(59, 130, 246, 0.3)' }}>
                Fresh parts for your next custom build.
              </h2>
              <p className="max-w-2xl text-sm sm:text-base text-white/60 leading-relaxed">
                Rediscover classic motorcycle styling with hand-picked components designed for riders who love authenticity.
              </p>
            </motion.div>
            <motion.div variants={revealItem} className="shrink-0">
              <Link
                to="/new-arrival"
                className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-[#3B82F6] to-[#2563EB] px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-950/40 transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-blue-900/50 active:translate-y-0 active:scale-95"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative z-10">View All</span>
                <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 group-hover:translate-x-0.5">
                  <ArrowRight size={13} />
                </span>
                <span className="relative z-10 rounded-full bg-white/15 px-2 py-0.5 font-mono text-[10px] tracking-wider">
                  {NEW_ARRIVALS.length}
                </span>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-6" {...revealOnScroll}>
            {featuredArrivals.map((item) => (
              <motion.div variants={revealItem} key={item.id} className="group h-full">
                <Link
                  to={`/products/${item.slug}`}
                  className="flex h-full flex-col rounded-2xl border border-white/10 bg-[#171B26]/70 overflow-hidden shadow-xl shadow-black/20 transition-all hover:-translate-y-1.5 hover:border-[#3B82F6]/40"
                >
                  <ProductImage images={item.images} alt={item.title} />
                  <div className="flex flex-1 flex-col p-4">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-[#F59E0B] mb-1.5">{item.badge}</div>
                    <h3 className="text-sm font-black text-white mb-1 leading-tight line-clamp-2">{item.title}</h3>
                    <p className="text-[11px] text-white/50 leading-snug mb-3 line-clamp-1">{item.subtitle}</p>
                    <div className="mt-auto flex items-center justify-between gap-2">
                      <span className="text-lg font-black text-white">{formatPeso(item.price)}</span>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-white/40 transition-all group-hover:bg-[#3B82F6] group-hover:text-white">
                        <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="featured" className="relative z-20">
        <FeaturedProducts onInquire={handleProductInquire} />
      </section>

      <section id="about" className="relative z-20 overflow-hidden bg-[#0B0D14] border-t border-white/5">
        <div className="h-1 bg-gradient-to-r from-[#3B82F6] via-[#2563EB] to-[#3B82F6]" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3B82F6]/[0.05] blur-3xl" />

        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
          <motion.div className="grid gap-12 lg:grid-cols-[0.95fr_0.9fr] items-center" {...revealOnScroll}>
            <motion.div variants={revealItem}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#F59E0B] uppercase tracking-[0.3em] mb-4">
                <Award size={13} />
                ABOUT US
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-5" style={{ textShadow: '0 0 30px rgba(59, 130, 246, 0.5), 0 0 60px rgba(59, 130, 246, 0.3)' }}>
                Red Indian Customs is more than just a parts shop.
              </h2>
              <p className="max-w-2xl text-sm sm:text-base text-white/60 leading-relaxed mb-8">
                Red Indian Customs is a destination for craftsmanship and freedom. We bring classic soul and modern engineering together with custom parts made for riders who demand quality.
              </p>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { title: 'Craftsmanship', text: 'Hand-selected components for distinct custom builds.', icon: <Wrench size={24} className="text-[#3B82F6]" /> },
                  { title: 'Heritage', text: 'Classic style with authentic motorcycle soul.', icon: <Bike size={24} className="text-[#3B82F6]" /> },
                  { title: 'Performance', text: 'Parts that look great and ride strong.', icon: <Zap size={24} className="text-[#3B82F6]" /> }
                ].map((item) => (
                  <motion.div 
                    key={item.title} 
                    className="rounded-3xl border border-white/10 bg-[#171B26]/70 p-5 hover:border-[#3B82F6]/30 hover:bg-[#171B26]/90 transition-all duration-300 group"
                    whileHover={{ y: -4 }}
                  >
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <div className="text-sm uppercase tracking-[0.25em] text-[#F59E0B] mb-2">{item.title}</div>
                    <p className="text-sm text-white/60 leading-relaxed">{item.text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div variants={revealItem} className="rounded-3xl overflow-hidden border border-white/10 bg-[#171B26]/70 p-6 shadow-2xl shadow-black/20">
              <div className="relative h-96 rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#111827] via-[#111827] to-[#0f172a]" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] rounded-full bg-[#3B82F6]/20 blur-3xl" />
                <div className="absolute inset-0 flex items-center justify-center text-center p-8">
                  <div>
                    <div className="text-xs font-mono uppercase tracking-wider text-[#F59E0B] mb-2">Premium Custom Builds</div>
                    <div className="text-3xl sm:text-4xl font-black text-white">Crafted with Passion</div>
                    <div className="mt-4 text-sm text-white/60">From concept to chrome, every part is curated for riders who want standout performance.</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <ContactSection />

      <footer className="relative z-20 border-t border-white/5 bg-[#090A0F] pt-16 pb-8 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 shadow-lg shadow-red-950/60 bg-[#0b0d14] flex items-center justify-center text-sm uppercase tracking-[0.2em] text-white/70">RIC</div>
                <div>
                  <div className="font-sans font-black uppercase tracking-wider text-sm">
                    <span className="text-[#E52E2E]">Red </span>
                    <span className="text-white">Indian </span>
                    <span className="text-[#3B82F6]">Customs</span>
                  </div>
                  <div className="text-[9px] text-[#F59E0B] font-mono tracking-widest">EST. 2014</div>
                </div>
              </div>
              <p className="text-gray-500 text-xs leading-relaxed">
                Red Indian Customs is more than just a parts shop; it's a destination for craftsmanship and freedom. Founded on the principles of quality and custom performance, we bridge the gap between old-school soul and modern engineering.
              </p>
            </div>

            <div>
              <h4 className="font-mono text-[11px] font-bold uppercase tracking-widest text-gray-300 mb-4">YOUR ACCOUNT</h4>
              <ul className="space-y-2 text-xs text-gray-500">
                <li><button onClick={() => setShippingPolicyOpen(true)} className="hover:text-[#E52E2E] transition-colors text-left w-full">Shipping & Delivery</button></li>
                <li><button onClick={() => setTermsOfServiceOpen(true)} className="hover:text-[#E52E2E] transition-colors text-left w-full">Terms of Service</button></li>
                <li><button onClick={() => setRefundPolicyOpen(true)} className="hover:text-[#E52E2E] transition-colors text-left w-full">Refund policy</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-mono text-[11px] font-bold uppercase tracking-widest text-gray-300 mb-4">Portal Access</h4>
              <ul className="space-y-2 text-xs text-gray-500">
                <li>Owner Dashboard</li>
                <li>Inventory Management</li>
                <li>Work Order Tracking</li>
                <li>Customer Registration</li>
              </ul>
            </div>

            <div>
              <h4 className="font-mono text-[11px] font-bold uppercase tracking-widest text-gray-300 mb-4">Contact</h4>
              <ul className="space-y-3 text-xs text-gray-500">
                <li className="flex items-start gap-2">
                  <MapPin size={13} className="text-[#E52E2E] flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    THE RED INDIAN CUSTOMS - OFFICIAL, DOOR 5 Fine Impression Compound, Near Storage Town, Diagonally Opposite of 7D, Aniceto Seno, Casuntingan<br />
                    Mandaue City, Philippines
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone size={13} className="text-[#E52E2E]" />
                  <span>+639512335791</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={13} className="text-[#E52E2E]" />
                  <span>sales@redindiancustom-motorcycles.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[10px] text-gray-600 font-mono">
              © {new Date().getFullYear()} RED INDIAN CUSTOMS. ALL RIGHTS RESERVED. SPECIALIZED MOTORCYCLE PARTS & SUPPLY.
            </div>
            <div className="flex items-center gap-3">
              {[Instagram, Facebook, Youtube].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#"
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-gray-500 hover:text-[#E52E2E] hover:border-red-500/30 transition-all"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <AuthModal
        mode={authMode}
        onClose={() => setAuthMode(null)}
        onSwitchMode={(next) => setAuthMode(next)}
      />

      <RefundPolicy
        isOpen={refundPolicyOpen}
        onClose={() => setRefundPolicyOpen(false)}
      />

      <TermsOfService
        isOpen={termsOfServiceOpen}
        onClose={() => setTermsOfServiceOpen(false)}
      />

      <ShippingPolicy
        isOpen={shippingPolicyOpen}
        onClose={() => setShippingPolicyOpen(false)}
      />
    </div>
  );
}
