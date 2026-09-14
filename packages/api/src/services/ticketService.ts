// ===========================================
// PureSkin Store — Ticket Service
// ===========================================

import { prisma, TicketStatus, TicketCategory } from '@pureskin/database';

/**
 * Get all tickets with filtering and pagination
 */
export async function getTickets(params: {
  page?: number;
  limit?: number;
  status?: TicketStatus;
  category?: TicketCategory;
}) {
  const page = params.page || 1;
  const limit = params.limit || 25;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (params.status) where.status = params.status;
  if (params.category) where.category = params.category;

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      include: {
        creator: true,
        assignee: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.ticket.count({ where }),
  ]);

  return {
    tickets,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single ticket by ID
 */
export async function getTicketById(id: string) {
  return prisma.ticket.findUnique({
    where: { id },
    include: {
      creator: true,
      assignee: true,
      messages: {
        orderBy: { createdAt: 'asc' },
      },
      accounts: {
        select: {
          id: true,
          name: true,
          price: true,
          status: true,
        },
      },
    },
  });
}

/**
 * Create a ticket (called by the bot)
 */
export async function createTicket(data: {
  category: TicketCategory;
  channelId: string;
  creatorDiscordId: string;
}) {
  // Find or create user
  let user = await prisma.user.findUnique({
    where: { discordId: data.creatorDiscordId },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        discordId: data.creatorDiscordId,
        username: 'Unknown',
        role: 'USER',
      },
    });
  }

  return prisma.ticket.create({
    data: {
      category: data.category,
      channelId: data.channelId,
      creatorId: user.id,
    },
    include: {
      creator: true,
    },
  });
}

/**
 * Close a ticket
 */
export async function closeTicket(id: string) {
  return prisma.ticket.update({
    where: { id },
    data: {
      status: 'CLOSED',
      closedAt: new Date(),
    },
  });
}

/**
 * Delete a ticket
 */
export async function deleteTicket(id: string) {
  return prisma.ticket.update({
    where: { id },
    data: { status: 'DELETED' },
  });
}

/**
 * Get ticket stats
 */
export async function getTicketStats() {
  const [open, closed] = await Promise.all([
    prisma.ticket.count({ where: { status: 'OPEN' } }),
    prisma.ticket.count({ where: { status: 'CLOSED' } }),
  ]);

  return { open, closed };
}
