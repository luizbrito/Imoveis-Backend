import { describe, it, expect, beforeEach } from 'vitest';
import { testPrismaClient } from '../../../test/testPrismaClient';
import { createTestUserWithOrganization } from '../../../test/testFactories';
import { createAuthenticatedContext } from '../../../test/testUtils';
import { memberFindManyController } from '../controllers/memberFindManyController';

describe('MemberFindManyController', () => {
  let prisma: ReturnType<typeof testPrismaClient>;

  beforeEach(() => {
    prisma = testPrismaClient();
  });

  describe('Success Cases', () => {
    it('should return all members in organization', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      // Create additional members
      const user2 = await prisma.user.create({
        data: {
          email: `user2-${Date.now()}@example.com`,
          emailVerified: true,
        },
      });

      await prisma.member.create({
        data: {
          userId: user2.id,
          organizationId: organization.id,
          role: 'member',
          fullName: 'User Two',
        },
      });

      const result = await memberFindManyController({}, context);

      expect(result.members).toBeDefined();
      expect(result.count).toBeGreaterThanOrEqual(2);
      expect(result.members.length).toBe(result.count);
    });

    it('should filter by email', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const timestamp = Date.now();
      const searchEmail = `unique-${timestamp}@example.com`;

      const user2 = await prisma.user.create({
        data: {
          email: searchEmail,
          emailVerified: true,
        },
      });

      await prisma.member.create({
        data: {
          userId: user2.id,
          organizationId: organization.id,
          role: 'member',
          fullName: 'Searchable User',
        },
      });

      const result = await memberFindManyController(
        {
          filter: { email: `unique-${timestamp}` },
        },
        context,
      );

      expect(result.members.length).toBeGreaterThan(0);
      expect(result.members[0].user?.email).toContain(`unique-${timestamp}`);
    });

    it('should filter by fullName', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const timestamp = Date.now();

      const user2 = await prisma.user.create({
        data: {
          email: `full-${timestamp}@example.com`,
          emailVerified: true,
        },
      });

      await prisma.member.create({
        data: {
          userId: user2.id,
          organizationId: organization.id,
          role: 'member',
          fullName: `UniqueFullName-${timestamp}`,
        },
      });

      const result = await memberFindManyController(
        {
          filter: { fullName: `UniqueFullName-${timestamp}` },
        },
        context,
      );

      expect(result.members.length).toBeGreaterThan(0);
      expect(result.members[0].fullName).toContain(
        `UniqueFullName-${timestamp}`,
      );
    });

    it('should filter by firstName', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const timestamp = Date.now();

      const user2 = await prisma.user.create({
        data: {
          email: `first-${timestamp}@example.com`,
          emailVerified: true,
        },
      });

      await prisma.member.create({
        data: {
          userId: user2.id,
          organizationId: organization.id,
          role: 'member',
          firstName: `UniqueFirst-${timestamp}`,
          fullName: `UniqueFirst-${timestamp} Last`,
        },
      });

      const result = await memberFindManyController(
        {
          filter: { firstName: `UniqueFirst-${timestamp}` },
        },
        context,
      );

      expect(result.members.length).toBeGreaterThan(0);
      expect(result.members[0].firstName).toContain(`UniqueFirst-${timestamp}`);
    });

    it('should filter by lastName', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const timestamp = Date.now();

      const user2 = await prisma.user.create({
        data: {
          email: `last-${timestamp}@example.com`,
          emailVerified: true,
        },
      });

      await prisma.member.create({
        data: {
          userId: user2.id,
          organizationId: organization.id,
          role: 'member',
          lastName: `UniqueLast-${timestamp}`,
          fullName: `First UniqueLast-${timestamp}`,
        },
      });

      const result = await memberFindManyController(
        {
          filter: { lastName: `UniqueLast-${timestamp}` },
        },
        context,
      );

      expect(result.members.length).toBeGreaterThan(0);
      expect(result.members[0].lastName).toContain(`UniqueLast-${timestamp}`);
    });

    it('should support pagination with skip and take', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      // Create 5 additional members
      for (let i = 0; i < 5; i++) {
        const u = await prisma.user.create({
          data: {
            email: `page-${Date.now()}-${i}@example.com`,
            emailVerified: true,
          },
        });

        await prisma.member.create({
          data: {
            userId: u.id,
            organizationId: organization.id,
            role: 'member',
            fullName: `Page Member ${i}`,
          },
        });
      }

      const result = await memberFindManyController(
        {
          skip: 1,
          take: 2,
        },
        context,
      );

      expect(result.members.length).toBe(2);
      expect(result.count).toBeGreaterThanOrEqual(6);
    });

    it('should sort by orderBy', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const result = await memberFindManyController(
        {
          orderBy: { fullName: 'asc' },
        },
        context,
      );

      expect(result.members).toBeDefined();
      expect(result.members.length).toBeGreaterThan(0);
    });
  });

  describe('Multi-Tenancy', () => {
    it('should only return members from current organization', async () => {
      const setup1 = await createTestUserWithOrganization();
      const setup2 = await createTestUserWithOrganization();

      const context1 = createAuthenticatedContext(
        setup1.user,
        setup1.organization,
        setup1.member,
      );

      const result = await memberFindManyController({}, context1);

      // Should only contain members from org1
      const orgIds = result.members.map((m) => m.organizationId);
      expect(orgIds.every((id) => id === setup1.organization.id)).toBe(true);
      expect(orgIds.includes(setup2.organization.id)).toBe(false);
    });
  });
});
