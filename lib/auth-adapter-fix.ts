// Custom wrapper to fix Better Auth's field mapping issue
// Better Auth tries to use accountId/providerId but Prisma expects id/provider

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createAccountWithFix(data: {
  accountId?: string;
  providerId?: string;
  userId: string;
  password?: string;
  type?: string;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  // Map Better Auth fields to our Prisma schema
  const accountData: any = {
    id: data.accountId || data.userId, // Use accountId as id, fallback to userId
    userId: data.userId,
    type: data.type || 'credential',
    provider: data.providerId || 'credential', // Map providerId to provider
    providerAccountId: data.userId, // Use userId as providerAccountId
  };

  if (data.password) {
    accountData.password = data.password;
  }

  if (data.createdAt) {
    accountData.createdAt = data.createdAt;
  }

  if (data.updatedAt) {
    accountData.updatedAt = data.updatedAt;
  }

  return await prisma.account.create({
    data: accountData,
  });
}

