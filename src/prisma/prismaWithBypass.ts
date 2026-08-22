import { PrismaClient } from './generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from '../env';

/**
 * Create a Prisma client that bypasses Row Level Security.
 *
 * This client connects as a database user with BYPASSRLS privilege,
 * used for system operations like Better Auth that need to access
 * multi-tenant tables (Member, Invitation) without organization context.
 *
 * @returns A Prisma client that bypasses RLS for all operations
 */
export function createPrismaWithBypass(): PrismaClient {
  const connectionString = env.DATABASE_BYPASS_RLS_URL;
  if (!connectionString) {
    throw new Error('DATABASE_BYPASS_RLS_URL is not defined');
  }

  const adapter = new PrismaPg(
    { connectionString },
    { schema: env.DATABASE_SCHEMA },
  );

  return new PrismaClient({ adapter });
}
