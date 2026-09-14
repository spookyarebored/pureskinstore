// ===========================================
// PureSkin Store — Header Component
// ===========================================

import React from 'react';
import { Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuToggle?: () => void;
}

export default function Header({ title, subtitle, onMenuToggle }: HeaderProps) {
  const { user, isOwner } = useAuth();

  return (
    <header className="sticky top-0 z-30 glass border-b border-white/5 px-4 lg:px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800/50 transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">{title}</h1>
            {subtitle && <p className="text-sm text-dark-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-card">
              {user.avatar ? (
                <img
                  src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png?size=32`}
                  alt={user.username}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-brand-600/20 flex items-center justify-center text-brand-400 text-xs font-bold">
                  {user.username[0].toUpperCase()}
                </div>
              )}
              <span className="text-sm text-dark-300">{user.username}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                isOwner ? 'bg-brand-600/20 text-brand-400' : 'bg-blue-600/20 text-blue-400'
              }`}>
                {isOwner ? 'Owner' : 'Staff'}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
