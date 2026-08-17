import React, { useState } from 'react';
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
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';

export default function Header({ onMenuClick, pageTitle = 'Dashboard' }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { user: authUser, roles, signOut } = useAuth();

  // Build display values from the real authenticated user
  const user = {
    name:
      authUser?.full_name ||
      authUser?.user_metadata?.full_name ||
      authUser?.email ||
      'Unknown User',
    role: roles.length > 0
      ? roles[0].replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      : 'No role assigned',
    avatar: null,
  };

  // Mock notifications
  const notifications = [
    { id: 1, type: 'warning', message: '12 products are low in stock', time: '5 min ago' },
    { id: 2, type: 'info', message: '5 pending inspections', time: '15 min ago' },
    { id: 3, type: 'alert', message: '3 quantity discrepancies', time: '1 hour ago' },
  ];

  const unreadCount = notifications.length;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        {/* Left: Menu + Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} className="text-slate-600" />
          </button>
          <h1 className="text-xl font-bold text-slate-900 hidden sm:block">{pageTitle}</h1>
        </div>

        {/* Center: Search (hidden on mobile) */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8">
          <div className="relative w-full">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search inventory, products, orders..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Notifications"
            >
              <Bell size={20} className="text-slate-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowNotifications(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-20"
                  >
                    <div className="p-4 border-b border-slate-200">
                      <h3 className="font-semibold text-slate-900">Notifications</h3>
                      <p className="text-xs text-slate-500 mt-1">{unreadCount} unread notifications</p>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className="p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <p className="text-sm text-slate-700">{notif.message}</p>
                          <p className="text-xs text-slate-500 mt-1">{notif.time}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 text-center border-t border-slate-200">
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        View all notifications
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Help */}
          <button
            className="hidden sm:flex p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Help"
          >
            <HelpCircle size={20} className="text-slate-600" />
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full" />
                ) : (
                  <User size={16} className="text-blue-600" />
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500">{user.role}</p>
              </div>
              <ChevronDown size={16} className="hidden md:block text-slate-400" />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 z-20"
                  >
                    <div className="p-3 border-b border-slate-200">
                      <p className="font-medium text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.role}</p>
                    </div>
                    <div className="py-2">
                      <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        <User size={16} />
                        Profile
                      </button>
                      <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        <Settings size={16} />
                        Account Settings
                      </button>
                    </div>
                    <div className="border-t border-slate-200 py-2">
                      <button
                        onClick={() => { setShowUserMenu(false); signOut(); }}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </header>
  );
}
