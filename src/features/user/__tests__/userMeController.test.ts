import { describe, it, expect, beforeEach } from 'vitest';
import { testPrismaClient } from '../../../test/testPrismaClient';
import { createTestUserWithOrganization } from '../../../test/testFactories';
import { createAuthenticatedContext } from '../../../test/testUtils';
import { userMeController } from '../controllers/userMeController';

describe('UserMeController', () => {
  let prisma: ReturnType<typeof testPrismaClient>;

  beforeEach(() => {
    prisma = testPrismaClient();
  });

  describe('Success Cases', () => {
    it('should return current user members and subscriptions', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const result = await userMeController(context);

      expect(result).toBeDefined();
      expect(result.members).toBeDefined();
      expect(result.activeSubscriptions).toBeDefined();
      expect(Array.isArray(result.members)).toBe(true);
      expect(Array.isArray(result.activeSubscriptions)).toBe(true);
    });

    it('should return members and subscriptions structure', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const result = await userMeController(context);

      // Result has correct structure
      expect(result).toHaveProperty('members');
      expect(result).toHaveProperty('activeSubscriptions');
      expect(Array.isArray(result.members)).toBe(true);
      expect(Array.isArray(result.activeSubscriptions)).toBe(true);
    });

    it('should handle users with no members', async () => {
      // Create user without members
      const userWithoutMembers = await prisma.user.create({
        data: {
          email: `nomember-${Date.now()}@example.com`,
          emailVerified: true,
        },
      });

      const context = {
        currentUser: userWithoutMembers,
        headers: new Headers(),
      } as any;

      const result = await userMeController(context);

      expect(result.members).toEqual([]);
      expect(result.activeSubscriptions).toEqual([]);
    });
  });

  describe('Unauthenticated', () => {
    it('should return empty arrays for unauthenticated user', async () => {
      const context = {
        currentUser: null,
        headers: new Headers(),
      } as any;

      const result = await userMeController(context);

      expect(result.members).toEqual([]);
      expect(result.activeSubscriptions).toEqual([]);
    });
  });
});
