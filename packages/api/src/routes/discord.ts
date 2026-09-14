// ===========================================
// PureSkin Store — Discord Routes (proxy)
// ===========================================

import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { requireOwner } from '../middleware/permissions';
import * as discordService from '../services/discordService';

const router = Router();

/**
 * GET /api/discord/channels
 * Get text channels from the guild
 */
router.get('/channels', authenticate, requireOwner, async (_req: Request, res: Response) => {
  try {
    const channels = await discordService.getGuildChannels();
    res.json({ success: true, data: channels });
  } catch (error) {
    console.error('❌ Get channels error:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des salons' });
  }
});

export default router;
