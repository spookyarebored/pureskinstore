// ===========================================
// PureSkin Store — Restock Page
// ===========================================

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Send, RefreshCw, Package, Eye, Plus, Trash2 } from 'lucide-react';
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

interface Variant {
  name: string;
  price: string;
  stock: string;
}

const emptyVariant = (): Variant => ({ name: '', price: '', stock: '' });

export default function RestockPage() {
  const { onMenuToggle } = useOutletContext<{ onMenuToggle: () => void }>();
  const toast = useToast();

  const [channels, setChannels] = useState<Channel[]>([]);
  const [accountCount, setAccountCount] = useState(0);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    channelId: '',
    title: 'FA Fortnite Accounts Restocked',
    description: 'Our product **FA Fortnite Accounts** has just been restocked!',
    imageUrl: '',
  });

  const [variants, setVariants] = useState<Variant[]>([
    { name: '50–100 Skins [ OG Outfits Included ] | Fortnite Accounts', price: '', stock: '' },
  ]);

  const fetchData = async () => {
    try {
      const [channelsRes, countRes] = await Promise.all([
        api.get<any>('/discord/channels'),
        api.get<any>('/restock/available-count'),
      ]);

      if (channelsRes.success) setChannels(channelsRes.data);
      if (countRes.success) setAccountCount(countRes.data.count);
    } catch {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalVariantStock = variants.reduce((sum, variant) => {
    const stock = parseInt(variant.stock, 10);
    return sum + (Number.isFinite(stock) && stock > 0 ? stock : 0);
  }, 0);

  const priceFrom = variants.reduce((min, variant) => {
    const price = parseFloat(variant.price);
    if (!Number.isFinite(price) || price < 0) return min;
    return Math.min(min, price);
  }, Number.POSITIVE_INFINITY);

  const addVariant = () => {
    setVariants((prev) => [...prev, emptyVariant()]);
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 1) {
      toast.warning('Vous devez garder au moins une variante');
      return;
    }
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof Variant, value: string) => {
    setVariants((prev) => prev.map((variant, i) => (
      i === index ? { ...variant, [field]: value } : variant
    )));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.channelId) {
      toast.warning('Sélectionnez un salon Discord');
      return;
    }

    if (variants.length === 0) {
      toast.warning('Ajoutez au moins une variante');
      return;
    }

    for (const variant of variants) {
      if (!variant.name.trim()) {
        toast.warning('Chaque variante doit avoir un nom');
        return;
      }
      if (!variant.price || parseFloat(variant.price) < 0) {
        toast.warning('Chaque variante doit avoir un prix');
        return;
      }
      if (!variant.stock || parseInt(variant.stock, 10) < 0) {
        toast.warning('Chaque variante doit avoir un stock');
        return;
      }
    }

    if (totalVariantStock < 1) {
      toast.warning('Le stock total doit être supérieur à 0');
      return;
    }

    setSending(true);
    try {
      await api.post('/restock', {
        channelId: form.channelId,
        title: form.title,
        description: form.description,
        priceFrom: Number.isFinite(priceFrom) ? priceFrom : 0,
        imageUrl: form.imageUrl || undefined,
        accountCount: totalVariantStock,
        variants: variants.map((variant) => ({
          name: variant.name.trim(),
          price: parseFloat(variant.price),
          stock: parseInt(variant.stock, 10),
        })),
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
        subtitle="Créer un restock avec plusieurs variantes"
        onMenuToggle={onMenuToggle}
      />

      <div className="p-4 lg:p-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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
                  placeholder="FA Fortnite Accounts Restocked"
                />

                <Textarea
                  label="Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Our product FA Fortnite Accounts has just been restocked!"
                />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Variantes</h4>
                      <p className="text-xs text-dark-500 mt-1">Ajoutez autant de variantes que nécessaire.</p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={addVariant} icon={<Plus className="w-4 h-4" />}>
                      Ajouter
                    </Button>
                  </div>

                  {variants.map((variant, index) => (
                    <div key={index} className="rounded-xl border border-white/10 bg-dark-900/40 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white">Variante {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="p-1.5 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                          title="Supprimer la variante"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <Input
                        label="Nom de la variante"
                        value={variant.name}
                        onChange={(e) => updateVariant(index, 'name', e.target.value)}
                        placeholder="50-100 Skins [ OG Outfits Included ] | Fortnite Accounts"
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          label="Prix (€)"
                          type="number"
                          min="0"
                          step="0.01"
                          value={variant.price}
                          onChange={(e) => updateVariant(index, 'price', e.target.value)}
                          placeholder="50"
                        />
                        <Input
                          label="Stock"
                          type="number"
                          min="0"
                          step="1"
                          value={variant.stock}
                          onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                          placeholder="17"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-brand-500/20 bg-brand-500/5 p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-300">Stock total du restock</span>
                    <span className="font-bold text-brand-400">{totalVariantStock} comptes</span>
                  </div>
                  <div className="flex justify-between text-xs mt-2">
                    <span className="text-dark-500">Stock disponible en base</span>
                    <span className="text-dark-300">{loading ? '...' : accountCount} comptes</span>
                  </div>
                </div>

                <Input
                  label="URL de l'image/bannière (optionnel)"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://example.com/banner.png"
                />

                <Button type="submit" loading={sending} className="w-full" icon={<Send className="w-4 h-4" />}>
                  Envoyer le restock ({totalVariantStock} comptes)
                </Button>
              </form>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-brand-600/20">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-4 h-4 text-brand-400" />
                <h3 className="text-sm font-semibold text-dark-300">Aperçu Discord</h3>
              </div>

              <div className="bg-[#1e2230] rounded-xl p-4 border-l-4 border-cyan-400">
                <p className="text-cyan-300 font-bold text-sm mb-2">{form.title || 'FA Fortnite Accounts Restocked'}</p>
                <p className="text-[#d1d5db] text-xs mb-3">
                  {form.description || 'Our product FA Fortnite Accounts has just been restocked!'}
                </p>
                <p className="text-[#7dd3fc] text-xs mb-4">Buy Now</p>

                <div className="space-y-3">
                  {variants.map((variant, index) => (
                    <div key={index}>
                      <p className="text-white text-xs font-bold mb-1">Variant</p>
                      <p className="text-[#d1d5db] text-xs pr-2 mb-1">{variant.name || 'Nom de la variante'}</p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <span className="text-white font-bold">Price</span>
                        <span className="text-white font-bold">Stock</span>
                        <span />
                        <span className="text-[#d1d5db]">{variant.price ? `$${parseFloat(variant.price).toFixed(2)}` : '$0.00'}</span>
                        <span className="text-[#d1d5db]">{variant.stock || '0'}</span>
                        <span />
                      </div>
                    </div>
                  ))}
                </div>

                {form.imageUrl && (
                  <img
                    src={form.imageUrl}
                    alt="Aperçu bannière"
                    className="w-full mt-4 rounded-lg object-cover max-h-56"
                  />
                )}
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
