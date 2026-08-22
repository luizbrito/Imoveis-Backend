import { describe, it, expect, beforeEach, vi } from 'vitest';
import { testPrismaClient } from '../../../test/testPrismaClient';
import { createTestUserWithOrganization } from '../../../test/testFactories';
import { createAuthenticatedContext } from '../../../test/testUtils';
import { organizationLeaveController } from '../controllers/organizationLeaveController';
import { Error400 } from '../../../shared/errors/Error400';
import { APIError } from 'better-auth';

// Mock Better Auth
vi.mock('../../auth/authBackend', () => ({
  authBackend: {
    api: {
      leaveOrganization: vi.fn(),
    },
  },
}));

import { authBackend } from '../../auth/authBackend';
import { dictionary } from '../../../translation/en/en';

describe('OrganizationLeaveController', () => {
  let prisma: ReturnType<typeof testPrismaClient>;

  beforeEach(() => {
    prisma = testPrismaClient();
    vi.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should allow member to leave organization', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      vi.mocked(authBackend.api.leaveOrganization).mockResolvedValue({} as any);

      const result = await organizationLeaveController(
        { id: organization.id },
        context,
      );

      expect(result).toBe(true);
      expect(authBackend.api.leaveOrganization).toHaveBeenCalledWith({
        body: {
          organizationId: organization.id,
        },
        headers: context.headers,
      });
    });
  });

  describe('Better Auth Integration', () => {
    it('should handle APIError from Better Auth (last admin)', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization({}, {}, { role: 'admin' });
      const context = createAuthenticatedContext(user, organization, member);

      const apiError = new APIError({
        body: {
          code: 'CANNOT_LEAVE_LAST_ADMIN',
          message: 'Cannot leave as the last admin',
        },
      } as any);

      vi.mocked(authBackend.api.leaveOrganization).mockRejectedValue(apiError);

      await expect(
        organizationLeaveController({ id: organization.id }, context),
      ).rejects.toThrow(Error400);
    });

    it('should handle null response from Better Auth', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      vi.mocked(authBackend.api.leaveOrganization).mockResolvedValue(
        null as any,
      );

      await expect(
        organizationLeaveController({ id: organization.id }, context),
      ).rejects.toThrow(dictionary.organization.errors.leaveFailed);
    });
  });
});
