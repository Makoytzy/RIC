import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import ToastContainer from '../components/common/ToastContainer';

/**
 * DashboardLayout
 * Main layout wrapper for the inventory management system
 * Provides sidebar, header, and content area with Outlet for nested routes
 */

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast Container - Global toast notifications */}
      <ToastContainer />

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Header */}
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          pageTitle="Dashboard"
        />

        {/* Page Content with Outlet */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
