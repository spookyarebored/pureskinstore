// ===========================================
// PureSkin Store — Card Component
// ===========================================

import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export default function Card({ children, className = '', hover = false, glow = false }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`glass-card rounded-2xl p-6 ${hover ? 'glass-hover cursor-pointer' : ''} ${glow ? 'glow-brand' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  color?: string;
}

export function StatCard({ title, value, icon, change, changeType = 'neutral', color = 'brand' }: StatCardProps) {
  const colorMap: Record<string, string> = {
    brand: 'from-brand-600/20 to-brand-800/10 border-brand-500/20',
    green: 'from-emerald-600/20 to-emerald-800/10 border-emerald-500/20',
    red: 'from-red-600/20 to-red-800/10 border-red-500/20',
    blue: 'from-blue-600/20 to-blue-800/10 border-blue-500/20',
    amber: 'from-amber-600/20 to-amber-800/10 border-amber-500/20',
  };

  const iconColorMap: Record<string, string> = {
    brand: 'text-brand-400 bg-brand-500/10',
    green: 'text-emerald-400 bg-emerald-500/10',
    red: 'text-red-400 bg-red-500/10',
    blue: 'text-blue-400 bg-blue-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 ${colorMap[color]}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-dark-400 font-medium">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {change && (
            <p className={`text-xs font-medium ${
              changeType === 'positive' ? 'text-emerald-400' :
              changeType === 'negative' ? 'text-red-400' : 'text-dark-400'
            }`}>
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${iconColorMap[color]}`}>
          {icon}
        </div>
      </div>
      {/* Decorative gradient circle */}
      <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/[0.02] blur-2xl" />
    </motion.div>
  );
}
