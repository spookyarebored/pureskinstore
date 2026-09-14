// ===========================================
// PureSkin Store — Badge Component
// ===========================================

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

const variants = {
  default: 'bg-dark-700/50 text-dark-300 border-dark-600/30',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  danger: 'bg-red-500/10 text-red-400 border-red-500/20',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

export default function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center font-medium rounded-lg border ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
}

/**
 * Status badge for account/ticket statuses
 */
export function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    AVAILABLE: { variant: 'success', label: '🟢 Disponible' },
    RESERVED: { variant: 'warning', label: '🟡 Réservé' },
    SOLD: { variant: 'danger', label: '🔴 Vendu' },
    UNAVAILABLE: { variant: 'default', label: '⚫ Indisponible' },
    OPEN: { variant: 'success', label: 'Ouvert' },
    CLOSED: { variant: 'danger', label: 'Fermé' },
    DELETED: { variant: 'default', label: 'Supprimé' },
  };

  const config = statusMap[status] || { variant: 'default' as const, label: status };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
