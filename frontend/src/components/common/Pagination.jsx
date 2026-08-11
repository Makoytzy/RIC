import React from 'react';

export default function Pagination({ page = 1, totalPages = 1, onPageChange }) {
  const prev = () => onPageChange(Math.max(1, page - 1));
  const next = () => onPageChange(Math.min(totalPages, page + 1));

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={prev}
        disabled={page <= 1}
        className="rounded-md border border-slate-200 bg-white px-3 py-1 text-sm disabled:opacity-50"
      >
        Prev
      </button>
      <span className="text-sm text-slate-600">
        {page} / {totalPages}
      </span>
      <button
        type="button"
        onClick={next}
        disabled={page >= totalPages}
        className="rounded-md border border-slate-200 bg-white px-3 py-1 text-sm disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
