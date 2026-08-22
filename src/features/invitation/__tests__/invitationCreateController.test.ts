import { describe, it, expect, beforeEach, vi } from 'vitest';
import { testPrismaClient } from '../../../test/testPrismaClient';
import { createTestUserWithOrganization } from '../../../test/testFactories';
import {
  createAuthenticatedContext,
  mockBetterAuthInvitation,
} from '../../../test/testUtils';
import { invitationCreateController } from '../controllers/invitationCreateController';
import { Error400 } from '../../../shared/errors/Error400';
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

describe('InvitationCreateController', () => {
  let prisma: ReturnType<typeof testPrismaClient>;

  beforeEach(() => {
    prisma = testPrismaClient();
    vi.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should create invitation with admin role', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const invitationData = {
        email: `invite-admin-${Date.now()}@example.com`,
        role: 'admin' as const,
      };

      const mockInvitation = {
        ...mockBetterAuthInvitation(),
        email: invitationData.email,
        role: invitationData.role,
        organizationId: organization.id,
      };

      vi.mocked(authBackend.api.createInvitation).mockResolvedValue(
        mockInvitation,
      );

      const result = await invitationCreateController(invitationData, context);

      expect(result).toBeDefined();
      expect(result.email).toBe(invitationData.email);
      expect(authBackend.api.createInvitation).toHaveBeenCalledWith({
        body: {
          email: invitationData.email,
          role: invitationData.role,
          organizationId: organization.id,
        },
        headers: context.headers,
      });
    });

    it('should create invitation with member role', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const invitationData = {
        email: `invite-member-${Date.now()}@example.com`,
        role: 'member' as const,
      };

      const mockInvitation = {
        ...mockBetterAuthInvitation(),
        email: invitationData.email,
        role: invitationData.role,
        organizationId: organization.id,
      };

      vi.mocked(authBackend.api.createInvitation).mockResolvedValue(
        mockInvitation,
      );

      const result = await invitationCreateController(invitationData, context);

      expect(result).toBeDefined();
      expect(result.email).toBe(invitationData.email);
    });

    it('should pass headers to Better Auth API', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();

      // Create custom headers
      const headers = new Headers();
      headers.set('x-test-header', 'test-value');

      const context = createAuthenticatedContext(user, organization, member, {
        headers,
      });

      const invitationData = {
        email: `invite-headers-${Date.now()}@example.com`,
        role: 'member' as const,
      };

      const mockInvitation = {
        ...mockBetterAuthInvitation(),
        email: invitationData.email,
      };

      vi.mocked(authBackend.api.createInvitation).mockResolvedValue(
        mockInvitation,
      );

      await invitationCreateController(invitationData, context);

      expect(authBackend.api.createInvitation).toHaveBeenCalledWith({
        body: expect.any(Object),
        headers: headers,
      });
    });
  });

  describe('Validation', () => {
    it('should reject invalid email format', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const invitationData = {
        email: 'invalid-email',
        role: 'member' as const,
      };

      await expect(
        invitationCreateController(invitationData, context),
      ).rejects.toThrow();
    });

    it('should reject missing email', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const invitationData = {
        role: 'member' as const,
      } as any;

      await expect(
        invitationCreateController(invitationData, context),
      ).rejects.toThrow();
    });

    it('should reject missing role', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const invitationData = {
        email: `invite-${Date.now()}@example.com`,
      } as any;

      await expect(
        invitationCreateController(invitationData, context),
      ).rejects.toThrow();
    });

    it('should reject invalid role', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const invitationData = {
        email: `invite-${Date.now()}@example.com`,
        role: 'invalid-role' as any,
      };

      await expect(
        invitationCreateController(invitationData, context),
      ).rejects.toThrow();
    });
  });

  describe('Better Auth API Errors', () => {
    it('should handle APIError from Better Auth', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const invitationData = {
        email: `invite-error-${Date.now()}@example.com`,
        role: 'member' as const,
      };

      const apiError = new APIError({
        body: {
          code: 'INVITATION_ALREADY_EXISTS',
          message: 'Invitation already exists for this email',
        },
      } as any);

      vi.mocked(authBackend.api.createInvitation).mockRejectedValue(apiError);

      await expect(
        invitationCreateController(invitationData, context),
      ).rejects.toThrow(Error400);
    });

    it('should handle null response from Better Auth', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const invitationData = {
        email: `invite-null-${Date.now()}@example.com`,
        role: 'member' as const,
      };

      vi.mocked(authBackend.api.createInvitation).mockResolvedValue(
        null as any,
      );

      await expect(
        invitationCreateController(invitationData, context),
      ).rejects.toThrow('Failed to create invitation');
    });

    it('should handle generic errors from Better Auth', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const invitationData = {
        email: `invite-generic-${Date.now()}@example.com`,
        role: 'member' as const,
      };

      vi.mocked(authBackend.api.createInvitation).mockRejectedValue(
        new Error('Generic error'),
      );

      await expect(
        invitationCreateController(invitationData, context),
      ).rejects.toThrow('Generic error');
    });
  });

  describe('Multi-Tenancy', () => {
    it('should use correct organization ID from context', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const invitationData = {
        email: `invite-org-${Date.now()}@example.com`,
        role: 'member' as const,
      };

      const mockInvitation = mockBetterAuthInvitation();
      vi.mocked(authBackend.api.createInvitation).mockResolvedValue(
        mockInvitation,
      );

      await invitationCreateController(invitationData, context);

      expect(authBackend.api.createInvitation).toHaveBeenCalledWith({
        body: {
          email: invitationData.email,
          role: invitationData.role,
          organizationId: organization.id,
        },
        headers: context.headers,
      });
    });

    it('should create invitations for different organizations independently', async () => {
      const setup1 = await createTestUserWithOrganization();
      const setup2 = await createTestUserWithOrganization();

      const context1 = createAuthenticatedContext(
        setup1.user,
        setup1.organization,
        setup1.member,
      );
      const context2 = createAuthenticatedContext(
        setup2.user,
        setup2.organization,
        setup2.member,
      );

      const email = `invite-shared-${Date.now()}@example.com`;

      const invitationData1 = {
        email,
        role: 'member' as const,
      };

      const invitationData2 = {
        email,
        role: 'admin' as const,
      };

      const mockInvitation1 = {
        ...mockBetterAuthInvitation(),
        organizationId: setup1.organization.id,
      };
      const mockInvitation2 = {
        ...mockBetterAuthInvitation(),
        organizationId: setup2.organization.id,
      };

      vi.mocked(authBackend.api.createInvitation)
        .mockResolvedValueOnce(mockInvitation1)
        .mockResolvedValueOnce(mockInvitation2);

      await invitationCreateController(invitationData1, context1);
      await invitationCreateController(invitationData2, context2);

      expect(authBackend.api.createInvitation).toHaveBeenCalledTimes(2);
      expect(authBackend.api.createInvitation).toHaveBeenNthCalledWith(1, {
        body: expect.objectContaining({
          organizationId: setup1.organization.id,
        }),
        headers: context1.headers,
      });
      expect(authBackend.api.createInvitation).toHaveBeenNthCalledWith(2, {
        body: expect.objectContaining({
          organizationId: setup2.organization.id,
        }),
        headers: context2.headers,
      });
    });
  });
});
