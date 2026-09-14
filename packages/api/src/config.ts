// ===========================================
// PureSkin Store — API Configuration
// ===========================================

import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  // Server
  port: parseInt(process.env.API_PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // URLs
  apiUrl: process.env.API_URL || 'http://localhost:3001',
  webUrl: process.env.WEB_URL || 'http://localhost:5173',
  
  // Database
  databaseUrl: required('DATABASE_URL'),
  
  // Discord
  discordToken: required('DISCORD_TOKEN'),
  clientId: required('CLIENT_ID'),
  clientSecret: required('DISCORD_CLIENT_SECRET'),
  guildId: required('GUILD_ID'),
  staffRoleId: required('STAFF_ROLE_ID'),
  ownerRoleId: process.env.OWNER_ROLE_ID || '',
  logChannelId: process.env.LOG_CHANNEL_ID || '',
  ticketCategoryId: process.env.TICKET_CATEGORY_ID || '',
  
  // OAuth2
  oauth2RedirectUri: process.env.OAUTH2_REDIRECT_URI || 'http://localhost:3001/api/auth/callback',
  
  // Security
  jwtSecret: required('JWT_SECRET'),
  sessionSecret: process.env.SESSION_SECRET || 'default-session-secret',
  cookieDomain: process.env.COOKIE_DOMAIN || 'localhost',
  
  // Encryption
  encryptionKey: required('ENCRYPTION_KEY'),
} as const;
