// ===========================================
// PureSkin Store — Rate Limiting
// ===========================================

import rateLimit from 'express-rate-limit';

/**
 * General API rate limit
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Trop de requêtes, veuillez réessayer plus tard.' },
});

/**
 * Auth routes rate limit (stricter)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Trop de tentatives de connexion.' },
});

/**
 * Restock rate limit (prevent spam)
 */
export const restockLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Trop de restocks envoyés, veuillez patienter.' },
});
