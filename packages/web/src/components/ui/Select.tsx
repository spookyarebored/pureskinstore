// ===========================================
// PureSkin Store — Select Component
// ===========================================

import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export default function Select({ label, error, options, placeholder, className = '', ...props }: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-dark-300">{label}</label>
      )}
      <select
        className={`w-full px-4 py-2.5 rounded-xl bg-dark-900/50 border border-white/10 text-white 
          focus:outline-none focus:ring-2 focus:ring-brand-600/50 focus:border-brand-600/50 transition-all
          appearance-none cursor-pointer
          ${error ? 'border-red-500/50' : ''} ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" className="bg-dark-900 text-dark-400">
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-dark-900">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
