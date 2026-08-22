import { describe, it, expect, beforeEach, vi } from 'vitest';
import { testPrismaClient } from '../../../test/testPrismaClient';
import { createTestUserWithOrganization } from '../../../test/testFactories';
import { createAuthenticatedContext } from '../../../test/testUtils';
import { organizationSetActiveController } from '../controllers/organizationSetActiveController';
import { Error400 } from '../../../shared/errors/Error400';
import { Error403 } from '../../../shared/errors/Error403';
import { APIError } from 'better-auth';

// Mock Better Auth
vi.mock('../../auth/authBackend', () => ({
  authBackend: {
    api: {
      setActiveOrganization: vi.fn(),
      acceptInvitation: vi.fn(),
      addMember: vi.fn(),
    },
  },
}));

import { authBackend } from '../../auth/authBackend';
import { dictionary } from '../../../translation/en/en';

describe('OrganizationSetActiveController', () => {
  let prisma: ReturnType<typeof testPrismaClient>;

  beforeEach(() => {
    prisma = testPrismaClient();
    vi.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should set active organization', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      // Create another organization
      const org2 = await prisma.organization.create({
        data: {
          name: 'Second Organization',
          slug: `second-org-${Date.now()}`,
        },
      });

      // Create member in second organization
      await prisma.member.create({
        data: {
          userId: user.id,
          organizationId: org2.id,
          role: 'member',
        },
      });

      vi.mocked(authBackend.api.setActiveOrganization).mockResolvedValue(
        {} as any,
      );

      const result = await organizationSetActiveController(
        { id: org2.id },
        context,
      );

      expect(result).toBe(true);
      expect(authBackend.api.setActiveOrganization).toHaveBeenCalledWith({
        body: {
          organizationId: org2.id,
        },
        headers: context.headers,
      });
    });

    it('should auto-accept pending invitation when switching to non-member organization', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      // Create another organization
      const org2 = await prisma.organization.create({
        data: {
          name: 'Invited Organization',
          slug: `invited-org-${Date.now()}`,
        },
      });

      // Create pending invitation for user
      const invitation = await prisma.invitation.create({
        data: {
          email: user.email,
          organizationId: org2.id,
          inviterId: user.id,
          role: 'member',
          status: 'pending',
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        },
      });

      vi.mocked(authBackend.api.acceptInvitation).mockResolvedValue({
        member: {
          id: 'member-' + Math.random().toString(36).substring(7),
          userId: user.id,
          organizationId: org2.id,
          role: 'member',
        },
        invitation: {
          id: invitation.id,
          organizationId: org2.id,
          email: user.email,
          role: 'member' as const,
          status: 'accepted' as const,
          inviterId: user.id,
          expiresAt: invitation.expiresAt,
        },
      } as any);

      vi.mocked(authBackend.api.setActiveOrganization).mockResolvedValue(
        {} as any,
      );

      const result = await organizationSetActiveController(
        { id: org2.id },
        context,
      );

      expect(result).toBe(true);

      // Should accept invitation
      expect(authBackend.api.acceptInvitation).toHaveBeenCalledWith({
        body: {
          invitationId: invitation.id,
        },
        headers: context.headers,
      });

      // Should set active organization
      expect(authBackend.api.setActiveOrganization).toHaveBeenCalledWith({
        body: {
          organizationId: org2.id,
        },
        headers: context.headers,
      });

      // Should NOT call addMember since invitation was accepted
      expect(authBackend.api.addMember).not.toHaveBeenCalled();
    });

    it('should add user with default role when no invitation exists', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      // Mock env to have default role
      const originalEnv = process.env.ORGANIZATION_DEFAULT_ROLE;
      process.env.ORGANIZATION_DEFAULT_ROLE = 'member';

      try {
        // Create another organization without invitation
        const org2 = await prisma.organization.create({
          data: {
            name: 'Open Organization',
            slug: `open-org-${Date.now()}`,
          },
        });

        vi.mocked(authBackend.api.addMember).mockResolvedValue({} as any);
        vi.mocked(authBackend.api.setActiveOrganization).mockResolvedValue(
          {} as any,
        );

        const result = await organizationSetActiveController(
          { id: org2.id },
          context,
        );

        expect(result).toBe(true);

        // Should add member with default role
        expect(authBackend.api.addMember).toHaveBeenCalledWith({
          body: {
            userId: user.id,
            organizationId: org2.id,
            role: 'member',
          },
          headers: context.headers,
        });

        // Should NOT accept invitation since none exists
        expect(authBackend.api.acceptInvitation).not.toHaveBeenCalled();

        // Should set active organization
        expect(authBackend.api.setActiveOrganization).toHaveBeenCalledWith({
          body: {
            organizationId: org2.id,
          },
          headers: context.headers,
        });
      } finally {
        // Restore original env
        if (originalEnv !== undefined) {
          process.env.ORGANIZATION_DEFAULT_ROLE = originalEnv;
        } else {
          delete process.env.ORGANIZATION_DEFAULT_ROLE;
        }
      }
    });
  });

  describe('Validation', () => {
    it('should reject unauthenticated request', async () => {
      const context = {
        currentUser: null,
        headers: new Headers(),
      } as any;

      await expect(
        organizationSetActiveController(
          { id: '550e8400-e29b-41d4-a716-446655440500' },
          context,
        ),
      ).rejects.toThrow(Error403);
    });
  });

  describe('Better Auth Integration', () => {
    it('should handle APIError from Better Auth', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const apiError = new APIError({
        body: {
          code: 'NOT_MEMBER_OF_ORGANIZATION',
          message: 'Not a member of this organization',
        },
      } as any);

      vi.mocked(authBackend.api.setActiveOrganization).mockRejectedValue(
        apiError,
      );

      await expect(
        organizationSetActiveController({ id: organization.id }, context),
      ).rejects.toThrow(Error400);
    });

    it('should handle null response from Better Auth', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      vi.mocked(authBackend.api.setActiveOrganization).mockResolvedValue(
        null as any,
      );

      await expect(
        organizationSetActiveController({ id: organization.id }, context),
      ).rejects.toThrow(dictionary.organization.errors.setActiveFailed);
    });
  });
});
