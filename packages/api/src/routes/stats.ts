// ===========================================
// PureSkin Store — Stats Routes
// ===========================================

import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { requireStaff } from '../middleware/permissions';
import * as stockService from '../services/stockService';
import * as ticketService from '../services/ticketService';
import * as restockService from '../services/restockService';
import { prisma } from '@pureskin/database';

const router = Router();

/**
 * GET /api/stats
 * Dashboard statistics
 */
router.get('/', authenticate, requireStaff, async (_req: Request, res: Response) => {
  try {
    const [accountStats, ticketStats, restockStats, totalRestocks] = await Promise.all([
      stockService.getAccountStats(),
      ticketService.getTicketStats(),
      restockService.getRestockStats(),
      prisma.restock.count(),
    ]);

    // Get recent sales (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSoldAccounts = await prisma.account.findMany({
      where: {
        status: 'SOLD',
        updatedAt: { gte: thirtyDaysAgo },
      },
      select: { updatedAt: true },
      orderBy: { updatedAt: 'asc' },
    });

    // Group sales by date
    const salesByDate: Record<string, number> = {};
    for (const account of recentSoldAccounts) {
      const date = account.updatedAt.toISOString().split('T')[0];
      salesByDate[date] = (salesByDate[date] || 0) + 1;
    }

    const recentSales = Object.entries(salesByDate).map(([date, count]) => ({
      date,
      count,
    }));

    res.json({
      success: true,
      data: {
        totalAccounts: accountStats.total,
        availableAccounts: accountStats.available,
        soldAccounts: accountStats.sold,
        reservedAccounts: accountStats.reserved,
        openTickets: ticketStats.open,
        closedTickets: ticketStats.closed,
        totalRestocks,
        recentSales,
        recentRestocks: restockStats,
      },
    });
  } catch (error) {
    console.error('❌ Stats error:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des statistiques' });
  }
});

export default router;
