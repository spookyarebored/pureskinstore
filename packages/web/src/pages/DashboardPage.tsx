// ===========================================
// PureSkin Store — Dashboard Page
// ===========================================

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Package, ShoppingCart, Ticket, RefreshCw, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Header from '../components/layout/Header';
import { StatCard } from '../components/ui/Card';
import Card from '../components/ui/Card';
import api from '../api/client';

interface DashboardStats {
  totalAccounts: number;
  availableAccounts: number;
  soldAccounts: number;
  reservedAccounts: number;
  openTickets: number;
  closedTickets: number;
  totalRestocks: number;
  recentSales: { date: string; count: number }[];
  recentRestocks: { date: string; count: number }[];
}

export default function DashboardPage() {
  const { onMenuToggle } = useOutletContext<{ onMenuToggle: () => void }>();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get<{ success: boolean; data: DashboardStats }>('/stats');
        if (res.success) setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Merge sales and restocks for chart
  const chartData = React.useMemo(() => {
    if (!stats) return [];
    const allDates = new Set([
      ...stats.recentSales.map((s) => s.date),
      ...stats.recentRestocks.map((r) => r.date),
    ]);
    return Array.from(allDates)
      .sort()
      .map((date) => ({
        date: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        ventes: stats.recentSales.find((s) => s.date === date)?.count || 0,
        restocks: stats.recentRestocks.find((r) => r.date === date)?.count || 0,
      }));
  }, [stats]);

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle="Vue d'ensemble de votre boutique"
        onMenuToggle={onMenuToggle}
      />

      <div className="p-4 lg:p-8 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Total comptes"
            value={loading ? '...' : stats?.totalAccounts || 0}
            icon={<Package className="w-6 h-6" />}
            color="brand"
          />
          <StatCard
            title="Disponibles"
            value={loading ? '...' : stats?.availableAccounts || 0}
            icon={<ShoppingCart className="w-6 h-6" />}
            color="green"
          />
          <StatCard
            title="Vendus"
            value={loading ? '...' : stats?.soldAccounts || 0}
            icon={<TrendingUp className="w-6 h-6" />}
            color="amber"
          />
          <StatCard
            title="Tickets ouverts"
            value={loading ? '...' : stats?.openTickets || 0}
            icon={<Ticket className="w-6 h-6" />}
            color="blue"
          />
        </div>

        {/* Chart */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Activité récente</h3>
              <p className="text-sm text-dark-400">Ventes et restocks des 30 derniers jours</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-brand-500" />
                <span className="text-dark-400">Ventes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-dark-400">Restocks</span>
              </div>
            </div>
          </div>
          <div className="h-72">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRestocks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid rgba(124,58,237,0.2)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '13px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="ventes"
                    stroke="#7c3aed"
                    strokeWidth={2}
                    fill="url(#colorVentes)"
                  />
                  <Area
                    type="monotone"
                    dataKey="restocks"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#colorRestocks)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-dark-500 text-sm">
                {loading ? 'Chargement...' : 'Pas encore de données'}
              </div>
            )}
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-500/10">
                <RefreshCw className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-dark-400">Restocks envoyés</p>
                <p className="text-2xl font-bold text-white">{stats?.totalRestocks || 0}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-red-500/10">
                <Ticket className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-dark-400">Tickets fermés</p>
                <p className="text-2xl font-bold text-white">{stats?.closedTickets || 0}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-brand-500/10">
                <Package className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <p className="text-sm text-dark-400">Réservés</p>
                <p className="text-2xl font-bold text-white">{stats?.reservedAccounts || 0}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
