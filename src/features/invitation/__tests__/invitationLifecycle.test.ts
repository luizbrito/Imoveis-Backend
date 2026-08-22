import { describe, it, expect, beforeEach, vi } from 'vitest';
import { testPrismaClient } from '../../../test/testPrismaClient';
import { createTestUserWithOrganization } from '../../../test/testFactories';
import { createAuthenticatedContext } from '../../../test/testUtils';
import { invitationAcceptController } from '../controllers/invitationAcceptController';
import { invitationRejectController } from '../controllers/invitationRejectController';
import { invitationCancelController } from '../controllers/invitationCancelController';
import { Error400 } from '../../../shared/errors/Error400';
import { Error403 } from '../../../shared/errors/Error403';
import { APIError } from 'better-auth';

// Mock Better Auth
vi.mock('../../auth/authBackend', () => ({
  authBackend: {
    api: {
      acceptInvitation: vi.fn(),
      rejectInvitation: vi.fn(),
      cancelInvitation: vi.fn(),
      setActiveOrganization: vi.fn(),
    },
  },
}));

import { authBackend } from '../../auth/authBackend';
import { dictionary } from '../../../translation/en/en';

describe('Invitation Lifecycle Controllers', () => {
  let prisma: ReturnType<typeof testPrismaClient>;

  beforeEach(() => {
    prisma = testPrismaClient();
    vi.clearAllMocks();
  });

  describe('InvitationAcceptController', () => {
    describe('Success Cases', () => {
      it('should accept invitation and create member', async () => {
        const { user, organization, member } =
          await createTestUserWithOrganization();
        const context = createAuthenticatedContext(user, organization, member);

        const invitationId = `inv-${Date.now()}`;

        const mockResponse = {
          member: {
            id: 'member-' + Math.random().toString(36).substring(7),
            userId: user.id,
            organizationId: organization.id,
            role: 'member',
          },
          invitation: {
            id: invitationId,
            organizationId: organization.id,
            email: 'test@example.com',
            role: 'member' as const,
            status: 'accepted' as const,
            inviterId: user.id,
            expiresAt: new Date(),
          },
        } as any;

        vi.mocked(authBackend.api.acceptInvitation).mockResolvedValue(
          mockResponse,
        );
        vi.mocked(authBackend.api.setActiveOrganization).mockResolvedValue(
          {} as any,
        );

        const result = await invitationAcceptController(
          { id: invitationId },
          context,
        );

        expect(result).toBeDefined();
        expect(authBackend.api.acceptInvitation).toHaveBeenCalledWith({
          body: {
            invitationId,
          },
          headers: context.headers,
        });
      });

      it('should set active organization after accepting', async () => {
        const { user, organization, member } =
          await createTestUserWithOrganization();
        const context = createAuthenticatedContext(user, organization, member);

        const invitationId = `inv-${Date.now()}`;
        const newOrgId = 'org-' + Math.random().toString(36).substring(7);

        const mockResponse = {
          member: {
            id: 'member-' + Math.random().toString(36).substring(7),
            userId: user.id,
            organizationId: newOrgId,
            role: 'member',
          },
          invitation: {
            id: invitationId,
            organizationId: newOrgId,
            email: 'test@example.com',
            role: 'member' as const,
            status: 'accepted' as const,
            inviterId: user.id,
            expiresAt: new Date(),
          },
        } as any;

        vi.mocked(authBackend.api.acceptInvitation).mockResolvedValue(
          mockResponse,
        );
        vi.mocked(authBackend.api.setActiveOrganization).mockResolvedValue(
          {} as any,
        );

        await invitationAcceptController({ id: invitationId }, context);

        expect(authBackend.api.setActiveOrganization).toHaveBeenCalledWith({
          body: {
            organizationId: newOrgId,
          },
          headers: context.headers,
        });
      });

      it('should return success if user is already an active member', async () => {
        const { user, organization, member } =
          await createTestUserWithOrganization();
        const context = createAuthenticatedContext(user, organization, member);

        // Create an invitation for the same organization
        const invitation = await prisma.invitation.create({
          data: {
            email: user.email,
            organizationId: organization.id,
            inviterId: user.id,
            role: 'member',
            status: 'pending',
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
          },
        });

        vi.mocked(authBackend.api.setActiveOrganization).mockResolvedValue(
          {} as any,
        );

        const result = await invitationAcceptController(
          { id: invitation.id },
          context,
        );

        expect(result).toBeDefined();
        expect(result.member).toBeDefined();
        expect(result.member.id).toBe(member.id);
        expect(result.invitation).toBeDefined();

        // Should not call Better Auth acceptInvitation since user is already a member
        expect(authBackend.api.acceptInvitation).not.toHaveBeenCalled();

        // Should set active organization to the invitation's org
        expect(authBackend.api.setActiveOrganization).toHaveBeenCalledWith({
          body: {
            organizationId: organization.id,
          },
          headers: context.headers,
        });
      });
    });

    describe('Validation', () => {
      it('should reject missing invitation ID', async () => {
        const { user, organization, member } =
          await createTestUserWithOrganization();
        const context = createAuthenticatedContext(user, organization, member);

        await expect(invitationAcceptController({}, context)).rejects.toThrow();
      });

      it('should reject unauthenticated request', async () => {
        const context = {
          currentUser: null,
          headers: new Headers(),
        } as any;

        await expect(
          invitationAcceptController({ id: 'inv-123' }, context),
        ).rejects.toThrow(Error403);
      });
    });

    describe('Better Auth API Errors', () => {
      it('should handle APIError from Better Auth', async () => {
        const { user, organization, member } =
          await createTestUserWithOrganization();
        const context = createAuthenticatedContext(user, organization, member);

        const invitationId = `inv-${Date.now()}`;

        const apiError = new APIError({
          body: {
            code: 'INVITATION_EXPIRED',
            message: 'Invitation has expired',
          },
        } as any);

        vi.mocked(authBackend.api.acceptInvitation).mockRejectedValue(apiError);

        await expect(
          invitationAcceptController({ id: invitationId }, context),
        ).rejects.toThrow(Error400);
      });

      it('should handle null response from Better Auth', async () => {
        const { user, organization, member } =
          await createTestUserWithOrganization();
        const context = createAuthenticatedContext(user, organization, member);

        const invitationId = `inv-${Date.now()}`;

        vi.mocked(authBackend.api.acceptInvitation).mockResolvedValue(
          null as any,
        );

        await expect(
          invitationAcceptController({ id: invitationId }, context),
        ).rejects.toThrow(dictionary.invitation.errors.acceptFailed);
      });
    });
  });

  describe('InvitationRejectController', () => {
    describe('Success Cases', () => {
      it('should reject invitation', async () => {
        const { user, organization, member } =
          await createTestUserWithOrganization();
        const context = createAuthenticatedContext(user, organization, member);

        const invitationId = `inv-${Date.now()}`;

        const mockResponse = {
          invitation: {
            id: invitationId,
            organizationId: organization.id,
            email: 'test@example.com',
            role: 'member' as const,
            status: 'rejected' as const,
            inviterId: user.id,
            expiresAt: new Date(),
          },
          member: null,
        } as any;

        vi.mocked(authBackend.api.rejectInvitation).mockResolvedValue(
          mockResponse,
        );

        const result = await invitationRejectController(
          { id: invitationId },
          context,
        );

        expect(result).toBe(true);
        expect(authBackend.api.rejectInvitation).toHaveBeenCalledWith({
          body: {
            invitationId,
          },
          headers: context.headers,
        });
      });

      it('should allow rejecting multiple invitations', async () => {
        const { user, organization, member } =
          await createTestUserWithOrganization();
        const context = createAuthenticatedContext(user, organization, member);

        const invitationId1 = `inv-1-${Date.now()}`;
        const invitationId2 = `inv-2-${Date.now()}`;

        vi.mocked(authBackend.api.rejectInvitation)
          .mockResolvedValueOnce({
            invitation: {
              id: invitationId1,
              organizationId: organization.id,
              email: 'test@example.com',
              role: 'member' as const,
              status: 'rejected' as const,
              inviterId: user.id,
              expiresAt: new Date(),
            },
            member: null,
          } as any)
          .mockResolvedValueOnce({
            invitation: {
              id: invitationId2,
              organizationId: organization.id,
              email: 'test@example.com',
              role: 'member' as const,
              status: 'rejected' as const,
              inviterId: user.id,
              expiresAt: new Date(),
            },
            member: null,
          } as any);

        const result1 = await invitationRejectController(
          { id: invitationId1 },
          context,
        );
        const result2 = await invitationRejectController(
          { id: invitationId2 },
          context,
        );

        expect(result1).toBe(true);
        expect(result2).toBe(true);
        expect(authBackend.api.rejectInvitation).toHaveBeenCalledTimes(2);
      });
    });

    describe('Validation', () => {
      it('should reject missing invitation ID', async () => {
        const { user, organization, member } =
          await createTestUserWithOrganization();
        const context = createAuthenticatedContext(user, organization, member);

        await expect(invitationRejectController({}, context)).rejects.toThrow();
      });

      it('should reject unauthenticated request', async () => {
        const context = {
          currentUser: null,
          headers: new Headers(),
        } as any;

        await expect(
          invitationRejectController({ id: 'inv-123' }, context),
        ).rejects.toThrow(Error403);
      });
    });

    describe('Better Auth API Errors', () => {
      it('should handle APIError from Better Auth', async () => {
        const { user, organization, member } =
          await createTestUserWithOrganization();
        const context = createAuthenticatedContext(user, organization, member);

        const invitationId = `inv-${Date.now()}`;

        const apiError = new APIError({
          body: {
            code: 'INVITATION_NOT_FOUND',
            message: 'Invitation not found',
          },
        } as any);

        vi.mocked(authBackend.api.rejectInvitation).mockRejectedValue(apiError);

        await expect(
          invitationRejectController({ id: invitationId }, context),
        ).rejects.toThrow(Error400);
      });

      it('should handle null response from Better Auth', async () => {
        const { user, organization, member } =
          await createTestUserWithOrganization();
        const context = createAuthenticatedContext(user, organization, member);

        const invitationId = `inv-${Date.now()}`;

        vi.mocked(authBackend.api.rejectInvitation).mockResolvedValue(
          null as any,
        );

        await expect(
          invitationRejectController({ id: invitationId }, context),
        ).rejects.toThrow(dictionary.invitation.errors.rejectFailed);
      });
    });
  });

  describe('InvitationCancelController', () => {
    describe('Success Cases', () => {
      it('should cancel invitation', async () => {
        const { user, organization, member } =
          await createTestUserWithOrganization();
        const context = createAuthenticatedContext(user, organization, member);

        // Cancel requires UUID format
        const invitationId = '550e8400-e29b-41d4-a716-446655440000';

        const mockResponse = {
          id: invitationId,
          organizationId: organization.id,
          email: 'test@example.com',
          role: 'member' as const,
          status: 'canceled' as const,
          inviterId: user.id,
          expiresAt: new Date(),
        } as any;

        vi.mocked(authBackend.api.cancelInvitation).mockResolvedValue(
          mockResponse,
        );

        const result = await invitationCancelController(
          { id: invitationId },
          context,
        );

        expect(result).toEqual({ success: true });
        expect(authBackend.api.cancelInvitation).toHaveBeenCalledWith({
          body: {
            invitationId,
          },
          headers: context.headers,
        });
      });

      it('should allow admin to cancel invitations', async () => {
        const { user, organization, member } =
          await createTestUserWithOrganization({}, {}, { role: 'admin' });
        const context = createAuthenticatedContext(user, organization, member);

        // Cancel requires UUID format
        const invitationId = '550e8400-e29b-41d4-a716-446655440001';

        vi.mocked(authBackend.api.cancelInvitation).mockResolvedValue({
          id: invitationId,
          organizationId: organization.id,
          email: 'test@example.com',
          role: 'admin' as const,
          status: 'canceled' as const,
          inviterId: user.id,
          expiresAt: new Date(),
        } as any);

        const result = await invitationCancelController(
          { id: invitationId },
          context,
        );

        expect(result).toEqual({ success: true });
      });
    });

    describe('Validation', () => {
      it('should reject missing invitation ID', async () => {
        const { user, organization, member } =
          await createTestUserWithOrganization();
        const context = createAuthenticatedContext(user, organization, member);

        await expect(invitationCancelController({}, context)).rejects.toThrow();
      });
    });

    describe('Better Auth API Errors', () => {
      it('should handle APIError from Better Auth', async () => {
        const { user, organization, member } =
          await createTestUserWithOrganization();
        const context = createAuthenticatedContext(user, organization, member);

        // Cancel requires UUID format
        const invitationId = '550e8400-e29b-41d4-a716-446655440002';

        const apiError = new APIError({
          body: {
            code: 'INVITATION_ALREADY_ACCEPTED',
            message: 'Invitation has already been accepted',
          },
        } as any);

        vi.mocked(authBackend.api.cancelInvitation).mockRejectedValue(apiError);

        await expect(
          invitationCancelController({ id: invitationId }, context),
        ).rejects.toThrow(Error400);
      });

      it('should handle null response from Better Auth', async () => {
        const { user, organization, member } =
          await createTestUserWithOrganization();
        const context = createAuthenticatedContext(user, organization, member);

        // Cancel requires UUID format
        const invitationId = '550e8400-e29b-41d4-a716-446655440003';

        vi.mocked(authBackend.api.cancelInvitation).mockResolvedValue(
          null as any,
        );

        await expect(
          invitationCancelController({ id: invitationId }, context),
        ).rejects.toThrow(dictionary.invitation.errors.cancelFailed);
      });
    });
  });
});
