import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import ToastContainer from '../components/common/ToastContainer';

/**
 * DashboardLayout
 * Main layout wrapper for the inventory management system.
 * Provides dark sidebar, premium header, and content area with Outlet for nested routes.
 */

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(160deg, #f1f5fb 0%, #f8fafc 50%, #f1f5f9 100%)' }}
    >
      {/* Toast Container */}
      <ToastContainer />

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Header */}
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          pageTitle="Dashboard"
        />

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
