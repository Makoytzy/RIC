import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Dashboard Controller
 * Provides KPI data and statistics for role-specific dashboards
 */

// ============================================
// ADMIN DASHBOARD DATA
// ============================================
export const getAdminDashboard = async (req, res) => {
  try {
    // Get user counts
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: activeUserCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get products count
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // Get low stock items
    const { count: lowStockCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .in('status', ['Low Stock', 'Critical Low', 'Out of Stock']);

    // Get warehouses count
    const { count: warehouseCount } = await supabase
      .from('warehouses')
      .select('*', { count: 'exact', head: true });

    // Get pending orders
    const { count: pendingOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get today's audit events
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: auditCount } = await supabase
      .from('activity_log')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    // Get recent activity
    const { data: recentActivity } = await supabase
      .from('activity_log')
      .select('*, users(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(10);

    res.json({
      kpis: {
        totalUsers: userCount || 0,
        activeUsers: activeUserCount || 0,
        totalProducts: productCount || 0,
        totalWarehouses: warehouseCount || 0,
        lowStock: lowStockCount || 0,
        pendingOrders: pendingOrders || 0,
        auditEvents: auditCount || 0
      },
      recentActivity: (recentActivity || []).map(a => ({
        id: a.id,
        action: a.action,
        user: a.users?.full_name || 'System Operator',
        userEmail: a.users?.email || 'system@ric.com',
        details: a.details || 'Event logged',
        time: a.created_at ? new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
        created_at: a.created_at,
        category: a.category || 'System',
        severity: a.severity || 'info',
      })),
      message: 'Admin dashboard data retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching admin dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

// ============================================
// MANAGER DASHBOARD DATA
// ============================================
export const getManagerDashboard = async (req, res) => {
  try {
    // Get pending approvals
    const { count: pendingApprovals } = await supabase
      .from('approval_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get this month's sales
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);
    
    const { data: salesData } = await supabase
      .from('orders')
      .select('total_amount')
      .gte('created_at', firstDayOfMonth.toISOString())
      .eq('status', 'completed');

    const salesThisMonth = salesData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

    // Get stock movement today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: stockMovement } = await supabase
      .from('stock_movements')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    // Get discrepancy reports
    const { count: discrepancies } = await supabase
      .from('discrepancy_reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open');

    // Get employee efficiency (average completion rate)
    const { data: efficiencyData } = await supabase
      .from('employee_tasks')
      .select('completion_rate');
    
    const avgEfficiency = efficiencyData?.length > 0
      ? Math.round(efficiencyData.reduce((sum, task) => sum + (task.completion_rate || 0), 0) / efficiencyData.length)
      : 0;

    // Get return rate this month
    const { count: returns } = await supabase
      .from('returns')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', firstDayOfMonth.toISOString());

    res.json({
      kpis: {
        pendingApprovals: pendingApprovals || 0,
        salesThisMonth: salesThisMonth,
        stockMovement: stockMovement || 0,
        discrepancies: discrepancies || 0,
        employeeEfficiency: avgEfficiency,
        returnRate: returns || 0
      },
      message: 'Manager dashboard data retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching manager dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

// ============================================
// OPERATIONAL STAFF DASHBOARD DATA
// ============================================
export const getOperationalDashboard = async (req, res) => {
  try {
    // Get pending orders
    const { count: pendingOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get incoming shipments
    const { count: incomingShipments } = await supabase
      .from('shipments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get products registered this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { count: productsRegistered } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo.toISOString());

    // Get active batches
    const { count: activeBatches } = await supabase
      .from('batches')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get returns pending
    const { count: returnsPending } = await supabase
      .from('returns')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get waybills generated today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: waybillsToday } = await supabase
      .from('waybills')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    res.json({
      kpis: {
        pendingOrders: pendingOrders || 0,
        incomingShipments: incomingShipments || 0,
        productsRegistered: productsRegistered || 0,
        activeBatches: activeBatches || 0,
        returnsPending: returnsPending || 0,
        waybillsToday: waybillsToday || 0
      },
      message: 'Operational dashboard data retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching operational dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

// ============================================
// WAREHOUSE STAFF DASHBOARD DATA
// ============================================
export const getWarehouseDashboard = async (req, res) => {
  try {
    // Get pending receiving
    const { count: pendingReceiving } = await supabase
      .from('shipments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get items to pick
    const { count: itemsToPick } = await supabase
      .from('picking_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get items to pack
    const { count: itemsToPack } = await supabase
      .from('packing_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get inspection queue
    const { count: inspectionQueue } = await supabase
      .from('shipments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'received')
      .is('inspection_completed', false);

    // Get defective found today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: defectiveToday } = await supabase
      .from('shipments')
      .select('*', { count: 'exact', head: true })
      .eq('quality_status', 'defective')
      .gte('inspection_date', today.toISOString());

    // Get tasks completed today (by current user)
    const userId = req.user.id;
    const { count: tasksCompleted } = await supabase
      .from('activity_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', today.toISOString())
      .in('action', ['picking_completed', 'packing_completed', 'shipment_received']);

    res.json({
      kpis: {
        pendingReceiving: pendingReceiving || 0,
        itemsToPick: itemsToPick || 0,
        itemsToPack: itemsToPack || 0,
        inspectionQueue: inspectionQueue || 0,
        defectiveToday: defectiveToday || 0,
        tasksCompleted: tasksCompleted || 0
      },
      message: 'Warehouse dashboard data retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching warehouse dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

// ============================================
// SALES STAFF DASHBOARD DATA
// ============================================
export const getSalesDashboard = async (req, res) => {
  try {
    // Get sales orders
    const { count: salesOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('order_type', 'sales');

    // Get today's revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data: revenueData } = await supabase
      .from('orders')
      .select('total_amount')
      .gte('created_at', today.toISOString())
      .eq('status', 'completed');

    const revenueToday = revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

    // Get pending payments
    const { count: pendingPayments } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get total customers
    const { count: customers } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });

    // Get pending returns
    const { count: pendingReturns } = await supabase
      .from('returns')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get refunds today
    const { count: refundsToday } = await supabase
      .from('refunds')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    res.json({
      kpis: {
        salesOrders: salesOrders || 0,
        revenueToday: revenueToday,
        pendingPayments: pendingPayments || 0,
        customers: customers || 0,
        pendingReturns: pendingReturns || 0,
        refundsToday: refundsToday || 0
      },
      message: 'Sales dashboard data retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching sales dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

// ============================================
// GET DASHBOARD DATA BY ROLE
// ============================================
export const getDashboardData = async (req, res) => {
  try {
    const userRoles = req.user.roles || [];
    const primaryRole = userRoles[0];

    switch (primaryRole) {
      case 'admin':
        return getAdminDashboard(req, res);
      case 'manager':
        return getManagerDashboard(req, res);
      case 'operational_staff':
        return getOperationalDashboard(req, res);
      case 'warehouse_staff':
        return getWarehouseDashboard(req, res);
      case 'sales_staff':
        return getSalesDashboard(req, res);
      default:
        return res.json({
          kpis: {},
          message: 'No dashboard data available for this role'
        });
    }
  } catch (error) {
    logger.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};
