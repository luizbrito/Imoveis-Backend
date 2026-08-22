import { describe, it, expect, beforeEach } from 'vitest';
import { testPrismaClient } from '../../../test/testPrismaClient';
import { createTestUserWithOrganization } from '../../../test/testFactories';
import { createAuthenticatedContext } from '../../../test/testUtils';
import { apiKeyFindController } from '../controllers/apiKeyFindController';
import { Error404 } from '../../../shared/errors/Error404';

describe('ApiKeyFindController', () => {
  let prisma: ReturnType<typeof testPrismaClient>;

  beforeEach(() => {
    prisma = testPrismaClient();
  });

  describe('Success Cases', () => {
    it('should find API key owned by current user', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization({}, {}, { role: 'admin' });
      const context = createAuthenticatedContext(user, organization, member);

      const apiKey = await prisma.apiKey.create({
        data: {
          name: 'My Key',
          key: `ba_test_${Date.now()}`,
          expiresAt: new Date(Date.now() + 86400 * 1000),
          referenceId: user.id,
          organizationId: organization.id,
          enabled: true,
        },
      });

      const result = await apiKeyFindController({ id: apiKey.id }, context);

      expect(result.id).toBe(apiKey.id);
      expect(result.name).toBe('My Key');
    });
  });

  describe('Validation', () => {
    it('should reject non-existent API key', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization({}, {}, { role: 'admin' });
      const context = createAuthenticatedContext(user, organization, member);

      const nonExistentId = '550e8400-e29b-41d4-a716-999999999997';

      await expect(
        apiKeyFindController({ id: nonExistentId }, context),
      ).rejects.toThrow(Error404);
    });

    it('should reject finding API key from different organization', async () => {
      const setup1 = await createTestUserWithOrganization(
        {},
        {},
        { role: 'admin' },
      );
      const setup2 = await createTestUserWithOrganization(
        {},
        {},
        { role: 'admin' },
      );

      const context2 = createAuthenticatedContext(
        setup2.user,
        setup2.organization,
        setup2.member,
      );

      const apiKey = await prisma.apiKey.create({
        data: {
          name: 'Other Org Key',
          key: `ba_test_${Date.now()}`,
          expiresAt: new Date(Date.now() + 86400 * 1000),
          referenceId: setup1.user.id,
          organizationId: setup1.organization.id,
          enabled: true,
        },
      });

      await expect(
        apiKeyFindController({ id: apiKey.id }, context2),
      ).rejects.toThrow(Error404);
    });

    it('should reject finding API key created by another user in the same organization', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization({}, {}, { role: 'admin' });
      const context = createAuthenticatedContext(user, organization, member);

      const otherUser = await prisma.user.create({
        data: {
          email: `other-${Date.now()}@example.com`,
          name: 'Other User',
          emailVerified: true,
        },
      });
      await prisma.member.create({
        data: {
          userId: otherUser.id,
          organizationId: organization.id,
          role: 'admin',
        } as any,
      });

      const apiKey = await prisma.apiKey.create({
        data: {
          name: 'Teammate Key',
          key: `ba_test_${Date.now()}`,
          expiresAt: new Date(Date.now() + 86400 * 1000),
          referenceId: otherUser.id,
          organizationId: organization.id,
          enabled: true,
        },
      });

      await expect(
        apiKeyFindController({ id: apiKey.id }, context),
      ).rejects.toThrow(Error404);
    });
  });
});
