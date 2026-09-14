# 🛡️ PureSkin Store

> Système complet de gestion de stock + tickets Discord avec panel d'administration web.

## 📋 Vue d'ensemble

- **Bot Discord** — Système de tickets automatisé avec `/ticket`, gestion des catégories, transcription
- **Panel Web** — Dashboard, gestion de stock, restock Discord, tickets, logs
- **API REST** — Express.js sécurisée avec JWT, Zod validation, rate limiting
- **Base de données** — PostgreSQL avec Prisma ORM
- **Temps réel** — WebSocket (Socket.io) pour la synchronisation panel ↔ Discord

## 🛠️ Technologies

| Composant | Technologie |
|-----------|-------------|
| Runtime | Node.js 20+ |
| Langage | TypeScript |
| Bot Discord | discord.js v14 |
| API | Express.js |
| Frontend | React 18 + Vite |
| CSS | Tailwind CSS v3 |
| BDD | PostgreSQL + Prisma |
| Auth | Discord OAuth2 + JWT |
| WebSocket | Socket.io |
| Validation | Zod |
| Animations | Framer Motion |
| Charts | Recharts |

## 📁 Structure du projet

```
pureskin-store/
├── packages/
│   ├── database/       # Prisma schema + migrations
│   ├── shared/         # Types, constantes, utilitaires partagés
│   ├── api/            # Serveur API Express
│   ├── bot/            # Bot Discord (discord.js)
│   └── web/            # Panel web React
├── .env.example        # Template de configuration
├── package.json        # Monorepo (npm workspaces)
└── README.md
```

## 🚀 Installation

### Prérequis

