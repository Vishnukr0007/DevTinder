import { PrismaClient } from '@prisma/client';
import { env } from './env.js';
import { sanitizeUser } from '../utils/sanitizeUser.js';

const globalForPrisma = globalThis;

const basePrisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

export const prisma = basePrisma;

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = basePrisma;
}

export default prisma;

