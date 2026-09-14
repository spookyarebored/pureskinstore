// ===========================================
// PureSkin Store — Restock Page
// ===========================================

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Send, RefreshCw, Package, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input, { Textarea } from '../components/ui/Input';
import Select from '../components/ui/Select';
import { useToast } from '../contexts/ToastContext';
import api from '../api/client';

interface Account {
  id: string;
  name: string;
  price: number;
  platform: string;
  status: string;
}

interface Channel {
  id: string;
  name: string;
}

export default function RestockPage() {
  const { onMenuToggle } = useOutletContext<{ onMenuToggle: () => void }>();
  const toast = useToast();

  const [channels, setChannels] = useState<Channel[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    channelId: '',
    title: 'NOUVEAU RESTOCK',
    description: 'De nouveaux comptes sont disponibles !',
    priceFrom: '',
    imageUrl: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [channelsRes, accountsRes] = await Promise.all([
          api.get<any>('/discord/channels'),
          api.get<any>('/stock', { status: 'AVAILABLE', limit: '100' }),
        ]);
        if (channelsRes.success) setChannels(channelsRes.data);
        if (accountsRes.success) setAccounts(accountsRes.data);
      } catch {
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleAccount = (id: string) => {
    setSelectedAccounts((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedAccounts.length === accounts.length) {
      setSelectedAccounts([]);
    } else {
      setSelectedAccounts(accounts.map((a) => a.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.channelId) { toast.warning('Sélectionnez un salon Discord'); return; }
    if (selectedAccounts.length === 0) { toast.warning('Sélectionnez au moins un compte'); return; }
    if (!form.priceFrom) { toast.warning('Indiquez un prix minimum'); return; }

    setSending(true);
    try {
      await api.post('/restock', {
        channelId: form.channelId,
        title: form.title,
        description: form.description,
        priceFrom: parseFloat(form.priceFrom),
        imageUrl: form.imageUrl || undefined,
        accountIds: selectedAccounts,
      });
      toast.success('Restock envoyé sur Discord !');
      setSelectedAccounts([]);
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l\'envoi du restock');
    } finally {
      setSending(false);
    }
  };

  const minPrice = accounts
    .filter((a) => selectedAccounts.includes(a.id))
    .reduce((min, a) => Math.min(min, a.price), Infinity);

  return (
    <div>
      <Header
        title="Restock Discord"
        subtitle="Envoyer un message de restock sur Discord"
        onMenuToggle={onMenuToggle}
      />

      <div className="p-4 lg:p-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Form */}
          <div className="space-y-6">
            <Card>
              <h3 className="text-lg font-semibold text-white mb-4">Configuration du restock</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Select
                  label="Salon Discord"
                  options={channels.map((c) => ({ value: c.id, label: `#${c.name}` }))}
                  value={form.channelId}
                  onChange={(e) => setForm({ ...form, channelId: e.target.value })}
                  placeholder="Sélectionner un salon..."
                />
                <Input
                  label="Titre"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="NOUVEAU RESTOCK"
                />
                <Textarea
                  label="Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="De nouveaux comptes sont disponibles !"
                />
                <Input
                  label="Prix à partir de (€)"
                  type="number"
                  step="0.01"
                  value={form.priceFrom}
                  onChange={(e) => setForm({ ...form, priceFrom: e.target.value })}
                  placeholder={minPrice !== Infinity ? minPrice.toString() : '10'}
                />
                <Input
                  label="URL de l'image/bannière (optionnel)"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://example.com/banner.png"
                />

                <Button type="submit" loading={sending} className="w-full" icon={<Send className="w-4 h-4" />}>
                  Envoyer le restock ({selectedAccounts.length} comptes)
                </Button>
              </form>
            </Card>
          </div>

          {/* Account Selection + Preview */}
          <div className="space-y-6">
            {/* Preview */}
            <Card className="border-brand-600/20">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-4 h-4 text-brand-400" />
                <h3 className="text-sm font-semibold text-dark-300">Aperçu Discord</h3>
              </div>
              <div className="bg-[#2b2d31] rounded-xl p-4 border-l-4 border-emerald-500">
                <p className="text-emerald-400 font-bold text-sm mb-2">🟢 {form.title || 'NOUVEAU RESTOCK'}</p>
                <p className="text-[#b5bac1] text-xs italic mb-3">{form.description || 'De nouveaux comptes sont disponibles !'}</p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <p className="text-[#949ba4] text-xs font-semibold">📦 Comptes disponibles</p>
                    <p className="text-white text-sm font-bold">{selectedAccounts.length || '0'}</p>
                  </div>
                  <div>
                    <p className="text-[#949ba4] text-xs font-semibold">💰 Prix à partir de</p>
                    <p className="text-white text-sm font-bold">{form.priceFrom || '0'}€</p>
                  </div>
                </div>
                <p className="text-[#949ba4] text-xs font-semibold mb-1">🛒 Comment acheter ?</p>
                <p className="text-[#b5bac1] text-xs">Ouvrez un ticket dans la catégorie <strong>Acheter un compte FN</strong>.</p>
              </div>
            </Card>

            {/* Account Selection */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-dark-300">
                  Comptes disponibles ({accounts.length})
                </h3>
                <Button variant="ghost" size="sm" onClick={selectAll}>
                  {selectedAccounts.length === accounts.length ? 'Désélectionner tout' : 'Tout sélectionner'}
                </Button>
              </div>

              {loading ? (
                <p className="text-dark-500 text-sm py-4 text-center">Chargement...</p>
              ) : accounts.length === 0 ? (
                <div className="text-center py-8 text-dark-500">
                  <Package className="w-10 h-10 mx-auto mb-2 text-dark-600" />
                  <p className="text-sm">Aucun compte disponible</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {accounts.map((account) => {
                    const isSelected = selectedAccounts.includes(account.id);
                    return (
                      <motion.button
                        key={account.id}
                        type="button"
                        onClick={() => toggleAccount(account.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                          isSelected
                            ? 'border-brand-600/40 bg-brand-600/10'
                            : 'border-white/5 bg-dark-900/30 hover:border-white/10'
                        }`}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                            isSelected ? 'bg-brand-600 border-brand-600' : 'border-dark-500'
                          }`}>
                            {isSelected && <span className="text-white text-xs">✓</span>}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{account.name}</p>
                            <p className="text-xs text-dark-400">{account.platform}</p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-brand-400">{account.price}€</span>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
