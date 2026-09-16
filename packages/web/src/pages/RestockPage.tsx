// ===========================================
// PureSkin Store — Restock Page
// ===========================================

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Send, RefreshCw, Package, Eye } from 'lucide-react';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input, { Textarea } from '../components/ui/Input';
import Select from '../components/ui/Select';
import { useToast } from '../contexts/ToastContext';
import api from '../api/client';

interface Channel {
  id: string;
  name: string;
}

export default function RestockPage() {
  const { onMenuToggle } = useOutletContext<{ onMenuToggle: () => void }>();
  const toast = useToast();

  const [channels, setChannels] = useState<Channel[]>([]);
  const [accountCount, setAccountCount] = useState(0);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    channelId: '',
    title: 'NOUVEAU RESTOCK',
    description: 'De nouveaux comptes sont disponibles !',
    priceFrom: '',
    imageUrl: '',
    accountCount: '',
  });

  const fetchData = async () => {
    try {
      const [channelsRes, countRes] = await Promise.all([
        api.get<any>('/discord/channels'),
        api.get<any>('/restock/available-count'),
      ]);

      if (channelsRes.success) setChannels(channelsRes.data);
      if (countRes.success) {
        const count = countRes.data.count;
        setAccountCount(count);
        setForm((prev) => ({ ...prev, accountCount: String(count) }));
      }
    } catch {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.channelId) { toast.warning('Sélectionnez un salon Discord'); return; }
    if (!form.accountCount || parseInt(form.accountCount, 10) < 1) {
      toast.warning('Indiquez un nombre de comptes disponible');
      return;
    }
    if (!form.priceFrom) { toast.warning('Indiquez un prix minimum'); return; }

    setSending(true);
    try {
      await api.post('/restock', {
        channelId: form.channelId,
        title: form.title,
        description: form.description,
        priceFrom: parseFloat(form.priceFrom),
        imageUrl: form.imageUrl || undefined,
        accountCount: parseInt(form.accountCount, 10),
      });
      toast.success('Restock envoyé sur Discord !');
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l\'envoi du restock');
    } finally {
      setSending(false);
    }
  };

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
                  label="Nombre de comptes disponibles"
                  type="number"
                  min="1"
                  step="1"
                  value={form.accountCount}
                  onChange={(e) => setForm({ ...form, accountCount: e.target.value })}
                  placeholder={loading ? 'Chargement...' : String(accountCount)}
                />
                <p className="text-xs text-dark-500 -mt-2">
                  Stock actuellement disponible : <span className="text-brand-400 font-semibold">{accountCount}</span> comptes
                </p>
                <Input
                  label="Prix à partir de (€)"
                  type="number"
                  step="0.01"
                  value={form.priceFrom}
                  onChange={(e) => setForm({ ...form, priceFrom: e.target.value })}
                  placeholder="10"
                />
                <Input
                  label="URL de l'image/bannière (optionnel)"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://example.com/banner.png"
                />

                <Button type="submit" loading={sending} className="w-full" icon={<Send className="w-4 h-4" />}>
                  Envoyer le restock ({form.accountCount || 0} comptes)
                </Button>
              </form>
            </Card>
          </div>

          {/* Preview */}
          <div className="space-y-6">
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
                    <p className="text-white text-sm font-bold">{form.accountCount || '0'}</p>
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

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-dark-300">Stock disponible</h3>
                  <p className="text-xs text-dark-500 mt-1">Nombre de comptes actuellement disponibles</p>
                </div>
                <Button variant="ghost" size="sm" onClick={fetchData} icon={<RefreshCw className="w-4 h-4" />}>
                  Actualiser
                </Button>
              </div>
              <div className="flex items-center gap-3 mt-5 p-4 rounded-xl border border-white/5 bg-dark-900/30">
                <Package className="w-8 h-8 text-brand-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{accountCount}</p>
                  <p className="text-xs text-dark-400">comptes disponibles</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
