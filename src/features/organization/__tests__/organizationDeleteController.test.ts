import { describe, it, expect, beforeEach, vi } from 'vitest';
import { testPrismaClient } from '../../../test/testPrismaClient';
import { createTestUserWithOrganization } from '../../../test/testFactories';
import { createAuthenticatedContext } from '../../../test/testUtils';
import { organizationDeleteController } from '../controllers/organizationDeleteController';
import { Error400 } from '../../../shared/errors/Error400';
import { APIError } from 'better-auth';

// Mock Better Auth
vi.mock('../../auth/authBackend', () => ({
  authBackend: {
    api: {
      deleteOrganization: vi.fn(),
    },
  },
}));

import { authBackend } from '../../auth/authBackend';
import { dictionary } from '../../../translation/en/en';

describe('OrganizationDeleteController', () => {
  let prisma: ReturnType<typeof testPrismaClient>;

  beforeEach(() => {
    prisma = testPrismaClient();
    vi.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should delete organization', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      vi.mocked(authBackend.api.deleteOrganization).mockResolvedValue(
        {} as any,
      );

      const result = await organizationDeleteController(
        { id: organization.id },
        context,
      );

      expect(result).toBe(true);
      expect(authBackend.api.deleteOrganization).toHaveBeenCalledWith({
        body: {
          organizationId: organization.id,
        },
        headers: context.headers,
      });
    });
  });

  describe('Better Auth Integration', () => {
    it('should handle APIError from Better Auth', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const apiError = new APIError({
        body: {
          code: 'CANNOT_DELETE_ORGANIZATION',
          message: 'Cannot delete organization',
        },
      } as any);

      vi.mocked(authBackend.api.deleteOrganization).mockRejectedValue(apiError);

      await expect(
        organizationDeleteController({ id: organization.id }, context),
      ).rejects.toThrow(Error400);
    });

    it('should handle null response from Better Auth', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      vi.mocked(authBackend.api.deleteOrganization).mockResolvedValue(
        null as any,
      );

      await expect(
        organizationDeleteController({ id: organization.id }, context),
      ).rejects.toThrow(dictionary.organization.errors.deleteFailed);
    });
  });
});
