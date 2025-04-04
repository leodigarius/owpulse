import { PrismaClient } from '@prisma/client'; // Revert to standard import

// Declare a global variable to hold the Prisma Client instance
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Instantiate PrismaClient, reusing the existing instance in development
// or creating a new one in production.
const prisma = global.prisma || new PrismaClient();

// In development, assign the new instance to the global variable
if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma;
}

export default prisma;
