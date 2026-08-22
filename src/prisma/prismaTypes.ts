/**
 * Re-export all Prisma types for use in the frontend
 * This allows the frontend to import types without having direct access to @prisma/client
 *
 * Usage in frontend:
 * import type { Member, User, Organization } from '@project/backend/prisma/prismaTypes';
 */
export type * from './generated/client';
