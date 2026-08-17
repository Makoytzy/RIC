import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import RoleRoute from './RoleRoute.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';

// Public Pages
import Landing from '../pages/public/Landing.jsx';
import Login from '../pages/public/Login.jsx';
import SignUp from '../pages/public/SignUp.jsx';
import ResetPassword from '../pages/public/ResetPassword.jsx';

// Common Pages
import Dashboard from '../pages/dashboard/Dashboard.jsx';

// Admin Pages
import UserManagement from '../pages/dashboard/UserManagement.jsx';
import AuditLogs from '../pages/dashboard/admin/AuditLogs.jsx';
import Inventory from '../pages/dashboard/admin/Inventory.jsx';
import ProductManagement from '../pages/dashboard/admin/ProductManagement.jsx';
import RoleManagement from '../pages/dashboard/admin/RoleManagement.jsx';
import SystemSettings from '../pages/dashboard/admin/SystemSettings.jsx';

// Manager Pages - Reports
import AllReports from '../pages/dashboard/manager/AllReports.jsx';
import ApprovalRequests from '../pages/dashboard/manager/ApprovalRequests.jsx';
import DefectReports from '../pages/dashboard/manager/DefectReports.jsx';
import DiscrepancyReports from '../pages/dashboard/manager/DiscrepancyReports.jsx';
import EmployeeEfficiency from '../pages/dashboard/manager/EmployeeEfficiency.jsx';
import InventoryReports from '../pages/dashboard/manager/InventoryReports.jsx';
import RefundReports from '../pages/dashboard/manager/RefundReports.jsx';
import ReturnReports from '../pages/dashboard/manager/ReturnReports.jsx';
import SalesReports from '../pages/dashboard/manager/SalesReports.jsx';
import StockMovementReports from '../pages/dashboard/manager/StockMovementReports.jsx';

// Operational Staff Pages
import BarcodeGeneration from '../pages/dashboard/operational/BarcodeGeneration.jsx';
import BatchManagement from '../pages/dashboard/operational/BatchManagement.jsx';
import InventoryRegistration from '../pages/dashboard/operational/InventoryRegistration.jsx';
import InventoryUpdate from '../pages/dashboard/operational/InventoryUpdate.jsx';
import OrderManagement from '../pages/dashboard/operational/OrderManagement.jsx';
import PackingSlip from '../pages/dashboard/operational/PackingSlip.jsx';
import ProductRegistration from '../pages/dashboard/operational/ProductRegistration.jsx';
import ReturnProcessing from '../pages/dashboard/operational/ReturnProcessing.jsx';
import ShipmentRegistration from '../pages/dashboard/operational/ShipmentRegistration.jsx';
import Waybill from '../pages/dashboard/operational/Waybill.jsx';

// Sales Staff Pages
import Customer from '../pages/dashboard/sales/Customer.jsx';
import Invoice from '../pages/dashboard/sales/Invoice.jsx';
import Payment from '../pages/dashboard/sales/Payment.jsx';
import ProductRelease from '../pages/dashboard/sales/ProductRelease.jsx';
import Receipt from '../pages/dashboard/sales/Receipt.jsx';
import Refund from '../pages/dashboard/sales/Refund.jsx';
import ReturnVerification from '../pages/dashboard/sales/ReturnVerification.jsx';
import SalesOrders from '../pages/dashboard/sales/SalesOrders.jsx';
import WalkInSales from '../pages/dashboard/sales/WalkInSales.jsx';

// Warehouse Staff Pages
import BarcodeScanner from '../pages/dashboard/warehouse/BarcodeScanner.jsx';
import EfficiencyReport from '../pages/dashboard/warehouse/EfficiencyReport.jsx';
import FifoPicking from '../pages/dashboard/warehouse/FifoPicking.jsx';
import Inspection from '../pages/dashboard/warehouse/Inspection.jsx';
import Packing from '../pages/dashboard/warehouse/Packing.jsx';
import Picking from '../pages/dashboard/warehouse/Picking.jsx';
import PickingDiscrepancy from '../pages/dashboard/warehouse/PickingDiscrepancy.jsx';
import Receiving from '../pages/dashboard/warehouse/Receiving.jsx';
import WaybillAttachment from '../pages/dashboard/warehouse/WaybillAttachment.jsx';

// Shared Pages
import IncomingShipments from '../pages/dashboard/shared/IncomingShipments.jsx';
import WarehouseLocations from '../pages/dashboard/shared/WarehouseLocations.jsx';
import Returns from '../pages/dashboard/shared/Returns.jsx';
import Orders from '../pages/dashboard/shared/Orders.jsx';
import Suppliers from '../pages/dashboard/shared/Suppliers.jsx';

