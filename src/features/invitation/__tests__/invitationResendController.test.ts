import { describe, it, expect, beforeEach, vi } from 'vitest';
import { testPrismaClient } from '../../../test/testPrismaClient';
import { createTestUserWithOrganization } from '../../../test/testFactories';
import {
  createAuthenticatedContext,
  mockBetterAuthInvitation,
} from '../../../test/testUtils';
import { invitationResendController } from '../controllers/invitationResendController';
import { Error400 } from '../../../shared/errors/Error400';
import { Error404 } from '../../../shared/errors/Error404';
import { APIError } from 'better-auth';

// Mock Better Auth
vi.mock('../../auth/authBackend', () => ({
  authBackend: {
    api: {
      createInvitation: vi.fn(),
    },
  },
}));

import { authBackend } from '../../auth/authBackend';

describe('InvitationResendController', () => {
  let prisma: ReturnType<typeof testPrismaClient>;

  beforeEach(() => {
    prisma = testPrismaClient();
    vi.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should resend invitation', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      // Create an invitation in the database
      const invitation = await prisma.invitation.create({
        data: {
          email: `resend-${Date.now()}@example.com`,
          role: 'member',
          status: 'pending',
          organizationId: organization.id,
          inviterId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      const mockInvitationResponse = {
        ...mockBetterAuthInvitation(),
        email: invitation.email,
        role: invitation.role as 'member',
      };

      vi.mocked(authBackend.api.createInvitation).mockResolvedValue(
        mockInvitationResponse as any,
      );

      const result = await invitationResendController(
        { id: invitation.id },
        context,
      );

      expect(result).toEqual({ success: true });
      expect(authBackend.api.createInvitation).toHaveBeenCalledWith({
        body: {
          email: invitation.email,
          role: invitation.role,
          organizationId: organization.id,
          resend: true,
        },
        headers: context.headers,
      });
    });

    it('should resend admin invitation', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const invitation = await prisma.invitation.create({
        data: {
          email: `admin-resend-${Date.now()}@example.com`,
          role: 'admin',
          status: 'pending',
          organizationId: organization.id,
          inviterId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      const mockInvitationResponse = {
        ...mockBetterAuthInvitation(),
        email: invitation.email,
        role: 'admin' as const,
      };

      vi.mocked(authBackend.api.createInvitation).mockResolvedValue(
        mockInvitationResponse as any,
      );

      const result = await invitationResendController(
        { id: invitation.id },
        context,
      );

      expect(result).toEqual({ success: true });
      expect(authBackend.api.createInvitation).toHaveBeenCalledWith({
        body: {
          email: invitation.email,
          role: 'admin',
          organizationId: organization.id,
          resend: true,
        },
        headers: context.headers,
      });
    });
  });

  describe('Validation', () => {
    it('should reject non-existent invitation', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      // Must be valid UUID format
      const nonExistentId = '550e8400-e29b-41d4-a716-999999999999';

      await expect(
        invitationResendController({ id: nonExistentId }, context),
      ).rejects.toThrow(Error404);
    });

    it('should reject invitation from different organization', async () => {
      const setup1 = await createTestUserWithOrganization();
      const setup2 = await createTestUserWithOrganization();

      const context2 = createAuthenticatedContext(
        setup2.user,
        setup2.organization,
        setup2.member,
      );

      // Create invitation in org1
      const invitation = await prisma.invitation.create({
        data: {
          email: `cross-org-${Date.now()}@example.com`,
          role: 'member',
          status: 'pending',
          organizationId: setup1.organization.id,
          inviterId: setup1.user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      // Try to resend from org2 context
      await expect(
        invitationResendController({ id: invitation.id }, context2),
      ).rejects.toThrow(Error404);
    });

    it('should require UUID format for invitation ID', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      // Create valid invitation first
      const invitation = await prisma.invitation.create({
        data: {
          email: `uuid-test-${Date.now()}@example.com`,
          role: 'member',
          status: 'pending',
          organizationId: organization.id,
          inviterId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      // Use valid UUID (the actual invitation ID)
      const mockInvitationResponse = mockBetterAuthInvitation();
      vi.mocked(authBackend.api.createInvitation).mockResolvedValue(
        mockInvitationResponse as any,
      );

      const result = await invitationResendController(
        { id: invitation.id },
        context,
      );

      expect(result).toEqual({ success: true });
    });
  });

  describe('Better Auth API Errors', () => {
    it('should handle APIError from Better Auth', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const invitation = await prisma.invitation.create({
        data: {
          email: `error-resend-${Date.now()}@example.com`,
          role: 'member',
          status: 'pending',
          organizationId: organization.id,
          inviterId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      const apiError = new APIError({
        body: {
          code: 'INVITATION_ALREADY_ACCEPTED',
          message: 'Invitation has already been accepted',
        },
      } as any);

      vi.mocked(authBackend.api.createInvitation).mockRejectedValue(apiError);

      await expect(
        invitationResendController({ id: invitation.id }, context),
      ).rejects.toThrow(Error400);
    });

    it('should handle null response from Better Auth', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const invitation = await prisma.invitation.create({
        data: {
          email: `null-resend-${Date.now()}@example.com`,
          role: 'member',
          status: 'pending',
          organizationId: organization.id,
          inviterId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      vi.mocked(authBackend.api.createInvitation).mockResolvedValue(
        null as any,
      );

      await expect(
        invitationResendController({ id: invitation.id }, context),
      ).rejects.toThrow('Failed to resend invitation');
    });
  });

  describe('Multi-Tenancy', () => {
    it('should use correct organization ID', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const invitation = await prisma.invitation.create({
        data: {
          email: `tenant-resend-${Date.now()}@example.com`,
          role: 'member',
          status: 'pending',
          organizationId: organization.id,
          inviterId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      const mockInvitationResponse = mockBetterAuthInvitation();
      vi.mocked(authBackend.api.createInvitation).mockResolvedValue(
        mockInvitationResponse as any,
      );

      await invitationResendController({ id: invitation.id }, context);

      expect(authBackend.api.createInvitation).toHaveBeenCalledWith({
        body: expect.objectContaining({
          organizationId: organization.id,
        }),
        headers: context.headers,
      });
    });
  });
});
