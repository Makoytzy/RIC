// Central place to define which roles can reach which area of the app.
// NAV_SECTIONS drives both the sidebar and route guarding, so a module
// only has to be added here once.
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  OPERATIONAL_STAFF: 'operational_staff',
  WAREHOUSE_STAFF: 'warehouse_staff',
  SALES_STAFF: 'sales_staff',
};

const ALL_ROLES = Object.values(ROLES);

// Every entry: { label, path, roles }. Grouped under a section label for
// the sidebar; section is omitted (null) for items that sit above groups.
export const NAV_SECTIONS = [
  {
    section: null,
    items: [{ label: 'Dashboard', path: '/dashboard', roles: ALL_ROLES }],
  },
  {
    section: 'Administration',
    items: [
      { label: 'User Management', path: '/users', roles: [ROLES.ADMIN] },
      { label: 'Role Management', path: '/roles', roles: [ROLES.ADMIN] },
      { label: 'Product Management', path: '/products', roles: [ROLES.ADMIN] },
      { label: 'Inventory', path: '/inventory', roles: [ROLES.ADMIN] },
      { label: 'System Settings', path: '/settings', roles: [ROLES.ADMIN] },
      { label: 'Audit Logs', path: '/audit-logs', roles: [ROLES.ADMIN] },
    ],
  },
  {
    section: 'Reports',
    items: [
      { label: 'Inventory Reports', path: '/reports/inventory', roles: [ROLES.MANAGER] },
      { label: 'Sales Reports', path: '/reports/sales', roles: [ROLES.MANAGER] },
      { label: 'Stock Movement Reports', path: '/reports/stock-movement', roles: [ROLES.MANAGER] },
      { label: 'Employee Efficiency', path: '/reports/employee-efficiency', roles: [ROLES.MANAGER] },
      { label: 'Return Reports', path: '/reports/returns', roles: [ROLES.MANAGER] },
      { label: 'Refund Reports', path: '/reports/refunds', roles: [ROLES.MANAGER] },
      { label: 'Defect Reports', path: '/reports/defects', roles: [ROLES.MANAGER] },
      { label: 'Discrepancy Reports', path: '/reports/discrepancies', roles: [ROLES.MANAGER] },
    ],
  },
  {
    section: 'Approvals',
    items: [{ label: 'Approval Requests', path: '/approvals', roles: [ROLES.MANAGER] }],
  },
  {
    section: 'Shipments & Receiving',
    items: [
      {
        label: 'Incoming Shipments',
        path: '/shipments/incoming',
        roles: [ROLES.OPERATIONAL_STAFF, ROLES.WAREHOUSE_STAFF],
      },
      { label: 'Shipment Registration', path: '/shipments/register', roles: [ROLES.OPERATIONAL_STAFF] },
      { label: 'Receiving', path: '/receiving', roles: [ROLES.WAREHOUSE_STAFF] },
      { label: 'Inspection', path: '/inspection', roles: [ROLES.WAREHOUSE_STAFF] },
    ],
  },
  {
    section: 'Products & Barcode',
    items: [
      { label: 'Product Registration', path: '/products/register', roles: [ROLES.OPERATIONAL_STAFF] },
      { label: 'Barcode Generation', path: '/barcode/generate', roles: [ROLES.OPERATIONAL_STAFF] },
      { label: 'Barcode Scanner', path: '/barcode/scan', roles: [ROLES.WAREHOUSE_STAFF] },
      { label: 'Batch Management', path: '/batches', roles: [ROLES.OPERATIONAL_STAFF] },
    ],
  },
  {
    section: 'Inventory Operations',
    items: [
      { label: 'Inventory Registration', path: '/inventory/register', roles: [ROLES.OPERATIONAL_STAFF] },
      { label: 'Inventory Update', path: '/inventory/update', roles: [ROLES.OPERATIONAL_STAFF] },
    ],
  },
  {
    section: 'Orders & Fulfillment',
    items: [
      { label: 'Order Management', path: '/orders', roles: [ROLES.OPERATIONAL_STAFF] },
      { label: 'Picking', path: '/picking', roles: [ROLES.WAREHOUSE_STAFF] },
      { label: 'FIFO Picking', path: '/picking/fifo', roles: [ROLES.WAREHOUSE_STAFF] },
      { label: 'Picking Discrepancy', path: '/picking/discrepancy', roles: [ROLES.WAREHOUSE_STAFF] },
      { label: 'Packing', path: '/packing', roles: [ROLES.WAREHOUSE_STAFF] },
      { label: 'Packing Slip', path: '/packing-slip', roles: [ROLES.OPERATIONAL_STAFF] },
      { label: 'Waybill', path: '/waybill', roles: [ROLES.OPERATIONAL_STAFF] },
      { label: 'Waybill Attachment', path: '/waybill/attach', roles: [ROLES.WAREHOUSE_STAFF] },
    ],
  },
  {
    section: 'Returns',
    items: [
      { label: 'Return Processing', path: '/returns/process', roles: [ROLES.OPERATIONAL_STAFF] },
      { label: 'Return Verification', path: '/returns/verify', roles: [ROLES.SALES_STAFF] },
    ],
  },
  {
    section: 'Sales',
    items: [
      { label: 'Customer', path: '/customers', roles: [ROLES.SALES_STAFF] },
      { label: 'Walk-in Sales', path: '/sales/walk-in', roles: [ROLES.SALES_STAFF] },
      { label: 'Sales Orders', path: '/sales/orders', roles: [ROLES.SALES_STAFF] },
      { label: 'Payment', path: '/payments', roles: [ROLES.SALES_STAFF] },
      { label: 'Receipt', path: '/receipts', roles: [ROLES.SALES_STAFF] },
      { label: 'Invoice', path: '/invoices', roles: [ROLES.SALES_STAFF] },
      { label: 'Product Release', path: '/product-release', roles: [ROLES.SALES_STAFF] },
      { label: 'Refund', path: '/refunds', roles: [ROLES.SALES_STAFF] },
    ],
  },
  {
    section: 'Performance',
    items: [{ label: 'Efficiency Report', path: '/warehouse/efficiency-report', roles: [ROLES.WAREHOUSE_STAFF] }],
  },
];

// Flat list, handy for anything that doesn't care about section grouping
// (e.g. building <Route> entries or a role's dashboard quick-links).
export const NAV_ITEMS = NAV_SECTIONS.flatMap((section) => section.items);