- **Node.js 20+** — [Télécharger](https://nodejs.org/)
- **PostgreSQL** — [Télécharger](https://www.postgresql.org/download/)
- **Compte Discord Developer** — [Discord Developer Portal](https://discord.com/developers/applications)

### 1. Cloner et installer

```bash
# Installer toutes les dépendances
npm install
```

### 2. Créer la base de données PostgreSQL

```bash
# Connectez-vous à PostgreSQL
psql -U postgres

# Créez la base
CREATE DATABASE pureskin_store;

# Quittez
\q
```

### 3. Configurer les variables d'environnement

```bash
# Copier le template
cp .env.example .env
```

Éditez `.env` avec vos informations :

```env
# Discord
DISCORD_TOKEN=votre_token_bot
CLIENT_ID=votre_client_id
GUILD_ID=votre_guild_id
STAFF_ROLE_ID=votre_staff_role_id
OWNER_ROLE_ID=votre_owner_role_id
TICKET_CATEGORY_ID=id_categorie_tickets
LOG_CHANNEL_ID=id_salon_logs

# Base de données
DATABASE_URL=postgresql://postgres:password@localhost:5432/pureskin_store

# OAuth2
DISCORD_CLIENT_SECRET=votre_client_secret
OAUTH2_REDIRECT_URI=http://localhost:3001/api/auth/callback

# Sécurité (générez des clés aléatoires)
JWT_SECRET=votre_secret_jwt_32_chars_minimum
ENCRYPTION_KEY=votre_cle_64_hex_chars
```

#### Générer les clés de sécurité

```bash
# JWT_SECRET (32+ caractères)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# ENCRYPTION_KEY (64 caractères hex)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Créer l'application Discord

1. Allez sur le [Discord Developer Portal](https://discord.com/developers/applications)
2. Cliquez **"New Application"** → nommez-la "PureSkin Store"
3. **Bot** → **"Add Bot"** → copiez le token → collez dans `.env`
4. Activez les **Privileged Intents** :
   - ✅ Server Members Intent
   - ✅ Message Content Intent
5. **OAuth2** → **Redirects** → ajoutez `http://localhost:3001/api/auth/callback`
6. Copiez le **Client ID** et **Client Secret** → collez dans `.env`

### 5. Inviter le bot sur votre serveur

URL d'invitation (remplacez `CLIENT_ID`) :

```
https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID&permissions=8&scope=bot%20applications.commands
```

Permissions requises : **Administrator** (ou au minimum : Manage Channels, Send Messages, Embed Links, Read Message History, Manage Messages)

### 6. Préparer le serveur Discord

1. Créez une **catégorie** pour les tickets → copiez l'ID → `TICKET_CATEGORY_ID`
2. Créez un **salon de logs** → copiez l'ID → `LOG_CHANNEL_ID`
3. Créez un **rôle Staff** → copiez l'ID → `STAFF_ROLE_ID`
4. Créez un **rôle Owner** → copiez l'ID → `OWNER_ROLE_ID`

> 💡 Pour copier un ID : activez le **Mode développeur** dans Discord (Paramètres → Avancés) puis clic droit → "Copier l'identifiant"

### 7. Lancer les migrations de base de données

```bash
npm run db:push
```

### 8. Démarrer le projet

**Mode développement (3 terminaux) :**

```bash
# Terminal 1 — API
npm run dev:api

# Terminal 2 — Bot Discord
npm run dev:bot

# Terminal 3 — Panel Web
npm run dev:web
```

Le panel sera accessible sur : **http://localhost:5173**

### 9. Première utilisation

1. Ouvrez **http://localhost:5173** → cliquez **"Se connecter avec Discord"**
2. Autorisez l'application → vous serez redirigé vers le dashboard
3. Sur Discord, tapez `/ticket` dans un salon → le panel de tickets apparaît
4. Ajoutez des comptes dans **Stock** → envoyez un **Restock** sur Discord

## 📝 Commandes disponibles

| Commande | Description |
|----------|-------------|
| `npm install` | Installer toutes les dépendances |
| `npm run dev:api` | Démarrer l'API en dev |
| `npm run dev:bot` | Démarrer le bot en dev |
| `npm run dev:web` | Démarrer le panel web en dev |
| `npm run build` | Build de production |
| `npm run db:push` | Appliquer le schema Prisma |
| `npm run db:migrate` | Créer une migration |
| `npm run db:studio` | Ouvrir Prisma Studio |

## 🔒 Sécurité

- ✅ JWT dans cookies httpOnly + secure
- ✅ CORS configuré
- ✅ Rate limiting (API + Auth + Restock)
- ✅ Helmet (headers sécurisés)
- ✅ Validation Zod sur toutes les entrées
- ✅ Chiffrement AES-256-GCM des identifiants
- ✅ Vérification des rôles Discord pour l'accès au panel
- ✅ Aucun secret dans les logs
- ✅ Protection SQL injection via Prisma (requêtes paramétrées)

## 📡 API Endpoints

| Méthode | Route | Auth | Rôle | Description |
|---------|-------|------|------|-------------|
| GET | `/api/health` | Non | — | Health check |
| GET | `/api/auth/discord` | Non | — | Redirection OAuth2 |
| GET | `/api/auth/callback` | Non | — | Callback OAuth2 |
| GET | `/api/auth/me` | Oui | — | Utilisateur courant |
| POST | `/api/auth/logout` | Non | — | Déconnexion |
| GET | `/api/stock` | Oui | Staff+ | Liste du stock |
| POST | `/api/stock` | Oui | Owner | Ajouter un compte |
| PUT | `/api/stock/:id` | Oui | Owner | Modifier un compte |
| DELETE | `/api/stock/:id` | Oui | Owner | Supprimer un compte |
| GET | `/api/tickets` | Oui | Staff+ | Liste des tickets |
| GET | `/api/tickets/:id` | Oui | Staff+ | Détail d'un ticket |
| POST | `/api/restock` | Oui | Owner | Envoyer un restock |
| GET | `/api/restock` | Oui | Staff+ | Historique restocks |
| GET | `/api/stats` | Oui | Staff+ | Statistiques |
| GET | `/api/logs` | Oui | Owner | Logs système |
| GET | `/api/discord/channels` | Oui | Owner | Salons Discord |
| GET | `/api/settings` | Oui | Owner | Paramètres |
| PUT | `/api/settings` | Oui | Owner | Modifier un paramètre |

## 📜 Licence

Ce projet est privé et destiné à un usage personnel.
