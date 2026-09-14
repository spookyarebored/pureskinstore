// ===========================================
// PureSkin Store — Ticket Routes
// ===========================================

import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { requireStaff } from '../middleware/permissions';
import * as ticketService from '../services/ticketService';

const router = Router();

/**
 * GET /api/tickets
 * List tickets with filters
 */
router.get('/', authenticate, requireStaff, async (req: Request, res: Response) => {
  try {
    const { page, limit, status, category } = req.query;

    const result = await ticketService.getTickets({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      status: status as any,
      category: category as any,
    });

    res.json({
      success: true,
      data: result.tickets,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error('❌ Get tickets error:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des tickets' });
  }
});

/**
 * GET /api/tickets/:id
 * Get single ticket details
 */
router.get('/:id', authenticate, requireStaff, async (req: Request, res: Response) => {
  try {
    const ticket = await ticketService.getTicketById(req.params.id);
    
    if (!ticket) {
      res.status(404).json({ success: false, error: 'Ticket introuvable' });
      return;
    }

    res.json({ success: true, data: ticket });
  } catch (error) {
    console.error('❌ Get ticket error:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération du ticket' });
  }
});

export default router;
