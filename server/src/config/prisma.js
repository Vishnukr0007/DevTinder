import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

const globalForPrisma = globalThis;

const rawPrisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Prisma extension to automatically retry queries when Neon serverless closes idle socket connections
export const prisma = rawPrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        try {
          return await query(args);
        } catch (error) {
          const isClosedError =
            error?.message?.includes('Closed') ||
            error?.message?.includes('kind: Closed') ||
            error?.code === 'P1001' ||
            error?.code === 'P1017';

          if (isClosedError) {
            console.warn(`⚠️ Connection closed by Neon serverless DB. Retrying ${model}.${operation}...`);
            return await query(args);
          }
          throw error;
        }
      },
    },
  },
});

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = rawPrisma;
}

export default prisma;

