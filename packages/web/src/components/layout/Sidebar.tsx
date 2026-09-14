// ===========================================
// PureSkin Store — Sidebar Component
// ===========================================

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Ticket,
  RefreshCw,
  ScrollText,
  Settings,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['OWNER', 'STAFF'] },
  { to: '/stock', icon: Package, label: 'Stock', roles: ['OWNER', 'STAFF'] },
  { to: '/tickets', icon: Ticket, label: 'Tickets', roles: ['OWNER', 'STAFF'] },
  { to: '/restock', icon: RefreshCw, label: 'Restock', roles: ['OWNER'] },
  { to: '/logs', icon: ScrollText, label: 'Logs', roles: ['OWNER'] },
  { to: '/settings', icon: Settings, label: 'Paramètres', roles: ['OWNER'] },
];

export default function Sidebar() {
  const { user, logout, isOwner } = useAuth();
  const location = useLocation();

  const filteredItems = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 glass border-r border-brand-600/10 z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
        <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shadow-lg">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold gradient-text">PureSkin</h1>
          <p className="text-xs text-dark-400">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'gradient-brand text-white shadow-lg glow-brand'
                  : 'text-dark-300 hover:text-white hover:bg-dark-800/50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info */}
      {user && (
        <div className="px-3 pb-4">
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              {user.avatar ? (
                <img
                  src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png?size=64`}
                  alt={user.username}
                  className="w-9 h-9 rounded-full ring-2 ring-brand-600/30"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-brand-600/20 flex items-center justify-center text-brand-400 font-bold text-sm">
                  {user.username[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.username}</p>
                <p className="text-xs text-brand-400">{isOwner ? 'Propriétaire' : 'Staff'}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-xs text-dark-400 hover:text-red-400 transition-colors w-full px-2 py-1.5 rounded-lg hover:bg-red-500/5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
