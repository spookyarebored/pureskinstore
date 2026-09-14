// ===========================================
// PureSkin Store — Shared Constants
// ===========================================

export const TICKET_CATEGORIES = {
  BUY_ACCOUNT: {
    label: '🛒 Acheter un compte FN',
    value: 'BUY_ACCOUNT',
    emoji: '🛒',
    description: 'Acheter un compte Fortnite',
  },
  CONNECTION_ISSUE: {
    label: '🔐 Problème de connexion au compte',
    value: 'CONNECTION_ISSUE',
    emoji: '🔐',
    description: 'Problème de connexion',
  },
  EXCHANGE: {
    label: '🔄 Échange',
    value: 'EXCHANGE',
    emoji: '🔄',
    description: 'Échange de compte',
  },
} as const;

export const ACCOUNT_STATUSES = {
  AVAILABLE: { label: 'Disponible', color: '#22c55e', emoji: '🟢' },
  RESERVED: { label: 'Réservé', color: '#f59e0b', emoji: '🟡' },
  SOLD: { label: 'Vendu', color: '#ef4444', emoji: '🔴' },
  UNAVAILABLE: { label: 'Indisponible', color: '#6b7280', emoji: '⚫' },
} as const;

export const TICKET_STATUSES = {
  OPEN: { label: 'Ouvert', color: '#22c55e' },
  CLOSED: { label: 'Fermé', color: '#ef4444' },
  DELETED: { label: 'Supprimé', color: '#6b7280' },
} as const;

export const USER_ROLES = {
  OWNER: { label: 'Propriétaire', level: 3 },
  STAFF: { label: 'Staff', level: 2 },
  USER: { label: 'Utilisateur', level: 1 },
} as const;

export const LOG_ACTIONS = {
  TICKET_CREATED: { label: 'Ticket créé', emoji: '🎫' },
  TICKET_CLOSED: { label: 'Ticket fermé', emoji: '🔒' },
  TICKET_DELETED: { label: 'Ticket supprimé', emoji: '🗑️' },
  ACCOUNT_ADDED: { label: 'Compte ajouté', emoji: '➕' },
  ACCOUNT_MODIFIED: { label: 'Compte modifié', emoji: '✏️' },
  ACCOUNT_DELETED: { label: 'Compte supprimé', emoji: '❌' },
  ACCOUNT_SOLD: { label: 'Compte vendu', emoji: '💰' },
  RESTOCK_SENT: { label: 'Restock envoyé', emoji: '📦' },
  PANEL_LOGIN: { label: 'Connexion panel', emoji: '🔑' },
  PERMISSION_CHANGED: { label: 'Permission modifiée', emoji: '🛡️' },
  SETTINGS_CHANGED: { label: 'Configuration modifiée', emoji: '⚙️' },
} as const;

export const PLATFORMS = ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Mobile'] as const;

// Embed colors
export const COLORS = {
  PRIMARY: 0x7c3aed,    // Violet
  SUCCESS: 0x22c55e,    // Green
  WARNING: 0xf59e0b,    // Amber
  ERROR: 0xef4444,      // Red
  INFO: 0x3b82f6,       // Blue
  RESTOCK: 0x10b981,    // Emerald
} as const;
