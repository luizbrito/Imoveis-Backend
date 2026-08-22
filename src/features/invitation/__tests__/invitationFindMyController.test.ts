import { describe, it, expect, beforeEach, vi } from 'vitest';
import { testPrismaClient } from '../../../test/testPrismaClient';
import { createTestUserWithOrganization } from '../../../test/testFactories';
import { createAuthenticatedContext } from '../../../test/testUtils';
import { invitationFindMyController } from '../controllers/invitationFindMyController';
import { Error400 } from '../../../shared/errors/Error400';
import { APIError } from 'better-auth';

// Mock Better Auth
vi.mock('../../auth/authBackend', () => ({
  authBackend: {
    api: {
      listUserInvitations: vi.fn(),
    },
  },
}));

import { authBackend } from '../../auth/authBackend';

describe('InvitationFindMyController', () => {
  let prisma: ReturnType<typeof testPrismaClient>;

  beforeEach(() => {
    prisma = testPrismaClient();
    vi.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should return user invitations', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const mockInvitations = [
        {
          id: '550e8400-e29b-41d4-a716-446655440010',
          email: user.email,
          role: 'member' as const,
          status: 'pending' as const,
          organizationId: '550e8400-e29b-41d4-a716-446655440020',
          inviterId: '550e8400-e29b-41d4-a716-446655440030',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
        },
      ];

      vi.mocked(authBackend.api.listUserInvitations).mockResolvedValue(
        mockInvitations,
      );

      const result = await invitationFindMyController(context);

      expect(result.invitations).toBeDefined();
      expect(authBackend.api.listUserInvitations).toHaveBeenCalledWith({
        headers: context.headers,
      });
    });

    it('should filter out expired invitations', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const mockInvitations = [
        {
          id: '550e8400-e29b-41d4-a716-446655440040',
          email: user.email,
          role: 'member' as const,
          status: 'pending' as const,
          organizationId: '550e8400-e29b-41d4-a716-446655440050',
          inviterId: '550e8400-e29b-41d4-a716-446655440060',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Future
          createdAt: new Date(),
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440070',
          email: user.email,
          role: 'admin' as const,
          status: 'pending' as const,
          organizationId: '550e8400-e29b-41d4-a716-446655440080',
          inviterId: '550e8400-e29b-41d4-a716-446655440090',
          expiresAt: new Date(Date.now() - 1000), // Past
          createdAt: new Date(),
        },
      ];

      vi.mocked(authBackend.api.listUserInvitations).mockResolvedValue(
        mockInvitations,
      );

      const result = await invitationFindMyController(context);

      // Should only include the valid (non-expired) invitation
      expect(result.invitations.length).toBe(1);
      expect(result.invitations[0].id).toBe(
        '550e8400-e29b-41d4-a716-446655440040',
      );
    });

    it('should filter out invitations for organizations user is already member of', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const mockInvitations = [
        {
          id: '550e8400-e29b-41d4-a716-446655440100',
          email: user.email,
          role: 'admin' as const,
          status: 'pending' as const,
          organizationId: organization.id, // Same org as current member
          inviterId: '550e8400-e29b-41d4-a716-446655440110',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440120',
          email: user.email,
          role: 'member' as const,
          status: 'pending' as const,
          organizationId: '550e8400-e29b-41d4-a716-446655440130', // Different org
          inviterId: '550e8400-e29b-41d4-a716-446655440140',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
        },
      ];

      vi.mocked(authBackend.api.listUserInvitations).mockResolvedValue(
        mockInvitations,
      );

      const result = await invitationFindMyController(context);

      // Should only include invitation for org user is not member of
      expect(result.invitations.length).toBe(1);
      expect(result.invitations[0].id).toBe(
        '550e8400-e29b-41d4-a716-446655440120',
      );
    });

    it('should filter by email case-insensitively', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization({
          email: 'Test@Example.com',
        });
      const context = createAuthenticatedContext(user, organization, member);

      const mockInvitations = [
        {
          id: '550e8400-e29b-41d4-a716-446655440150',
          email: 'test@example.com', // Lowercase
          role: 'member' as const,
          status: 'pending' as const,
          organizationId: '550e8400-e29b-41d4-a716-446655440160',
          inviterId: '550e8400-e29b-41d4-a716-446655440170',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440180',
          email: 'different@example.com',
          role: 'member' as const,
          status: 'pending' as const,
          organizationId: '550e8400-e29b-41d4-a716-446655440190',
          inviterId: '550e8400-e29b-41d4-a716-446655440200',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
        },
      ];

      vi.mocked(authBackend.api.listUserInvitations).mockResolvedValue(
        mockInvitations,
      );

      const result = await invitationFindMyController(context);

      // Should match case-insensitively
      expect(result.invitations.length).toBe(1);
      expect(result.invitations[0].id).toBe(
        '550e8400-e29b-41d4-a716-446655440150',
      );
    });

    it('should filter out non-pending invitations', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const mockInvitations = [
        {
          id: '550e8400-e29b-41d4-a716-446655440210',
          email: user.email,
          role: 'member' as const,
          status: 'pending' as const,
          organizationId: '550e8400-e29b-41d4-a716-446655440220',
          inviterId: '550e8400-e29b-41d4-a716-446655440230',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440240',
          email: user.email,
          role: 'member' as const,
          status: 'accepted' as const,
          organizationId: '550e8400-e29b-41d4-a716-446655440250',
          inviterId: '550e8400-e29b-41d4-a716-446655440260',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440270',
          email: user.email,
          role: 'member' as const,
          status: 'rejected' as const,
          organizationId: '550e8400-e29b-41d4-a716-446655440280',
          inviterId: '550e8400-e29b-41d4-a716-446655440290',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
        },
      ];

      vi.mocked(authBackend.api.listUserInvitations).mockResolvedValue(
        mockInvitations,
      );

      const result = await invitationFindMyController(context);

      // Should only include pending invitation
      expect(result.invitations.length).toBe(1);
      expect(result.invitations[0].status).toBe('pending');
    });

    it('should return empty array for unauthenticated user', async () => {
      const context = {
        currentUser: null,
        headers: new Headers(),
      } as any;

      const result = await invitationFindMyController(context);

      expect(result.invitations).toEqual([]);
    });

    it('should enrich invitations with organization names', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      // Create another organization for invitation
      const otherOrg = await prisma.organization.create({
        data: {
          name: 'Other Organization',
          slug: `other-org-${Date.now()}`,
        },
      });

      const mockInvitations = [
        {
          id: '550e8400-e29b-41d4-a716-446655440300',
          email: user.email,
          role: 'member' as const,
          status: 'pending' as const,
          organizationId: otherOrg.id,
          inviterId: '550e8400-e29b-41d4-a716-446655440310',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
        },
      ];

      vi.mocked(authBackend.api.listUserInvitations).mockResolvedValue(
        mockInvitations,
      );

      const result = await invitationFindMyController(context);

      expect(result.invitations.length).toBe(1);
      expect(result.invitations[0].organization).toBeDefined();
      expect(result.invitations[0].organization.name).toBe(
        'Other Organization',
      );
    });
  });

  describe('Better Auth Integration', () => {
    it('should handle APIError from Better Auth', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const apiError = new APIError({
        body: {
          code: 'UNAUTHORIZED',
          message: 'Unauthorized',
        },
      } as any);

      vi.mocked(authBackend.api.listUserInvitations).mockRejectedValue(
        apiError,
      );

      await expect(invitationFindMyController(context)).rejects.toThrow(
        Error400,
      );
    });
  });
});
