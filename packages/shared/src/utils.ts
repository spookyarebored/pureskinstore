// ===========================================
// PureSkin Store — Shared Utilities
// ===========================================

import crypto from 'crypto';

/**
 * Encrypt sensitive data using AES-256-GCM
 */
export function encrypt(text: string, encryptionKey: string): string {
  const key = Buffer.from(encryptionKey, 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypt sensitive data using AES-256-GCM
 */
export function decrypt(encryptedText: string, encryptionKey: string): string {
  const key = Buffer.from(encryptionKey, 'hex');
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Format a date to a human-readable string (French locale)
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Generate a ticket channel name from username
 */
export function ticketChannelName(username: string): string {
  return `ticket-${username.toLowerCase().replace(/[^a-z0-9-]/g, '')}`;
}

/**
 * Sanitize a string to prevent XSS
 */
export function sanitize(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Strip sensitive fields from an object for logging
 */
export function stripSensitive<T extends Record<string, unknown>>(
  obj: T,
  sensitiveKeys: string[] = ['credentials', 'password', 'token', 'secret']
): Partial<T> {
  const result = { ...obj };
  for (const key of sensitiveKeys) {
    if (key in result) {
      delete result[key];
    }
  }
  return result;
}

/**
 * Truncate a string to max length
 */
export function truncate(str: string, maxLength: number = 100): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}
