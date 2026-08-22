import { describe, it, expect, beforeEach } from 'vitest';
import { testPrismaClient } from '../../../test/testPrismaClient';
import { createTestUserWithOrganization } from '../../../test/testFactories';
import { createAuthenticatedContext } from '../../../test/testUtils';
import { invitationFindManyController } from '../controllers/invitationFindManyController';

describe('InvitationFindManyController', () => {
  let prisma: ReturnType<typeof testPrismaClient>;

  beforeEach(() => {
    prisma = testPrismaClient();
  });

  describe('Success Cases', () => {
    it('should return all invitations in organization', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      // Create invitations
      await prisma.invitation.create({
        data: {
          email: `many1-${Date.now()}@example.com`,
          role: 'member',
          status: 'pending',
          organizationId: organization.id,
          inviterId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      await prisma.invitation.create({
        data: {
          email: `many2-${Date.now()}@example.com`,
          role: 'admin',
          status: 'pending',
          organizationId: organization.id,
          inviterId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      const result = await invitationFindManyController({}, context);

      expect(result.invitations).toBeDefined();
      expect(result.count).toBeGreaterThanOrEqual(2);
      expect(result.invitations.length).toBe(result.count);
    });

    it('should filter by email', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const timestamp = Date.now();
      const searchEmail = `filterme-${timestamp}@example.com`;

      await prisma.invitation.create({
        data: {
          email: searchEmail,
          role: 'member',
          status: 'pending',
          organizationId: organization.id,
          inviterId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      const result = await invitationFindManyController(
        {
          filter: { email: `filterme-${timestamp}` },
        },
        context,
      );

      expect(result.invitations.length).toBeGreaterThan(0);
      expect(result.invitations[0].email).toContain(`filterme-${timestamp}`);
    });

    it('should filter by role', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      await prisma.invitation.create({
        data: {
          email: `admin-filter-${Date.now()}@example.com`,
          role: 'admin',
          status: 'pending',
          organizationId: organization.id,
          inviterId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      const result = await invitationFindManyController(
        {
          filter: { roles: ['admin'] },
        },
        context,
      );

      expect(result.invitations.length).toBeGreaterThan(0);
      expect(result.invitations.every((inv) => inv.role === 'admin')).toBe(
        true,
      );
    });

    it('should filter by status', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      await prisma.invitation.create({
        data: {
          email: `accepted-${Date.now()}@example.com`,
          role: 'member',
          status: 'accepted',
          organizationId: organization.id,
          inviterId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      const result = await invitationFindManyController(
        {
          filter: { statuses: ['accepted'] },
        },
        context,
      );

      expect(result.invitations.length).toBeGreaterThan(0);
      expect(result.invitations.every((inv) => inv.status === 'accepted')).toBe(
        true,
      );
    });

    it('should support pagination', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      // Create 5 invitations
      for (let i = 0; i < 5; i++) {
        await prisma.invitation.create({
          data: {
            email: `page-${Date.now()}-${i}@example.com`,
            role: 'member',
            status: 'pending',
            organizationId: organization.id,
            inviterId: user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      }

      const result = await invitationFindManyController(
        {
          skip: 1,
          take: 2,
        },
        context,
      );

      expect(result.invitations.length).toBe(2);
      expect(result.count).toBeGreaterThanOrEqual(5);
    });

    it('should mark expired invitations', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      // Create expired invitation
      await prisma.invitation.create({
        data: {
          email: `expired-${Date.now()}@example.com`,
          role: 'member',
          status: 'pending',
          organizationId: organization.id,
          inviterId: user.id,
          expiresAt: new Date(Date.now() - 1000), // Expired
        },
      });

      const result = await invitationFindManyController({}, context);

      const expiredInvitation = result.invitations.find(
        (inv) => inv.status === 'expired',
      );
      expect(expiredInvitation).toBeDefined();
    });
  });

  describe('Multi-Tenancy', () => {
    it('should only return invitations from current organization', async () => {
      const setup1 = await createTestUserWithOrganization();
      const setup2 = await createTestUserWithOrganization();

      const context1 = createAuthenticatedContext(
        setup1.user,
        setup1.organization,
        setup1.member,
      );

      // Create invitation in org1
      await prisma.invitation.create({
        data: {
          email: `org1-${Date.now()}@example.com`,
          role: 'member',
          status: 'pending',
          organizationId: setup1.organization.id,
          inviterId: setup1.user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      // Create invitation in org2
      await prisma.invitation.create({
        data: {
          email: `org2-${Date.now()}@example.com`,
          role: 'member',
          status: 'pending',
          organizationId: setup2.organization.id,
          inviterId: setup2.user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      const result = await invitationFindManyController({}, context1);

      const orgIds = result.invitations.map((inv) => inv.organizationId);
      expect(orgIds.every((id) => id === setup1.organization.id)).toBe(true);
      expect(orgIds.includes(setup2.organization.id)).toBe(false);
    });
  });
});
