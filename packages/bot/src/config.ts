// ===========================================
// PureSkin Store — Bot Configuration
// ===========================================

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${name}`);
  }
  return value;
}

export const botConfig = {
  token: required('DISCORD_TOKEN'),
  clientId: required('CLIENT_ID'),
  guildId: required('GUILD_ID'),
  staffRoleId: required('STAFF_ROLE_ID'),
  ownerRoleId: process.env.OWNER_ROLE_ID || '',
  ticketCategoryId: process.env.TICKET_CATEGORY_ID || '',
  logChannelId: process.env.LOG_CHANNEL_ID || '',
  apiUrl: process.env.API_URL || 'http://localhost:3001',
  encryptionKey: required('ENCRYPTION_KEY'),
} as const;
