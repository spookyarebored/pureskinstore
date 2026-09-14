// ===========================================
// PureSkin Store — Stock Routes
// ===========================================

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { requireOwner, requireStaff } from '../middleware/permissions';
import { validateBody } from '../middleware/validate';
import * as stockService from '../services/stockService';
import { createLog } from '../services/logService';
import { sendLogToDiscord } from '../services/discordService';
import { getIO } from '../websocket';
import { COLORS } from '@pureskin/shared';

const router = Router();

// Validation schemas
const createAccountSchema = z.object({
  name: z.string().min(1).max(200),
  skinRange: z.string().max(50).optional(),
  price: z.number().min(0),
  platform: z.string().max(50).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(['AVAILABLE', 'RESERVED', 'SOLD', 'UNAVAILABLE']).optional(),
  credentials: z.string().max(2000).optional(),
});

const updateAccountSchema = createAccountSchema.partial();

/**
 * GET /api/stock
 * List all accounts with filters
 */
router.get('/', authenticate, requireStaff, async (req: Request, res: Response) => {
  try {
    const { page, limit, status, platform, search } = req.query;
    
    const result = await stockService.getAccounts({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      status: status as any,
      platform: platform as string,
      search: search as string,
    });

    res.json({
      success: true,
      data: result.accounts,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error('❌ Get stock error:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération du stock' });
  }
});

/**
 * GET /api/stock/:id
 * Get single account
 */
router.get('/:id', authenticate, requireStaff, async (req: Request, res: Response) => {
  try {
    const account = await stockService.getAccountById(req.params.id);
    
    if (!account) {
      res.status(404).json({ success: false, error: 'Compte introuvable' });
      return;
    }

    res.json({ success: true, data: account });
  } catch (error) {
    console.error('❌ Get account error:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération du compte' });
  }
});

/**
 * POST /api/stock
 * Create a new account
 */
router.post(
  '/',
  authenticate,
  requireOwner,
  validateBody(createAccountSchema),
  async (req: Request, res: Response) => {
    try {
      const account = await stockService.createAccount(req.body);

      // Log
      await createLog({
        action: 'ACCOUNT_ADDED',
        userId: req.user!.userId,
        details: { accountId: account.id, name: account.name, price: account.price },
        ipAddress: req.ip,
      });

      // Discord log
      await sendLogToDiscord({
        title: '➕ Compte ajouté',
        description: `**${account.name}** — ${account.price}€\nPar <@${req.user!.discordId}>`,
        color: COLORS.SUCCESS,
      });

      // WebSocket notification
      const io = getIO();
      if (io) io.emit('stock:created', account);

      res.status(201).json({ success: true, data: account });
    } catch (error) {
      console.error('❌ Create account error:', error);
      res.status(500).json({ success: false, error: 'Erreur lors de la création du compte' });
    }
  }
);

/**
 * PUT /api/stock/:id
 * Update an account
 */
router.put(
  '/:id',
  authenticate,
  requireOwner,
  validateBody(updateAccountSchema),
  async (req: Request, res: Response) => {
    try {
      const existing = await stockService.getAccountById(req.params.id);
      if (!existing) {
        res.status(404).json({ success: false, error: 'Compte introuvable' });
        return;
      }

      const account = await stockService.updateAccount(req.params.id, req.body);

      // Log
      await createLog({
        action: 'ACCOUNT_MODIFIED',
        userId: req.user!.userId,
        details: { accountId: account.id, name: account.name },
        ipAddress: req.ip,
      });

      // Discord log
      await sendLogToDiscord({
        title: '✏️ Compte modifié',
        description: `**${account.name}** modifié par <@${req.user!.discordId}>`,
        color: COLORS.WARNING,
      });

      // WebSocket notification
      const io = getIO();
      if (io) io.emit('stock:updated', account);

      res.json({ success: true, data: account });
    } catch (error) {
      console.error('❌ Update account error:', error);
      res.status(500).json({ success: false, error: 'Erreur lors de la modification du compte' });
    }
  }
);

/**
 * DELETE /api/stock/:id
 * Delete an account
 */
router.delete('/:id', authenticate, requireOwner, async (req: Request, res: Response) => {
  try {
    const existing = await stockService.getAccountById(req.params.id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Compte introuvable' });
      return;
    }

    await stockService.deleteAccount(req.params.id);

    // Log
    await createLog({
      action: 'ACCOUNT_DELETED',
      userId: req.user!.userId,
      details: { accountId: req.params.id, name: existing.name },
      ipAddress: req.ip,
    });

    // Discord log
    await sendLogToDiscord({
      title: '❌ Compte supprimé',
      description: `**${existing.name}** supprimé par <@${req.user!.discordId}>`,
      color: COLORS.ERROR,
    });

    // WebSocket notification
    const io = getIO();
    if (io) io.emit('stock:deleted', { id: req.params.id });

    res.json({ success: true, message: 'Compte supprimé' });
  } catch (error) {
    console.error('❌ Delete account error:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la suppression du compte' });
  }
});

export default router;
