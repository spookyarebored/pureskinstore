// ===========================================
// PureSkin Store — Restock Service
// ===========================================

import { prisma } from '@pureskin/database';

/**
 * Create a restock entry
 */
export async function createRestock(data: {
  channelId: string;
  title?: string;
  description?: string;
  priceFrom: number;
  imageUrl?: string;
  accountIds: string[];
  creatorId: string;
  messageId?: string;
}) {
  return prisma.restock.create({
    data: {
      channelId: data.channelId,
      title: data.title || 'NOUVEAU RESTOCK',
      description: data.description,
      priceFrom: data.priceFrom,
      imageUrl: data.imageUrl,
      accountCount: data.accountIds.length,
      creatorId: data.creatorId,
      messageId: data.messageId,
      accounts: {
        create: data.accountIds.map((accountId) => ({
          accountId,
        })),
      },
    },
    include: {
      creator: true,
      accounts: {
        include: { account: true },
      },
    },
  });
}

/**
 * Get restock history
 */
export async function getRestocks(params: { page?: number; limit?: number }) {
  const page = params.page || 1;
  const limit = params.limit || 25;
  const skip = (page - 1) * limit;

  const [restocks, total] = await Promise.all([
    prisma.restock.findMany({
      include: {
        creator: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.restock.count(),
  ]);

  return {
    restocks,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get restock stats (last 30 days)
 */
export async function getRestockStats() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const restocks = await prisma.restock.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true, accountCount: true },
    orderBy: { createdAt: 'asc' },
  });

  // Group by date
  const grouped: Record<string, number> = {};
  for (const r of restocks) {
    const date = r.createdAt.toISOString().split('T')[0];
    grouped[date] = (grouped[date] || 0) + r.accountCount;
  }

  return Object.entries(grouped).map(([date, count]) => ({ date, count }));
}
