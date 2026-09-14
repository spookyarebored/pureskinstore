// ===========================================
// PureSkin Store — Auth Service
// ===========================================

import { prisma } from '@pureskin/database';
import { config } from '../config';

const DISCORD_API = 'https://discord.com/api/v10';

interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  global_name: string | null;
}

interface DiscordGuildMember {
  roles: string[];
  nick: string | null;
}

/**
 * Get Discord OAuth2 authorization URL
 */
export function getOAuth2Url(): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.oauth2RedirectUri,
    response_type: 'code',
    scope: 'identify guilds guilds.members.read',
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCode(code: string): Promise<DiscordTokenResponse> {
  const response = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.oauth2RedirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Discord OAuth2 error: ${error}`);
  }

  return response.json();
}

/**
 * Get Discord user info from access token
 */
export async function getDiscordUser(accessToken: string): Promise<DiscordUser> {
  const response = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Discord user');
  }

  return response.json();
}

/**
 * Get user's guild member data to check roles
 */
export async function getGuildMember(accessToken: string): Promise<DiscordGuildMember | null> {
  try {
    const response = await fetch(
      `${DISCORD_API}/users/@me/guilds/${config.guildId}/member`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

/**
 * Determine user role based on Discord roles
 */
export function determineRole(memberRoles: string[]): 'OWNER' | 'STAFF' | 'USER' {
  if (config.ownerRoleId && memberRoles.includes(config.ownerRoleId)) {
    return 'OWNER';
  }
  if (config.staffRoleId && memberRoles.includes(config.staffRoleId)) {
    return 'STAFF';
  }
  return 'USER';
}

/**
 * Find or create user in database
 */
export async function findOrCreateUser(
  discordUser: DiscordUser,
  role: 'OWNER' | 'STAFF' | 'USER'
) {
  const user = await prisma.user.upsert({
    where: { discordId: discordUser.id },
    update: {
      username: discordUser.global_name || discordUser.username,
      discriminator: discordUser.discriminator,
      avatar: discordUser.avatar,
      role,
      lastLogin: new Date(),
    },
    create: {
      discordId: discordUser.id,
      username: discordUser.global_name || discordUser.username,
      discriminator: discordUser.discriminator,
      avatar: discordUser.avatar,
      role,
      lastLogin: new Date(),
    },
  });

  return user;
}
