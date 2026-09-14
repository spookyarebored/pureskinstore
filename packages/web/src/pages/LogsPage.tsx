// ===========================================
// PureSkin Store — Logs Page
// ===========================================

import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ScrollText, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import api from '../api/client';

const LOG_ACTIONS: Record<string, { label: string; emoji: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'default' }> = {
  TICKET_CREATED: { label: 'Ticket créé', emoji: '🎫', variant: 'success' },
  TICKET_CLOSED: { label: 'Ticket fermé', emoji: '🔒', variant: 'warning' },
  TICKET_DELETED: { label: 'Ticket supprimé', emoji: '🗑️', variant: 'danger' },
  ACCOUNT_ADDED: { label: 'Compte ajouté', emoji: '➕', variant: 'success' },
  ACCOUNT_MODIFIED: { label: 'Compte modifié', emoji: '✏️', variant: 'info' },
  ACCOUNT_DELETED: { label: 'Compte supprimé', emoji: '❌', variant: 'danger' },
  ACCOUNT_SOLD: { label: 'Compte vendu', emoji: '💰', variant: 'warning' },
  RESTOCK_SENT: { label: 'Restock envoyé', emoji: '📦', variant: 'info' },
  PANEL_LOGIN: { label: 'Connexion panel', emoji: '🔑', variant: 'default' },
  PERMISSION_CHANGED: { label: 'Permission modifiée', emoji: '🛡️', variant: 'warning' },
  SETTINGS_CHANGED: { label: 'Config modifiée', emoji: '⚙️', variant: 'info' },
};

interface Log {
  id: string;
  action: string;
  details: string | null;
  ipAddress: string | null;
  userId: string | null;
  user?: { username: string } | null;
  createdAt: string;
}

export default function LogsPage() {
  const { onMenuToggle } = useOutletContext<{ onMenuToggle: () => void }>();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = { page: page.toString(), limit: '30' };
      if (filterAction) params.action = filterAction;
      const res = await api.get<any>('/logs', params);
      if (res.success) {
        setLogs(res.data);
        setTotalPages(res.totalPages || 1);
      }
    } catch {
      console.error('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  }, [page, filterAction]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <div>
      <Header title="Logs" subtitle="Historique des actions" onMenuToggle={onMenuToggle} />
      <div className="p-4 lg:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-dark-400" />
          <Select
            options={[
              { value: '', label: 'Toutes les actions' },
              ...Object.entries(LOG_ACTIONS).map(([value, { label, emoji }]) => ({
                value,
                label: `${emoji} ${label}`,
              })),
            ]}
            value={filterAction}
            onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
            className="!py-2 !text-sm"
          />
        </div>

        <Card className="!p-0">
          <div className="divide-y divide-white/5">
            {loading ? (
              <div className="px-6 py-12 text-center text-dark-500">Chargement...</div>
            ) : logs.length === 0 ? (
              <div className="px-6 py-12 text-center text-dark-500">
                <ScrollText className="w-12 h-12 mx-auto mb-3 text-dark-600" />
                Aucun log trouvé
              </div>
            ) : (
              logs.map((log, i) => {
                const actionInfo = LOG_ACTIONS[log.action] || { label: log.action, emoji: '📋', variant: 'default' as const };
                let details: Record<string, string> = {};
                try { if (log.details) details = JSON.parse(log.details); } catch {}

                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-start gap-4 px-6 py-4 hover:bg-white/[0.01] transition-colors"
                  >
                    <span className="text-xl mt-0.5">{actionInfo.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={actionInfo.variant}>{actionInfo.label}</Badge>
                        {log.user && <span className="text-xs text-dark-400">par {log.user.username}</span>}
                      </div>
                      {Object.keys(details).length > 0 && (
                        <p className="text-xs text-dark-500 mt-1 truncate">
                          {Object.entries(details).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-dark-600 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </motion.div>
                );
              })
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
              <p className="text-xs text-dark-500">Page {page} sur {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Précédent</Button>
                <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Suivant</Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
