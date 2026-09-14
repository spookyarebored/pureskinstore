// ===========================================
// PureSkin Store — Settings Page
// ===========================================

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Save, RefreshCw, Shield, Key } from 'lucide-react';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useToast } from '../contexts/ToastContext';
import api from '../api/client';

interface Setting {
  id: string;
  key: string;
  value: string;
  description: string | null;
}

const DEFAULT_SETTINGS = [
  { key: 'TICKET_WELCOME_MESSAGE', description: 'Message de bienvenue dans les tickets', default: 'Bonjour ! Un membre du staff va vous aider.' },
  { key: 'RESTOCK_DEFAULT_TITLE', description: 'Titre par défaut des restocks', default: 'NOUVEAU RESTOCK' },
  { key: 'RESTOCK_DEFAULT_DESC', description: 'Description par défaut des restocks', default: 'De nouveaux comptes sont disponibles !' },
  { key: 'MAX_OPEN_TICKETS', description: 'Nombre max de tickets ouverts par utilisateur', default: '1' },
];

export default function SettingsPage() {
  const { onMenuToggle } = useOutletContext<{ onMenuToggle: () => void }>();
  const toast = useToast();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get<any>('/settings');
        if (res.success) {
          const map: Record<string, string> = {};
          res.data.forEach((s: Setting) => { map[s.key] = s.value; });
          // Fill defaults
          DEFAULT_SETTINGS.forEach((ds) => {
            if (!(ds.key in map)) map[ds.key] = ds.default;
          });
          setSettings(map);
        }
      } catch {
        // Fill defaults on error
        const map: Record<string, string> = {};
        DEFAULT_SETTINGS.forEach((ds) => { map[ds.key] = ds.default; });
        setSettings(map);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const saveSetting = async (key: string) => {
    setSaving(true);
    try {
      const desc = DEFAULT_SETTINGS.find((d) => d.key === key)?.description;
      await api.put('/settings', { key, value: settings[key], description: desc });
      toast.success('Paramètre sauvegardé');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Header title="Paramètres" subtitle="Configuration du système" onMenuToggle={onMenuToggle} />
      <div className="p-4 lg:p-8 space-y-6">
        {/* General Settings */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-brand-500/10">
              <Shield className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Configuration générale</h3>
              <p className="text-sm text-dark-400">Paramètres du bot et du panel</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-dark-500">Chargement...</div>
          ) : (
            <div className="space-y-6">
              {DEFAULT_SETTINGS.map((ds) => (
                <div key={ds.key} className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
                  <div className="flex-1 w-full">
                    <Input
                      label={ds.description || ds.key}
                      value={settings[ds.key] || ''}
                      onChange={(e) => setSettings({ ...settings, [ds.key]: e.target.value })}
                    />
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => saveSetting(ds.key)}
                    loading={saving}
                    icon={<Save className="w-3.5 h-3.5" />}
                  >
                    Sauvegarder
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Info Card */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-amber-500/10">
              <Key className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Configuration sensible</h3>
              <p className="text-sm text-dark-400">Ces paramètres doivent être modifiés dans le fichier .env</p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-dark-400">
            <p><code className="text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded">DISCORD_TOKEN</code> — Token du bot Discord</p>
            <p><code className="text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded">CLIENT_ID</code> — ID de l'application Discord</p>
            <p><code className="text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded">GUILD_ID</code> — ID du serveur Discord</p>
            <p><code className="text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded">STAFF_ROLE_ID</code> — ID du rôle staff</p>
            <p><code className="text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded">DATABASE_URL</code> — URL de connexion PostgreSQL</p>
            <p><code className="text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded">JWT_SECRET</code> — Secret pour les tokens JWT</p>
            <p><code className="text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded">ENCRYPTION_KEY</code> — Clé de chiffrement des identifiants</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
