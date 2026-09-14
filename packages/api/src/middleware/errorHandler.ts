// ===========================================
// PureSkin Store — Error Handler
// ===========================================

import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('❌ Error:', err.message);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // Don't leak internal errors in production
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Erreur interne du serveur'
      : err.message;

  res.status(500).json({
    success: false,
    error: message,
  });
}

/**
 * 404 handler
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Route non trouvée: ${req.method} ${req.path}`,
  });
}
