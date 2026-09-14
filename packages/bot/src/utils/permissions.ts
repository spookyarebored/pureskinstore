// ===========================================
// PureSkin Store — Permission Utilities
// ===========================================

import { GuildMember } from 'discord.js';
import { botConfig } from '../config';

/**
 * Check if a member is staff
 */
export function isStaff(member: GuildMember): boolean {
  return (
    member.roles.cache.has(botConfig.staffRoleId) ||
    isOwner(member)
  );
}

/**
 * Check if a member is owner
 */
export function isOwner(member: GuildMember): boolean {
  return (
    (botConfig.ownerRoleId && member.roles.cache.has(botConfig.ownerRoleId)) ||
    member.permissions.has('Administrator')
  );
}
