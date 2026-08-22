import { describe, it, expect, beforeEach } from 'vitest';
import { testPrismaClient } from '../../../test/testPrismaClient';
import { createTestUserWithOrganization } from '../../../test/testFactories';
import { createAuthenticatedContext } from '../../../test/testUtils';
import { memberUpdateMeController } from '../controllers/memberUpdateMeController';
import { Error403 } from '../../../shared/errors/Error403';

describe('MemberUpdateMeController', () => {
  let prisma: ReturnType<typeof testPrismaClient>;

  beforeEach(() => {
    prisma = testPrismaClient();
  });

  describe('Success Cases', () => {
    it('should update own profile', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const updateData = {
        firstName: 'MyFirst',
        lastName: 'MyLast',
      };

      const result = await memberUpdateMeController(updateData, context);

      expect(result.firstName).toBe('MyFirst');
      expect(result.lastName).toBe('MyLast');
      expect(result.fullName).toBe('MyFirst MyLast');
    });

    it('should update own avatars', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const updateData = {
        avatars: [
          {
            key: 'my-avatar.jpg',
            name: 'my-avatar.jpg',
            size: 1024,
            type: 'image/jpeg',
          },
        ],
      };

      const result = await memberUpdateMeController(updateData, context);

      expect(result.avatars).toBeDefined();
      expect(Array.isArray(result.avatars)).toBe(true);
    });

    it('should handle partial name updates', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      // Update only first name
      const updateData = {
        firstName: 'OnlyFirst',
      };

      const result = await memberUpdateMeController(updateData, context);

      expect(result.firstName).toBe('OnlyFirst');
      expect(result.fullName).toBe('OnlyFirst');
    });
  });

  describe('Validation', () => {
    it('should reject unauthenticated request', async () => {
      const context = {
        currentMember: null,
      } as any;

      const updateData = {
        firstName: 'Test',
      };

      await expect(
        memberUpdateMeController(updateData, context),
      ).rejects.toThrow(Error403);
    });
  });
});
