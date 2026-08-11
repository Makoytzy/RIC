import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, icon: Icon, className = '', id, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Icon size={16} />
          </span>
        )}
        <input
          id={id}
          ref={ref}
          className={`w-full rounded-2xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 ${Icon ? 'pl-10' : 'pl-3'} ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
});

export default Input;
