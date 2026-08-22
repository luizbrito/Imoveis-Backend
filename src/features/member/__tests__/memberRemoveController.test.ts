import { describe, it, expect, beforeEach, vi } from 'vitest';
import { testPrismaClient } from '../../../test/testPrismaClient';
import { createTestUserWithOrganization } from '../../../test/testFactories';
import { createAuthenticatedContext } from '../../../test/testUtils';
import { memberRemoveController } from '../controllers/memberRemoveController';
import { Error400 } from '../../../shared/errors/Error400';
import { APIError } from 'better-auth';

// Mock Better Auth
vi.mock('../../auth/authBackend', () => ({
  authBackend: {
    api: {
      removeMember: vi.fn(),
    },
  },
}));

import { authBackend } from '../../auth/authBackend';
import { dictionary } from '../../../translation/en/en';

describe('MemberRemoveController', () => {
  let prisma: ReturnType<typeof testPrismaClient>;

  beforeEach(() => {
    prisma = testPrismaClient();
    vi.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should remove member', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      // Create another member to remove
      const userToRemove = await prisma.user.create({
        data: {
          email: `remove-${Date.now()}@example.com`,
          emailVerified: true,
        },
      });

      const memberToRemove = await prisma.member.create({
        data: {
          userId: userToRemove.id,
          organizationId: organization.id,
          role: 'member',
          fullName: 'To Remove',
        },
      });

      vi.mocked(authBackend.api.removeMember).mockResolvedValue({} as any);

      const result = await memberRemoveController(
        { id: memberToRemove.id },
        context,
      );

      expect(result).toBe(true);
      expect(authBackend.api.removeMember).toHaveBeenCalledWith({
        body: {
          memberIdOrEmail: memberToRemove.id,
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
          code: 'CANNOT_REMOVE_LAST_ADMIN',
          message: 'Cannot remove the last admin',
        },
      } as any);

      vi.mocked(authBackend.api.removeMember).mockRejectedValue(apiError);

      await expect(
        memberRemoveController({ id: member.id }, context),
      ).rejects.toThrow(Error400);
    });

    it('should handle null response from Better Auth', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      vi.mocked(authBackend.api.removeMember).mockResolvedValue(null as any);

      await expect(
        memberRemoveController({ id: member.id }, context),
      ).rejects.toThrow(dictionary.member.errors.removeFailed);
    });
  });

  describe('Multi-Tenancy', () => {
    it('should use correct organization ID', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const memberId = 'member-' + Math.random().toString(36).substring(7);

      vi.mocked(authBackend.api.removeMember).mockResolvedValue({} as any);

      await memberRemoveController({ id: memberId }, context);

      expect(authBackend.api.removeMember).toHaveBeenCalledWith({
        body: {
          memberIdOrEmail: memberId,
          organizationId: organization.id,
        },
        headers: context.headers,
      });
    });
  });
});
