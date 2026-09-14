// ===========================================
// PureSkin Store — Log Service
// ===========================================

import { prisma, LogAction } from '@pureskin/database';

interface LogEntry {
  action: LogAction;
  userId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

/**
 * Create a log entry in the database
 */
export async function createLog(entry: LogEntry): Promise<void> {
  try {
    await prisma.log.create({
      data: {
        action: entry.action,
        userId: entry.userId || null,
        details: entry.details ? JSON.stringify(entry.details) : null,
        ipAddress: entry.ipAddress || null,
      },
    });
  } catch (error) {
    console.error('❌ Failed to create log:', error);
  }
}

/**
 * Get logs with pagination and filtering
 */
export async function getLogs(params: {
  page?: number;
  limit?: number;
  action?: LogAction;
}) {
  const page = params.page || 1;
  const limit = params.limit || 50;
  const skip = (page - 1) * limit;

  const where = params.action ? { action: params.action } : {};

  const [logs, total] = await Promise.all([
    prisma.log.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.log.count({ where }),
  ]);

  return {
    logs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
