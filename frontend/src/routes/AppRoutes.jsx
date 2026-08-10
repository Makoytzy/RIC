import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import RoleRoute from './RoleRoute.jsx';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';

import Login from '../pages/public/Login.jsx';
import SignUp from '../pages/public/SignUp.jsx';
import Dashboard from '../pages/dashboard/Dashboard.jsx';
import UserManagement from '../pages/dashboard/UserManagement.jsx';
import AuditLogs from '../pages/dashboard/admin/AuditLogs.jsx';
import Inventory from '../pages/dashboard/admin/Inventory.jsx';
import ProductManagement from '../pages/dashboard/admin/ProductManagement.jsx';
import RoleManagement from '../pages/dashboard/admin/RoleManagement.jsx';
import SystemSettings from '../pages/dashboard/admin/SystemSettings.jsx';
import ApprovalRequests from '../pages/dashboard/manager/ApprovalRequests.jsx';
import DefectReports from '../pages/dashboard/manager/DefectReports.jsx';
import DiscrepancyReports from '../pages/dashboard/manager/DiscrepancyReports.jsx';
import EmployeeEfficiency from '../pages/dashboard/manager/EmployeeEfficiency.jsx';
import InventoryReports from '../pages/dashboard/manager/InventoryReports.jsx';
import RefundReports from '../pages/dashboard/manager/RefundReports.jsx';
import ReturnReports from '../pages/dashboard/manager/ReturnReports.jsx';
import SalesReports from '../pages/dashboard/manager/SalesReports.jsx';
import StockMovementReports from '../pages/dashboard/manager/StockMovementReports.jsx';
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
import Customer from '../pages/dashboard/sales/Customer.jsx';
import Invoice from '../pages/dashboard/sales/Invoice.jsx';
import Payment from '../pages/dashboard/sales/Payment.jsx';
import ProductRelease from '../pages/dashboard/sales/ProductRelease.jsx';
import Receipt from '../pages/dashboard/sales/Receipt.jsx';
import Refund from '../pages/dashboard/sales/Refund.jsx';
import ReturnVerification from '../pages/dashboard/sales/ReturnVerification.jsx';
import SalesOrders from '../pages/dashboard/sales/SalesOrders.jsx';
import WalkInSales from '../pages/dashboard/sales/WalkInSales.jsx';
import IncomingShipments from '../pages/dashboard/shared/IncomingShipments.jsx';
import BarcodeScanner from '../pages/dashboard/warehouse/BarcodeScanner.jsx';
import EfficiencyReport from '../pages/dashboard/warehouse/EfficiencyReport.jsx';
import FifoPicking from '../pages/dashboard/warehouse/FifoPicking.jsx';
import Inspection from '../pages/dashboard/warehouse/Inspection.jsx';
import Packing from '../pages/dashboard/warehouse/Packing.jsx';
import Picking from '../pages/dashboard/warehouse/Picking.jsx';
import PickingDiscrepancy from '../pages/dashboard/warehouse/PickingDiscrepancy.jsx';
import Receiving from '../pages/dashboard/warehouse/Receiving.jsx';
import WaybillAttachment from '../pages/dashboard/warehouse/WaybillAttachment.jsx';
import { ROLES } from '../utils/permissions.js';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Administrator: User Management (existing) */}
          <Route element={<RoleRoute allowed={[ROLES.ADMIN]} />}>
            <Route path="/users" element={<UserManagement />} />
          </Route>

          {/* Administrator */}
          <Route element={<RoleRoute allowed={[ROLES.ADMIN]} />}>
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/products" element={<ProductManagement />} />
            <Route path="/roles" element={<RoleManagement />} />
            <Route path="/settings" element={<SystemSettings />} />
          </Route>

          {/* Manager */}
          <Route element={<RoleRoute allowed={[ROLES.MANAGER]} />}>
            <Route path="/approvals" element={<ApprovalRequests />} />
            <Route path="/reports/defects" element={<DefectReports />} />
            <Route path="/reports/discrepancies" element={<DiscrepancyReports />} />
            <Route path="/reports/employee-efficiency" element={<EmployeeEfficiency />} />
            <Route path="/reports/inventory" element={<InventoryReports />} />
            <Route path="/reports/refunds" element={<RefundReports />} />
            <Route path="/reports/returns" element={<ReturnReports />} />
            <Route path="/reports/sales" element={<SalesReports />} />
            <Route path="/reports/stock-movement" element={<StockMovementReports />} />
          </Route>

          {/* Operational Staff */}
          <Route element={<RoleRoute allowed={[ROLES.OPERATIONAL_STAFF]} />}>
            <Route path="/barcode/generate" element={<BarcodeGeneration />} />
            <Route path="/batches" element={<BatchManagement />} />
            <Route path="/inventory/register" element={<InventoryRegistration />} />
            <Route path="/inventory/update" element={<InventoryUpdate />} />
            <Route path="/orders" element={<OrderManagement />} />
            <Route path="/packing-slip" element={<PackingSlip />} />
            <Route path="/products/register" element={<ProductRegistration />} />
            <Route path="/returns/process" element={<ReturnProcessing />} />
            <Route path="/shipments/register" element={<ShipmentRegistration />} />
            <Route path="/waybill" element={<Waybill />} />
          </Route>

          {/* Shared: Operational Staff + Warehouse Staff */}
          <Route element={<RoleRoute allowed={[ROLES.OPERATIONAL_STAFF, ROLES.WAREHOUSE_STAFF]} />}>
            <Route path="/shipments/incoming" element={<IncomingShipments />} />
          </Route>

          {/* Warehouse Staff */}
          <Route element={<RoleRoute allowed={[ROLES.WAREHOUSE_STAFF]} />}>
            <Route path="/barcode/scan" element={<BarcodeScanner />} />
            <Route path="/inspection" element={<Inspection />} />
            <Route path="/packing" element={<Packing />} />
            <Route path="/picking" element={<Picking />} />
            <Route path="/picking/discrepancy" element={<PickingDiscrepancy />} />
            <Route path="/picking/fifo" element={<FifoPicking />} />
            <Route path="/receiving" element={<Receiving />} />
            <Route path="/warehouse/efficiency-report" element={<EfficiencyReport />} />
            <Route path="/waybill/attach" element={<WaybillAttachment />} />
          </Route>

          {/* Sales Staff */}
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

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
