// ===========================================
// PureSkin Store — Input Component
// ===========================================

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export default function Input({ label, error, icon, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-dark-300">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400">
            {icon}
          </div>
        )}
        <input
          className={`w-full px-4 py-2.5 rounded-xl bg-dark-900/50 border border-white/10 text-white placeholder-dark-500 
            focus:outline-none focus:ring-2 focus:ring-brand-600/50 focus:border-brand-600/50 transition-all
            ${icon ? 'pl-10' : ''} ${error ? 'border-red-500/50 focus:ring-red-500/50' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-dark-300">{label}</label>
      )}
      <textarea
        className={`w-full px-4 py-2.5 rounded-xl bg-dark-900/50 border border-white/10 text-white placeholder-dark-500 
          focus:outline-none focus:ring-2 focus:ring-brand-600/50 focus:border-brand-600/50 transition-all resize-none
          ${error ? 'border-red-500/50' : ''} ${className}`}
        rows={3}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
