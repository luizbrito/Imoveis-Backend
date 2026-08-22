import { describe, it, expect, beforeEach } from 'vitest';
import { testPrismaClient } from '../../../test/testPrismaClient';
import { createTestUserWithOrganization } from '../../../test/testFactories';
import { createAuthenticatedContext } from '../../../test/testUtils';
import { invitationFindController } from '../controllers/invitationFindController';

describe('InvitationFindController', () => {
  let prisma: ReturnType<typeof testPrismaClient>;

  beforeEach(() => {
    prisma = testPrismaClient();
  });

  it('should find invitation by ID', async () => {
    const { user, organization, member } =
      await createTestUserWithOrganization();
    const context = createAuthenticatedContext(user, organization, member);

    const invitation = await prisma.invitation.create({
      data: {
        email: `find-${Date.now()}@example.com`,
        role: 'member',
        status: 'pending',
        organizationId: organization.id,
        inviterId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const result = await invitationFindController(
      { id: invitation.id },
      context,
    );

    expect(result).toBeDefined();
    expect(result?.id).toBe(invitation.id);
    expect(result?.email).toBe(invitation.email);
    expect(result?.organizationId).toBe(organization.id);
  });

  it('should include organization relationship', async () => {
    const { user, organization, member } =
      await createTestUserWithOrganization();
    const context = createAuthenticatedContext(user, organization, member);

    const invitation = await prisma.invitation.create({
      data: {
        email: `org-${Date.now()}@example.com`,
        role: 'member',
        status: 'pending',
        organizationId: organization.id,
        inviterId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const result = await invitationFindController(
      { id: invitation.id },
      context,
    );

    expect(result?.organization).toBeDefined();
    expect(result?.organization?.id).toBe(organization.id);
  });

  it('should include inviter information', async () => {
    const { user, organization, member } =
      await createTestUserWithOrganization();
    const context = createAuthenticatedContext(user, organization, member);

    const invitation = await prisma.invitation.create({
      data: {
        email: `inviter-${Date.now()}@example.com`,
        role: 'member',
        status: 'pending',
        organizationId: organization.id,
        inviterId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const result = await invitationFindController(
      { id: invitation.id },
      context,
    );

    expect(result?.inviter).toBeDefined();
    expect(result?.inviter?.id).toBe(user.id);
    expect(result?.inviter?.email).toBe(user.email);
  });

  it('should return null for non-existent invitation', async () => {
    const { user, organization, member } =
      await createTestUserWithOrganization();
    const context = createAuthenticatedContext(user, organization, member);

    // Must be valid UUID
    const nonExistentId = '550e8400-e29b-41d4-a716-999999999999';

    const result = await invitationFindController(
      { id: nonExistentId },
      context,
    );

    expect(result).toBeNull();
  });

  it('should enforce organization isolation', async () => {
    const setup1 = await createTestUserWithOrganization();
    const setup2 = await createTestUserWithOrganization();

    const context2 = createAuthenticatedContext(
      setup2.user,
      setup2.organization,
      setup2.member,
    );

    // Create invitation in org1
    const invitation = await testPrismaClient().invitation.create({
      data: {
        email: `iso-${Date.now()}@example.com`,
        role: 'member',
        status: 'pending',
        organizationId: setup1.organization.id,
        inviterId: setup1.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Try to access from org2
    const result = await invitationFindController(
      { id: invitation.id },
      context2,
    );

    expect(result).toBeNull();
  });
});
