// ===========================================
// PureSkin Store — SearchBar Component
// ===========================================

import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = 'Rechercher...' }: SearchBarProps) {
  return (
    <div className="relative max-w-md">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-900/50 border border-white/10 text-white placeholder-dark-500 
          focus:outline-none focus:ring-2 focus:ring-brand-600/50 focus:border-brand-600/50 transition-all text-sm"
      />
    </div>
  );
}
