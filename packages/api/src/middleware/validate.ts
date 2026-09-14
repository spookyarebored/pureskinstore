// ===========================================
// PureSkin Store — Validation Middleware
// ===========================================

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Validate request body against a Zod schema
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
        res.status(400).json({
          success: false,
          error: 'Données invalides',
          details: messages,
        });
        return;
      }
      next(error);
    }
  };
}

/**
 * Validate request query parameters against a Zod schema
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
        res.status(400).json({
          success: false,
          error: 'Paramètres invalides',
          details: messages,
        });
        return;
      }
      next(error);
    }
  };
}
