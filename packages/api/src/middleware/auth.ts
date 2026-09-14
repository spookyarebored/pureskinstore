// ===========================================
// PureSkin Store — Auth Middleware
// ===========================================

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface JwtPayload {
  userId: string;
  discordId: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Verify JWT token from httpOnly cookie
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.token;
  
  if (!token) {
    res.status(401).json({ success: false, error: 'Non authentifié' });
    return;
  }
  
  try {
    const payload = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    res.clearCookie('token');
    res.status(401).json({ success: false, error: 'Token invalide ou expiré' });
  }
}

/**
 * Generate a JWT token
 */
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
}