import { ROLES } from '../utils/permissions.js';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Dashboard - All authenticated users */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* ============================================
              OPERATIONS SECTION (Sidebar)
              ============================================ */}
          
          {/* Receiving & Inspection - Warehouse Staff */}
          <Route element={<RoleRoute allowed={[ROLES.WAREHOUSE_STAFF]} />}>
            <Route path="/receiving" element={<Receiving />} />
          </Route>

          {/* Inventory - Admin can view/manage, others can view */}
          <Route element={<RoleRoute allowed={[ROLES.ADMIN, ROLES.MANAGER, ROLES.OPERATIONAL_STAFF]} />}>
            <Route path="/inventory" element={<Inventory />} />
          </Route>

          {/* Warehouse Locations - Multiple roles */}
          <Route element={<RoleRoute allowed={[ROLES.ADMIN, ROLES.MANAGER, ROLES.OPERATIONAL_STAFF, ROLES.WAREHOUSE_STAFF]} />}>
            <Route path="/warehouse" element={<WarehouseLocations />} />
          </Route>

          {/* Orders - Operational & Sales */}
          <Route element={<RoleRoute allowed={[ROLES.OPERATIONAL_STAFF, ROLES.SALES_STAFF, ROLES.MANAGER]} />}>
            <Route path="/orders" element={<Orders />} />
          </Route>

          {/* Picking & Packing - Warehouse Staff */}
          <Route element={<RoleRoute allowed={[ROLES.WAREHOUSE_STAFF]} />}>
            <Route path="/picking" element={<Picking />} />
          </Route>

          {/* Returns - Multiple roles */}
          <Route element={<RoleRoute allowed={[ROLES.OPERATIONAL_STAFF, ROLES.SALES_STAFF, ROLES.WAREHOUSE_STAFF]} />}>
            <Route path="/returns" element={<Returns />} />
          </Route>

          {/* ============================================
              REPORTS SECTION (Sidebar)
              ============================================ */}
          
          <Route element={<RoleRoute allowed={[ROLES.MANAGER, ROLES.ADMIN]} />}>
            <Route path="/reports" element={<AllReports />} />
            <Route path="/reports/discrepancy" element={<DiscrepancyReports />} />
            <Route path="/reports/defects" element={<DefectReports />} />
          </Route>

          {/* ============================================
              MANAGEMENT SECTION (Sidebar)
              ============================================ */}
          
          {/* Users & Employees - Admin only */}
          <Route element={<RoleRoute allowed={[ROLES.ADMIN]} />}>
            <Route path="/users" element={<UserManagement />} />
          </Route>

          {/* Suppliers - Admin, Manager, Operational */}
          <Route element={<RoleRoute allowed={[ROLES.ADMIN, ROLES.MANAGER, ROLES.OPERATIONAL_STAFF]} />}>
            <Route path="/suppliers" element={<Suppliers />} />
          </Route>

          {/* Settings - Admin only */}
          <Route element={<RoleRoute allowed={[ROLES.ADMIN]} />}>
            <Route path="/settings" element={<SystemSettings />} />
          </Route>

          {/* ============================================
              ADDITIONAL OPERATIONAL PAGES
              ============================================ */}
          
          <Route element={<RoleRoute allowed={[ROLES.OPERATIONAL_STAFF, ROLES.WAREHOUSE_STAFF]} />}>
            <Route path="/shipments/incoming" element={<IncomingShipments />} />
          </Route>

          <Route element={<RoleRoute allowed={[ROLES.OPERATIONAL_STAFF]} />}>
            <Route path="/barcode/generate" element={<BarcodeGeneration />} />
            <Route path="/batches" element={<BatchManagement />} />
            <Route path="/inventory/register" element={<InventoryRegistration />} />
            <Route path="/inventory/update" element={<InventoryUpdate />} />
            <Route path="/packing-slip" element={<PackingSlip />} />
            <Route path="/products/register" element={<ProductRegistration />} />
            <Route path="/returns/process" element={<ReturnProcessing />} />
            <Route path="/shipments/register" element={<ShipmentRegistration />} />
            <Route path="/waybill" element={<Waybill />} />
          </Route>

          <Route element={<RoleRoute allowed={[ROLES.WAREHOUSE_STAFF]} />}>
            <Route path="/barcode/scan" element={<BarcodeScanner />} />
            <Route path="/inspection" element={<Inspection />} />
            <Route path="/packing" element={<Packing />} />
            <Route path="/picking/discrepancy" element={<PickingDiscrepancy />} />
            <Route path="/picking/fifo" element={<FifoPicking />} />
            <Route path="/warehouse/efficiency-report" element={<EfficiencyReport />} />
            <Route path="/waybill/attach" element={<WaybillAttachment />} />
          </Route>

          {/* ============================================
              ADMIN SPECIFIC
              ============================================ */}
          
          <Route element={<RoleRoute allowed={[ROLES.ADMIN]} />}>
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/products" element={<ProductManagement />} />
            <Route path="/roles" element={<RoleManagement />} />
          </Route>

          {/* ============================================
              MANAGER SPECIFIC (Additional Reports)
              ============================================ */}
          
          <Route element={<RoleRoute allowed={[ROLES.MANAGER, ROLES.ADMIN]} />}>
            <Route path="/approvals" element={<ApprovalRequests />} />
            <Route path="/reports/employee-efficiency" element={<EmployeeEfficiency />} />
            <Route path="/reports/inventory" element={<InventoryReports />} />
            <Route path="/reports/refunds" element={<RefundReports />} />
            <Route path="/reports/returns" element={<ReturnReports />} />
            <Route path="/reports/sales" element={<SalesReports />} />
            <Route path="/reports/stock-movement" element={<StockMovementReports />} />
          </Route>

          {/* ============================================
              SALES STAFF SPECIFIC
              ============================================ */}
          
          <Route element={<RoleRoute allowed={[ROLES.SALES_STAFF]} />}>
            <Route path="/customers" element={<Customer />} />
            <Route path="/invoices" element={<Invoice />} />
            <Route path="/payments" element={<Payment />} />
            <Route path="/product-release" element={<ProductRelease />} />
            <Route path="/receipts" element={<Receipt />} />
            <Route path="/refunds" element={<Refund />} />
            <Route path="/returns/verify" element={<ReturnVerification />} />
            <Route path="/sales/orders" element={<SalesOrders />} />
            <Route path="/sales/walk-in" element={<WalkInSales />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
