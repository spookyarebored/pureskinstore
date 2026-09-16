// ===========================================
// PureSkin Store — Restock Routes
// ===========================================

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { requireOwner } from '../middleware/permissions';
import { validateBody } from '../middleware/validate';
import { restockLimiter } from '../middleware/rateLimit';
import * as restockService from '../services/restockService';
import * as discordService from '../services/discordService';
import { createLog } from '../services/logService';
import { getIO } from '../websocket';
import { COLORS } from '@pureskin/shared';

const router = Router();

const variantSchema = z.object({
  name: z.string().min(1).max(200),
  price: z.number().min(0),
  stock: z.number().int().min(0),
});

const createRestockSchema = z.object({
  channelId: z.string().min(1),
  title: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  priceFrom: z.number().min(0),
  imageUrl: z.string().url().optional().or(z.literal('')),
  accountCount: z.number().int().min(1),
  variants: z.array(variantSchema).min(1),
});

router.post(
  '/',
  authenticate,
  requireOwner,
  restockLimiter,
  validateBody(createRestockSchema),
  async (req: Request, res: Response) => {
    try {
      const { channelId, title, description, priceFrom, imageUrl, accountCount, variants } = req.body;

      const messageId = await discordService.sendRestockEmbed({
        channelId,
        title: title || 'FA Fortnite Accounts Restocked',
        description,
        priceFrom,
        accountCount,
        imageUrl: imageUrl || undefined,
        variants,
      });

      const restock = await restockService.createRestock({
        channelId,
        title,
        description,
        priceFrom,
        imageUrl: imageUrl || undefined,
        accountCount,
        variants,
        creatorId: req.user!.userId,
        messageId: messageId || undefined,
      });

      await createLog({
        action: 'RESTOCK_SENT',
        userId: req.user!.userId,
        details: {
          restockId: restock.id,
          accountCount,
          variants,
          priceFrom,
          channelId,
        },
        ipAddress: req.ip,
      });

      await discordService.sendLogToDiscord({
        title: '📦 Restock envoyé',
        description: `**${variants.length}** variante(s) • **${accountCount}** comptes • À partir de **${priceFrom}€**\nPar <@${req.user!.discordId}>`,
        color: COLORS.RESTOCK,
      });

      const io = getIO();
      if (io) io.emit('restock:sent', restock);

      res.status(201).json({ success: true, data: restock });
    } catch (error) {
      console.error('❌ Restock error:', error);
      res.status(500).json({ success: false, error: 'Erreur lors de l\'envoi du restock' });
    }
  }
);

router.get('/available-count', authenticate, requireOwner, async (_req: Request, res: Response) => {
  try {
    const count = await restockService.getAvailableAccountCount();
    res.json({ success: true, data: { count } });
  } catch (error) {
    console.error('❌ Get available account count error:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération du stock disponible' });
  }
});

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { page, limit } = req.query;

    const result = await restockService.getRestocks({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json({
      success: true,
      data: result.restocks,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error('❌ Get restocks error:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des restocks' });
  }
});

export default router;
