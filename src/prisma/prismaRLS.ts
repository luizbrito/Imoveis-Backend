import { PrismaClient } from './generated/client';
import { env } from '../env';

/**
 * Prisma extension for Row Level Security (RLS) support.
 *
 * Exposes a helper (`$withRLS`) that wraps Prisma operations in a transaction
 * while setting the current organization context via a PostgreSQL session
 * variable used by RLS policies.
 */

export type PrismaWithRLS = ReturnType<typeof createPrismaWithRLS>;

export function createPrismaWithRLS(prisma: PrismaClient) {
  return prisma.$extends({
    client: {
      /**
       * Execute a query with organization context for RLS policies.
       *
       * Wraps the callback in a transaction and, when an organization ID is
       * provided, sets `app.current_organization_id` for the duration of that
       * transaction so PostgreSQL RLS policies can enforce tenant isolation.
       *
       * @param options - Context options including the organization (if any).
       * @param fn - The function to execute using the RLS-aware client.
       */
      async $withRLS<T>(
        options: {
          organization?: { id?: string | null };
        },
        fn: (client: PrismaClient) => Promise<T>,
      ): Promise<T> {
        return await (prisma as any).$transaction(async (tx: PrismaClient) => {
          // Set search_path for raw queries (workaround for @prisma/adapter-pg bug #24660)
          await tx.$executeRawUnsafe(
            `SET LOCAL search_path TO "${env.DATABASE_SCHEMA}";`,
          );

          if (options.organization?.id) {
            await tx.$executeRawUnsafe(
              `SET LOCAL app.current_organization_id = '${options.organization.id}';`,
            );
          }

          return await fn(tx);
        });
      },
    },
  });
}
