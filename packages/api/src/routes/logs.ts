// ===========================================
// PureSkin Store — Logs Routes
// ===========================================

import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { requireOwner } from '../middleware/permissions';
import { getLogs } from '../services/logService';

const router = Router();

/**
 * GET /api/logs
 * Get system logs (owner only)
 */
router.get('/', authenticate, requireOwner, async (req: Request, res: Response) => {
  try {
    const { page, limit, action } = req.query;

    const result = await getLogs({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      action: action as any,
    });

    res.json({
      success: true,
      data: result.logs,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error('❌ Get logs error:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des logs' });
  }
});

export default router;
