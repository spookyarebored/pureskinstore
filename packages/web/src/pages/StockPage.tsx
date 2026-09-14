// ===========================================
// PureSkin Store — Stock Page
// ===========================================

import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input, { Textarea } from '../components/ui/Input';
import Select from '../components/ui/Select';
import SearchBar from '../components/ui/SearchBar';
import { StatusBadge } from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import api from '../api/client';

interface Account {
  id: string;
  name: string;
  skinRange: string | null;
  price: number;
  platform: string;
  description: string | null;
  status: string;
  createdAt: string;
}

const PLATFORMS = [
  { value: 'PC', label: 'PC' },
  { value: 'PlayStation', label: 'PlayStation' },
  { value: 'Xbox', label: 'Xbox' },
  { value: 'Nintendo Switch', label: 'Nintendo Switch' },
  { value: 'Mobile', label: 'Mobile' },
];

const STATUSES = [
  { value: 'AVAILABLE', label: '🟢 Disponible' },
  { value: 'RESERVED', label: '🟡 Réservé' },
  { value: 'SOLD', label: '🔴 Vendu' },
  { value: 'UNAVAILABLE', label: '⚫ Indisponible' },
];

const emptyForm = {
  name: '',
  price: '',
  platform: 'PC',
  skinRange: '',
  description: '',
  status: 'AVAILABLE',
  credentials: '',
};

export default function StockPage() {
  const { onMenuToggle } = useOutletContext<{ onMenuToggle: () => void }>();
  const { isOwner } = useAuth();
  const toast = useToast();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = { page: page.toString(), limit: '20' };
      if (search) params.search = search;
      if (filterStatus) params.status = filterStatus;
      if (filterPlatform) params.platform = filterPlatform;

      const res = await api.get<any>('/stock', params);
      if (res.success) {
        setAccounts(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      toast.error('Erreur lors du chargement du stock');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterStatus, filterPlatform]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        name: form.name,
        price: parseFloat(form.price),
        platform: form.platform,
        skinRange: form.skinRange || undefined,
        description: form.description || undefined,
        status: form.status,
        credentials: form.credentials || undefined,
      };

      if (editingId) {
        await api.put(`/stock/${editingId}`, payload);
        toast.success('Compte modifié avec succès');
      } else {
        await api.post('/stock', payload);
        toast.success('Compte ajouté au stock');
      }

      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      fetchAccounts();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (account: Account) => {
    setEditingId(account.id);
    setForm({
      name: account.name,
      price: account.price.toString(),
      platform: account.platform,
      skinRange: account.skinRange || '',
      description: account.description || '',
      status: account.status,
      credentials: '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/stock/${id}`);
      toast.success('Compte supprimé');
      setDeleteConfirm(null);
      fetchAccounts();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la suppression');
    }
  };

  return (
    <div>
      <Header
        title="Gestion du Stock"
        subtitle={`${total} comptes au total`}
        onMenuToggle={onMenuToggle}
      />

      <div className="p-4 lg:p-8 space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un compte..." />

          <div className="flex items-center gap-3 flex-wrap">
            <Select
              options={[{ value: '', label: 'Tous les statuts' }, ...STATUSES]}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="!py-2 !text-sm"
            />
            <Select
              options={[{ value: '', label: 'Toutes les plateformes' }, ...PLATFORMS]}
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="!py-2 !text-sm"
            />
            {isOwner && (
              <Button
                onClick={() => { setEditingId(null); setForm(emptyForm); setShowModal(true); }}
                icon={<Plus className="w-4 h-4" />}
              >
                Ajouter
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase tracking-wider">Nom</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase tracking-wider">Prix</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase tracking-wider hidden sm:table-cell">Plateforme</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase tracking-wider hidden md:table-cell">Skins</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase tracking-wider">Statut</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-dark-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-dark-500">Chargement...</td>
                  </tr>
                ) : accounts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-dark-500">
                      <Package className="w-12 h-12 mx-auto mb-3 text-dark-600" />
                      Aucun compte trouvé
                    </td>
                  </tr>
                ) : (
                  accounts.map((account, i) => (
                    <motion.tr
                      key={account.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-white">{account.name}</p>
                          {account.description && (
                            <p className="text-xs text-dark-500 mt-0.5 truncate max-w-[200px]">{account.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-brand-400">{account.price}€</td>
                      <td className="px-6 py-4 text-sm text-dark-300 hidden sm:table-cell">{account.platform}</td>
                      <td className="px-6 py-4 text-sm text-dark-300 hidden md:table-cell">{account.skinRange || '—'}</td>
                      <td className="px-6 py-4"><StatusBadge status={account.status} /></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isOwner && (
                            <>
                              <button
                                onClick={() => handleEdit(account)}
                                className="p-2 rounded-lg text-dark-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                                title="Modifier"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(account.id)}
                                className="p-2 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Modifier le compte' : 'Ajouter un compte'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nom du compte" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Ex: Compte OG Renegade" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Prix (€)" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required placeholder="29.99" />
            <Input label="Tranche de skins" value={form.skinRange} onChange={(e) => setForm({ ...form, skinRange: e.target.value })} placeholder="100-150" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Plateforme" options={PLATFORMS} value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} />
            <Select label="Statut" options={STATUSES} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} />
          </div>
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description du compte..." />
          <Input label="Identifiants (chiffrés)" type="password" value={form.credentials} onChange={(e) => setForm({ ...form, credentials: e.target.value })} placeholder={editingId ? 'Laisser vide pour ne pas modifier' : 'email:motdepasse'} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Annuler</Button>
            <Button type="submit" loading={saving}>{editingId ? 'Modifier' : 'Ajouter au stock'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Confirmer la suppression"
      >
        <p className="text-dark-300 mb-6">Êtes-vous sûr de vouloir supprimer ce compte ? Cette action est irréversible.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Annuler</Button>
          <Button variant="danger" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Supprimer</Button>
        </div>
      </Modal>
    </div>
  );
}
