// ===========================================
// PureSkin Store — Restock Service
// ===========================================

import { prisma } from '@pureskin/database';

/**
 * Create a restock entry
 *
 * A restock now stores the number of available accounts rather than
 * requiring individual account IDs / RestockAccount relations.
 */
export async function createRestock(data: {
  channelId: string;
  title?: string;
  description?: string;
  priceFrom: number;
  imageUrl?: string;
  accountCount: number;
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
      accountCount: data.accountCount,
      creatorId: data.creatorId,
      messageId: data.messageId,
    },
    include: {
      creator: true,
    },
  });
}

/**
 * Get the current number of available accounts.
 */
export async function getAvailableAccountCount() {
  return prisma.account.count({
    where: { status: 'AVAILABLE' },
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
