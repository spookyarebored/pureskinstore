// ===========================================
// PureSkin Store — Login Page
// ===========================================

import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, LogIn, AlertTriangle } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

const errorMessages: Record<string, string> = {
  no_code: 'Erreur d\'authentification. Veuillez réessayer.',
  not_in_guild: 'Vous devez être membre du serveur Discord PureSkin.',
  insufficient_permissions: 'Vous n\'avez pas les permissions nécessaires (rôle Staff ou Owner requis).',
  auth_failed: 'L\'authentification a échoué. Veuillez réessayer.',
};

export default function LoginPage() {
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <div className="glass rounded-3xl p-8 border border-brand-600/10 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center shadow-lg mb-4 glow-brand">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">PureSkin Store</h1>
            <p className="text-dark-400 text-sm mt-1">Panel d'administration</p>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6"
            >
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{errorMessages[error] || 'Erreur inconnue.'}</p>
            </motion.div>
          )}

          {/* Info */}
          <div className="space-y-3 mb-8">
            <p className="text-sm text-dark-300 text-center">
              Connectez-vous avec votre compte Discord pour accéder au panel.
            </p>
            <div className="flex items-center gap-2 justify-center text-xs text-dark-500">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Rôle Staff ou Owner requis
            </div>
          </div>

          {/* Login Button */}
          <Button
            onClick={login}
            size="lg"
            className="w-full"
            icon={<LogIn className="w-5 h-5" />}
          >
            Se connecter avec Discord
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-dark-600 mt-6">
          PureSkin Store © {new Date().getFullYear()} — Panel sécurisé
        </p>
      </motion.div>
    </div>
  );
}
