import { describe, it, expect, beforeEach } from 'vitest';
import { testPrismaClient } from '../../../test/testPrismaClient';
import { createTestUserWithOrganization } from '../../../test/testFactories';
import { createAuthenticatedContext } from '../../../test/testUtils';
import { memberAutocompleteController } from '../controllers/memberAutocompleteController';

describe('MemberAutocompleteController', () => {
  let prisma: ReturnType<typeof testPrismaClient>;

  beforeEach(() => {
    prisma = testPrismaClient();
  });

  describe('Success Cases', () => {
    it('should return all members without search', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const result = await memberAutocompleteController({}, context);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('fullName');
      expect(result[0]).toHaveProperty('email');
    });

    it('should search by fullName', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const timestamp = Date.now();

      const user2 = await prisma.user.create({
        data: {
          email: `auto-${timestamp}@example.com`,
          emailVerified: true,
        },
      });

      await prisma.member.create({
        data: {
          userId: user2.id,
          organizationId: organization.id,
          role: 'member',
          fullName: `AutoComplete-${timestamp}`,
        },
      });

      const result = await memberAutocompleteController(
        {
          search: `AutoComplete-${timestamp}`,
        },
        context,
      );

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].fullName).toContain(`AutoComplete-${timestamp}`);
    });

    it('should search by email', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const timestamp = Date.now();
      const searchEmail = `autoemail-${timestamp}@example.com`;

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
          fullName: 'Auto Email User',
        },
      });

      const result = await memberAutocompleteController(
        {
          search: `autoemail-${timestamp}`,
        },
        context,
      );

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].email).toContain(`autoemail-${timestamp}`);
    });

    it('should exclude specified IDs', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const result = await memberAutocompleteController(
        {
          exclude: [member.id],
        },
        context,
      );

      const excludedIds = result.map((m) => m.id);
      expect(excludedIds.includes(member.id)).toBe(false);
    });

    it('should limit results with take', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      // Create 5 additional members
      for (let i = 0; i < 5; i++) {
        const u = await prisma.user.create({
          data: {
            email: `take-${Date.now()}-${i}@example.com`,
            emailVerified: true,
          },
        });

        await prisma.member.create({
          data: {
            userId: u.id,
            organizationId: organization.id,
            role: 'member',
            fullName: `Take Member ${i}`,
          },
        });
      }

      const result = await memberAutocompleteController(
        {
          take: 2,
        },
        context,
      );

      expect(result.length).toBeLessThanOrEqual(2);
    });

    it('should search by firstName', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const timestamp = Date.now();

      const user2 = await prisma.user.create({
        data: {
          email: `first-auto-${timestamp}@example.com`,
          emailVerified: true,
        },
      });

      await prisma.member.create({
        data: {
          userId: user2.id,
          organizationId: organization.id,
          role: 'member',
          firstName: `AutoFirst-${timestamp}`,
          fullName: `AutoFirst-${timestamp} Last`,
        },
      });

      const result = await memberAutocompleteController(
        {
          search: `AutoFirst-${timestamp}`,
        },
        context,
      );

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].firstName).toContain(`AutoFirst-${timestamp}`);
    });

    it('should search by lastName', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const timestamp = Date.now();

      const user2 = await prisma.user.create({
        data: {
          email: `last-auto-${timestamp}@example.com`,
          emailVerified: true,
        },
      });

      await prisma.member.create({
        data: {
          userId: user2.id,
          organizationId: organization.id,
          role: 'member',
          lastName: `AutoLast-${timestamp}`,
          fullName: `First AutoLast-${timestamp}`,
        },
      });

      const result = await memberAutocompleteController(
        {
          search: `AutoLast-${timestamp}`,
        },
        context,
      );

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].lastName).toContain(`AutoLast-${timestamp}`);
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

      const result = await memberAutocompleteController({}, context1);

      // Should not include members from org2
      const ids = result.map((m) => m.id);
      expect(ids.includes(setup2.member.id)).toBe(false);
    });
  });
});
