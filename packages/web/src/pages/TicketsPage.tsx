// ===========================================
// PureSkin Store — Tickets Page
// ===========================================

import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Ticket, Clock, CheckCircle, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import { StatusBadge } from '../components/ui/Badge';
import { useToast } from '../contexts/ToastContext';
import api from '../api/client';

const TICKET_CATEGORIES: Record<string, string> = {
  BUY_ACCOUNT: '🛒 Acheter un compte FN',
  CONNECTION_ISSUE: '🔐 Problème de connexion',
  EXCHANGE: '🔄 Échange',
};

interface TicketData {
  id: string;
  ticketNumber: number;
  category: string;
  status: string;
  channelId: string | null;
  closedAt: string | null;
  createdAt: string;
  creator?: { username: string; discordId: string; avatar: string | null };
  assignee?: { username: string } | null;
  messages?: { id: string; content: string; authorName: string; createdAt: string }[];
}

export default function TicketsPage() {
  const { onMenuToggle } = useOutletContext<{ onMenuToggle: () => void }>();
  const toast = useToast();

  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filterStatus) params.status = filterStatus;
      if (filterCategory) params.category = filterCategory;

      const res = await api.get<any>('/tickets', params);
      if (res.success) {
        setTickets(res.data);
      }
    } catch {
      toast.error('Erreur lors du chargement des tickets');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterCategory]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const viewTicket = async (id: string) => {
    try {
      setDetailLoading(true);
      const res = await api.get<any>(`/tickets/${id}`);
      if (res.success) {
        setSelectedTicket(res.data);
      }
    } catch {
      toast.error('Erreur lors du chargement du ticket');
    } finally {
      setDetailLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div>
      <Header
        title="Tickets"
        subtitle="Gestion des tickets Discord"
        onMenuToggle={onMenuToggle}
      />

      <div className="p-4 lg:p-8 space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Select
            options={[
              { value: '', label: 'Tous les statuts' },
              { value: 'OPEN', label: '🟢 Ouvert' },
              { value: 'CLOSED', label: '🔴 Fermé' },
            ]}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="!py-2 !text-sm"
          />
          <Select
            options={[
              { value: '', label: 'Toutes les catégories' },
              { value: 'BUY_ACCOUNT', label: '🛒 Acheter' },
              { value: 'CONNECTION_ISSUE', label: '🔐 Connexion' },
              { value: 'EXCHANGE', label: '🔄 Échange' },
            ]}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="!py-2 !text-sm"
          />
        </div>

        {/* Tickets List */}
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase tracking-wider">#</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase tracking-wider">Utilisateur</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase tracking-wider hidden sm:table-cell">Catégorie</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase tracking-wider hidden md:table-cell">Date</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase tracking-wider">Statut</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-dark-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-dark-500">Chargement...</td></tr>
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-dark-500">
                      <Ticket className="w-12 h-12 mx-auto mb-3 text-dark-600" />
                      Aucun ticket trouvé
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket, i) => (
                    <motion.tr
                      key={ticket.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-mono text-brand-400">#{ticket.ticketNumber}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {ticket.creator?.avatar ? (
                            <img
                              src={`https://cdn.discordapp.com/avatars/${ticket.creator.discordId}/${ticket.creator.avatar}.png?size=32`}
                              className="w-7 h-7 rounded-full"
                              alt=""
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-brand-600/20 flex items-center justify-center text-brand-400 text-xs font-bold">
                              {ticket.creator?.username?.[0]?.toUpperCase() || '?'}
                            </div>
                          )}
                          <span className="text-sm text-white">{ticket.creator?.username || 'Inconnu'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-dark-300 hidden sm:table-cell">{TICKET_CATEGORIES[ticket.category] || ticket.category}</td>
                      <td className="px-6 py-4 text-sm text-dark-400 hidden md:table-cell">{formatDate(ticket.createdAt)}</td>
                      <td className="px-6 py-4"><StatusBadge status={ticket.status} /></td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => viewTicket(ticket.id)}
                          className="p-2 rounded-lg text-dark-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Ticket Detail Modal */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title={`Ticket #${selectedTicket?.ticketNumber || ''}`}
        maxWidth="max-w-2xl"
      >
        {selectedTicket && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-dark-400 mb-1">Utilisateur</p>
                <p className="text-sm text-white">{selectedTicket.creator?.username}</p>
              </div>
              <div>
                <p className="text-xs text-dark-400 mb-1">Catégorie</p>
                <p className="text-sm text-white">{TICKET_CATEGORIES[selectedTicket.category]}</p>
              </div>
              <div>
                <p className="text-xs text-dark-400 mb-1">Statut</p>
                <StatusBadge status={selectedTicket.status} />
              </div>
              <div>
                <p className="text-xs text-dark-400 mb-1">Créé le</p>
                <p className="text-sm text-white">{formatDate(selectedTicket.createdAt)}</p>
              </div>
              {selectedTicket.assignee && (
                <div>
                  <p className="text-xs text-dark-400 mb-1">Staff assigné</p>
                  <p className="text-sm text-white">{selectedTicket.assignee.username}</p>
                </div>
              )}
              {selectedTicket.closedAt && (
                <div>
                  <p className="text-xs text-dark-400 mb-1">Fermé le</p>
                  <p className="text-sm text-white">{formatDate(selectedTicket.closedAt)}</p>
                </div>
              )}
            </div>

            {/* Messages */}
            {selectedTicket.messages && selectedTicket.messages.length > 0 && (
              <div>
                <p className="text-xs text-dark-400 mb-2 font-semibold uppercase tracking-wider">Messages ({selectedTicket.messages.length})</p>
                <div className="space-y-2 max-h-60 overflow-y-auto rounded-xl bg-dark-900/50 p-3">
                  {selectedTicket.messages.map((msg) => (
                    <div key={msg.id} className="text-sm">
                      <span className="text-brand-400 font-medium">{msg.authorName}</span>
                      <span className="text-dark-500 text-xs ml-2">{formatDate(msg.createdAt)}</span>
                      <p className="text-dark-300 mt-0.5">{msg.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
