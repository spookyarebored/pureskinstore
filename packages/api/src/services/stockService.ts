// ===========================================
// PureSkin Store — Stock Service
// ===========================================

import { prisma, AccountStatus } from '@pureskin/database';
import { encrypt, decrypt } from '@pureskin/shared';
import { config } from '../config';

/**
 * Get all accounts with filtering and pagination
 */
export async function getAccounts(params: {
  page?: number;
  limit?: number;
  status?: AccountStatus;
  platform?: string;
  search?: string;
}) {
  const page = params.page || 1;
  const limit = params.limit || 25;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (params.status) {
    where.status = params.status;
  }
  if (params.platform) {
    where.platform = params.platform;
  }
  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  const [accounts, total] = await Promise.all([
    prisma.account.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        skinRange: true,
        price: true,
        platform: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        ticketId: true,
        // Never select credentials in list view
      },
    }),
    prisma.account.count({ where }),
  ]);

  return {
    accounts,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single account by ID
 */
export async function getAccountById(id: string) {
  return prisma.account.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      skinRange: true,
      price: true,
      platform: true,
      description: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      ticketId: true,
    },
  });
}

/**
 * Create a new account
 */
export async function createAccount(data: {
  name: string;
  skinRange?: string;
  price: number;
  platform?: string;
  description?: string;
  status?: AccountStatus;
  credentials?: string;
}) {
  const createData: Record<string, unknown> = {
    name: data.name,
    price: data.price,
    skinRange: data.skinRange || null,
    platform: data.platform || 'PC',
    description: data.description || null,
    status: data.status || 'AVAILABLE',
  };

  // Encrypt credentials if provided
  if (data.credentials) {
    createData.credentials = encrypt(data.credentials, config.encryptionKey);
  }

  return prisma.account.create({
    data: createData as any,
    select: {
      id: true,
      name: true,
      skinRange: true,
      price: true,
      platform: true,
      description: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      ticketId: true,
    },
  });
}

/**
 * Update an existing account
 */
export async function updateAccount(
  id: string,
  data: {
    name?: string;
    skinRange?: string;
    price?: number;
    platform?: string;
    description?: string;
    status?: AccountStatus;
    credentials?: string;
  }
) {
  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.skinRange !== undefined) updateData.skinRange = data.skinRange;
  if (data.price !== undefined) updateData.price = data.price;
  if (data.platform !== undefined) updateData.platform = data.platform;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.status !== undefined) updateData.status = data.status;

  // Encrypt credentials if provided
  if (data.credentials) {
    updateData.credentials = encrypt(data.credentials, config.encryptionKey);
  }

  return prisma.account.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      skinRange: true,
      price: true,
      platform: true,
      description: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      ticketId: true,
    },
  });
}

/**
 * Delete an account
 */
export async function deleteAccount(id: string) {
  return prisma.account.delete({ where: { id } });
}

/**
 * Get account credentials (decrypted) — only for authorized users
 */
export async function getAccountCredentials(id: string): Promise<string | null> {
  const account = await prisma.account.findUnique({
    where: { id },
    select: { credentials: true },
  });

  if (!account?.credentials) return null;

  try {
    return decrypt(account.credentials, config.encryptionKey);
  } catch {
    return null;
  }
}

/**
 * Get stats for dashboard
 */
export async function getAccountStats() {
  const [total, available, sold, reserved] = await Promise.all([
    prisma.account.count(),
    prisma.account.count({ where: { status: 'AVAILABLE' } }),
    prisma.account.count({ where: { status: 'SOLD' } }),
    prisma.account.count({ where: { status: 'RESERVED' } }),
  ]);

  return { total, available, sold, reserved };
}
