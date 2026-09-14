// ===========================================
// PureSkin Store — Permissions Middleware
// ===========================================

import { Request, Response, NextFunction } from 'express';

type Role = 'OWNER' | 'STAFF' | 'USER';

const ROLE_LEVELS: Record<Role, number> = {
  OWNER: 3,
  STAFF: 2,
  USER: 1,
};

/**
 * Require minimum role level
 */
export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Non authentifié' });
      return;
    }

    const userRole = req.user.role as Role;
    
    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({ success: false, error: 'Permissions insuffisantes' });
      return;
    }

    next();
  };
}

/**
 * Require OWNER role
 */
export const requireOwner = requireRole('OWNER');

/**
 * Require STAFF or higher
 */
export const requireStaff = requireRole('OWNER', 'STAFF');
