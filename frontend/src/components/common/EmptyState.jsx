import React from 'react';

export default function EmptyState({ title = 'Nothing here', description = '', actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-md p-8 text-center">
      <div className="h-12 w-12 rounded-full bg-slate-100 text-2xl leading-12">—</div>
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      {description && <p className="text-sm text-slate-500">{description}</p>}
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="mt-3 rounded-md bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
