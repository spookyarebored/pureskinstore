// ===========================================
// PureSkin Store — Settings Routes
// ===========================================

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { requireOwner } from '../middleware/permissions';
import { validateBody } from '../middleware/validate';
import { prisma } from '@pureskin/database';
import { createLog } from '../services/logService';

const router = Router();

const updateSettingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string().max(5000),
  description: z.string().max(500).optional(),
});

/**
 * GET /api/settings
 * Get all settings
 */
router.get('/', authenticate, requireOwner, async (_req: Request, res: Response) => {
  try {
    const settings = await prisma.setting.findMany({
      orderBy: { key: 'asc' },
    });
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('❌ Get settings error:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des paramètres' });
  }
});

/**
 * PUT /api/settings
 * Update a setting
 */
router.put(
  '/',
  authenticate,
  requireOwner,
  validateBody(updateSettingSchema),
  async (req: Request, res: Response) => {
    try {
      const { key, value, description } = req.body;

      const setting = await prisma.setting.upsert({
        where: { key },
        update: { value, description },
        create: { key, value, description },
      });

      await createLog({
        action: 'SETTINGS_CHANGED',
        userId: req.user!.userId,
        details: { key, value },
        ipAddress: req.ip,
      });

      res.json({ success: true, data: setting });
    } catch (error) {
      console.error('❌ Update setting error:', error);
      res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour du paramètre' });
    }
  }
);

export default router;
