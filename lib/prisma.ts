import { PrismaClient } from '@prisma/client';

// Add better error handling to PrismaClient
const prismaClientSingleton = () => {
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      errorFormat: 'pretty',
    });
  } catch (error) {
    console.error('Failed to initialize Prisma client:', error);
    // Return a mock PrismaClient that won't crash the app but will log errors
    return {
      $connect: () => Promise.resolve(),
      $disconnect: () => Promise.resolve(),
      // Add more mock methods as needed
      _isOffline: true,
    } as unknown as PrismaClient;
  }
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

// Use an existing Prisma instance if available, otherwise create one
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Signal if we're using the offline version
export const isPrismaOffline = () => {
  return (prisma as any)._isOffline === true;
};
