import React from 'react';

/**
 * StatusBadge Component
 * Reusable status indicator for inventory, orders, shipments, etc.
 * 
 * @param {string} status - Status type
 * @param {string} size - Badge size: 'sm' | 'md' | 'lg'
 */

const STATUS_STYLES = {
  // Inventory statuses
  available: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    label: 'Available',
  },
  'low-stock': {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    label: 'Low Stock',
  },
  'out-of-stock': {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    label: 'Out of Stock',
  },
  defective: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    label: 'Defective',
  },
  returned: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    label: 'Returned',
  },
  reserved: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    label: 'Reserved',
  },

  // Shipment/Inspection statuses
  pending: {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    label: 'Pending',
  },
  inspecting: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    label: 'Inspecting',
  },
  approved: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    label: 'Approved',
  },
  rejected: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    label: 'Rejected',
  },
  discrepancy: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    label: 'Quantity Discrepancy',
  },

  // Order statuses
  new: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    label: 'New',
  },
  processing: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    label: 'Processing',
  },
  picking: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    label: 'Picking',
  },
  packed: {
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200',
    label: 'Packed',
  },
  ready: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    label: 'Ready for Release',
  },
  completed: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    label: 'Completed',
  },
  cancelled: {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    label: 'Cancelled',
  },
};

const SIZE_STYLES = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export default function StatusBadge({ status, size = 'md', customLabel }) {
  const normalizedStatus = status?.toLowerCase().replace(/ /g, '-') || 'pending';
  const style = STATUS_STYLES[normalizedStatus] || STATUS_STYLES.pending;
  const sizeStyle = SIZE_STYLES[size] || SIZE_STYLES.md;

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium border
        ${style.bg} ${style.text} ${style.border} ${sizeStyle}
      `}
    >
      {customLabel || style.label}
    </span>
  );
}
