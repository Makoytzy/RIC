import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  HelpCircle,
  User,
  Menu,
  ChevronDown,
  Settings,
  LogOut,
  X,
  AlertCircle,
  Info,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';

const NOTIF_ICONS = {
  warning: { Icon: AlertTriangle, bg: 'bg-amber-50', icon: 'text-amber-500', ring: 'ring-amber-200' },
  info: { Icon: Info, bg: 'bg-blue-50', icon: 'text-blue-500', ring: 'ring-blue-200' },
  alert: { Icon: AlertCircle, bg: 'bg-red-50', icon: 'text-red-500', ring: 'ring-red-200' },
};

export default function Header({ onMenuClick, pageTitle = 'Dashboard' }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  const { user: authUser, roles, signOut } = useAuth();

  const user = {
    name:
      authUser?.full_name ||
      authUser?.user_metadata?.full_name ||
      authUser?.email ||
      'Unknown User',
    role:
      roles.length > 0
        ? roles[0].replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        : 'No role assigned',
    initials: (() => {
      const n =
        authUser?.full_name ||
        authUser?.user_metadata?.full_name ||
        authUser?.email ||
        'U';
      const parts = n.split(' ');
      return parts.length >= 2
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : n.slice(0, 2).toUpperCase();
    })(),
  };

  const notifications = [
    { id: 1, type: 'warning', message: '12 products are low in stock', time: '5 min ago' },
    { id: 2, type: 'info', message: '5 pending inspections ready for review', time: '15 min ago' },
    { id: 3, type: 'alert', message: '3 quantity discrepancies detected', time: '1 hour ago' },
  ];

  const unreadCount = notifications.length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const dropdownVariants = {
    hidden: { opacity: 0, y: -8, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: 'easeOut' } },
    exit: { opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.14 } },
  };

  return (
    <header
      className="sticky top-0 z-20 bg-white border-b border-slate-200/80"
      style={{ boxShadow: '0 1px 3px 0 rgba(15,25,41,0.06), 0 1px 2px -1px rgba(15,25,41,0.04)' }}
    >
      <div className="flex items-center justify-between px-4 lg:px-6 py-3 gap-4">
        {/* Left: Mobile hamburger + Page title */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200"
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>
          <div className="hidden sm:block">
            <h2 className="text-base font-semibold text-slate-900 leading-tight">{pageTitle}</h2>
          </div>
        </div>

        {/* Center: Search */}
        <div className="hidden md:flex flex-1 max-w-lg">
          <div className="relative w-full">
            <Search
              size={16}
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                searchFocused ? 'text-brand-500' : 'text-slate-400'
              }`}
            />
            <input
              type="text"
              placeholder="Search inventory, products, orders…"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
              className="relative p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200"
              aria-label="Notifications"
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <>
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full animate-pulse-ring" />
                </>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute right-0 top-full mt-2 w-84 bg-white rounded-2xl z-30 overflow-hidden"
                  style={{
                    boxShadow: '0 20px 60px -10px rgba(15,25,41,0.18), 0 0 0 1px rgba(15,25,41,0.06)',
                    width: '22rem',
                  }}
                >
                  <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{unreadCount} unread</p>
                    </div>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {notifications.map((notif) => {
                      const config = NOTIF_ICONS[notif.type] || NOTIF_ICONS.info;
                      const { Icon } = config;
                      return (
                        <div
                          key={notif.id}
                          className="flex items-start gap-3 px-4 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors group"
                        >
                          <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${config.bg} ring-1 ${config.ring} flex items-center justify-center`}>
                            <Icon size={14} className={config.icon} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-700 leading-snug group-hover:text-slate-900 transition-colors">
                              {notif.message}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="px-4 py-3 border-t border-slate-100">
                    <button className="w-full text-center text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors py-1 rounded-lg hover:bg-brand-50">
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Help */}
          <button
            className="hidden sm:flex p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200"
            aria-label="Help & documentation"
          >
            <HelpCircle size={19} />
          </button>

          {/* Divider */}
          <div className="hidden sm:block w-px h-6 bg-slate-200 mx-1" />

          {/* User Menu */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
              className="flex items-center gap-2.5 pl-1 pr-2.5 py-1 rounded-xl hover:bg-slate-100 transition-all duration-200 group"
            >
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #2650ab 0%, #5b8def 100%)',
                  boxShadow: '0 2px 8px 0 rgba(53,104,212,0.35)',
                }}
              >
                {user.initials}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-slate-800 leading-tight">{user.name}</p>
                <p className="text-xs text-slate-500">{user.role}</p>
              </div>
              <ChevronDown
                size={14}
                className={`hidden md:block text-slate-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl z-30 overflow-hidden"
                  style={{ boxShadow: '0 20px 60px -10px rgba(15,25,41,0.18), 0 0 0 1px rgba(15,25,41,0.06)' }}
                >
                  {/* User info header */}
                  <div className="px-4 py-3.5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #2650ab, #5b8def)' }}
                      >
                        {user.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.role}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-1.5">
                    <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors group">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center transition-colors">
                        <User size={14} className="text-slate-600" />
                      </div>
                      Profile
                    </button>
                    <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors group">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center transition-colors">
                        <Settings size={14} className="text-slate-600" />
                      </div>
                      Account Settings
                    </button>
                  </div>

                  {/* Signout */}
                  <div className="border-t border-slate-100 py-1.5">
                    <button
                      onClick={() => { setShowUserMenu(false); signOut(); }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                        <LogOut size={14} className="text-red-500" />
                      </div>
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search…"
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-slate-50 border border-slate-200 placeholder-slate-400 outline-none focus:bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all duration-200"
          />
        </div>
      </div>
    </header>
  );
}
