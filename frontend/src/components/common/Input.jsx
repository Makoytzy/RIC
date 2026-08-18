import { forwardRef } from 'react';

const Input = forwardRef(
  (
    {
      label,
      error,
      icon: Icon,
      suffix,
      className = '',
      labelClassName = 'text-slate-700',
      id,
      ...props
    },
    ref
  ) => {
    return (
      <div className="flex flex-col gap-1.5">
        {/* Label */}
        {label && (
          <label
            htmlFor={id}
            className={`text-sm font-medium ${labelClassName}`}
          >
            {label}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {Icon && (
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Icon size={16} />
            </span>
          )}

          {/* Input Field */}
          <input
            id={id}
            ref={ref}
            className={`w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 appearance-none ${
              Icon ? 'pl-10' : 'pl-3'
            } ${suffix ? 'pr-10' : 'pr-3'} ${className}`}
            {...props}
          />

          {/* Right Icon / Suffix */}
          {suffix && (
            <span className="pointer-events-auto absolute right-3 top-1/2 -translate-y-1/2">
              {suffix}
            </span>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <span className="text-xs text-red-600">
            {error}
          </span>
        )}
      </div>
    );
  }
);

export default Input;