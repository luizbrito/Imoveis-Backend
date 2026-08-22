import { describe, it, expect, beforeEach } from 'vitest';
import { testPrismaClient } from '../../../test/testPrismaClient';
import { createTestUserWithOrganization } from '../../../test/testFactories';
import { createAuthenticatedContext } from '../../../test/testUtils';
import { apiKeyUpdateController } from '../controllers/apiKeyUpdateController';
import { Error404 } from '../../../shared/errors/Error404';

describe('ApiKeyUpdateController', () => {
  let prisma: ReturnType<typeof testPrismaClient>;

  beforeEach(() => {
    prisma = testPrismaClient();
  });

  describe('Success Cases', () => {
    it('should update API key name', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization({}, {}, { role: 'admin' });
      const context = createAuthenticatedContext(user, organization, member);

      // Create an API key
      const apiKey = await prisma.apiKey.create({
        data: {
          name: 'Original Name',
          key: `ba_test_${Date.now()}`,
          expiresAt: new Date(Date.now() + 86400 * 1000),
          referenceId: user.id,
          organizationId: organization.id,
          enabled: true,
        },
      });

      const updateData = {
        name: 'Updated Name',
        enabled: true,
      };

      const result = await apiKeyUpdateController(
        apiKey.id,
        updateData,
        context,
      );

      expect(result.name).toBe('Updated Name');
    });

    it('should update API key enabled status', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization({}, {}, { role: 'admin' });
      const context = createAuthenticatedContext(user, organization, member);

      const apiKey = await prisma.apiKey.create({
        data: {
          name: 'Enable Test',
          key: `ba_test_${Date.now()}`,
          expiresAt: new Date(Date.now() + 86400 * 1000),
          referenceId: user.id,
          organizationId: organization.id,
          enabled: true,
        },
      });

      const updateData = {
        name: 'Enable Test',
        enabled: false,
      };

      const result = await apiKeyUpdateController(
        apiKey.id,
        updateData,
        context,
      );

      expect(result.enabled).toBe(false);
    });
  });

  describe('Validation', () => {
    it('should reject non-existent API key', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization({}, {}, { role: 'admin' });
      const context = createAuthenticatedContext(user, organization, member);

      const nonExistentId = '550e8400-e29b-41d4-a716-999999999999';

      const updateData = {
        name: 'Updated',
        enabled: true,
      };

      await expect(
        apiKeyUpdateController(nonExistentId, updateData, context),
      ).rejects.toThrow(Error404);
    });

    it('should reject updating API key created by another user in the same organization', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization({}, {}, { role: 'admin' });
      const context = createAuthenticatedContext(user, organization, member);

      const otherUser = await testPrismaClient().user.create({
        data: {
          email: `other-${Date.now()}@example.com`,
          name: 'Other User',
          emailVerified: true,
        },
      });
      await testPrismaClient().member.create({
        data: {
          userId: otherUser.id,
          organizationId: organization.id,
          role: 'admin',
        } as any,
      });

      const apiKey = await testPrismaClient().apiKey.create({
        data: {
          name: 'Teammate Key',
          key: `ba_test_${Date.now()}`,
          expiresAt: new Date(Date.now() + 86400 * 1000),
          referenceId: otherUser.id,
          organizationId: organization.id,
          enabled: true,
        },
      });

      const updateData = {
        name: 'Hijack Attempt',
        enabled: false,
      };

      await expect(
        apiKeyUpdateController(apiKey.id, updateData, context),
      ).rejects.toThrow(Error404);
    });

    it('should reject updating API key from different user', async () => {
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

      // Create API key for user1
      const apiKey = await testPrismaClient().apiKey.create({
        data: {
          name: 'User1 Key',
          key: `ba_test_${Date.now()}`,
          expiresAt: new Date(Date.now() + 86400 * 1000),
          referenceId: setup1.user.id,
          organizationId: setup1.organization.id,
          enabled: true,
        },
      });

      const updateData = {
        name: 'Hacker Update',
        enabled: false,
      };

      // User2 tries to update User1's key
      await expect(
        apiKeyUpdateController(apiKey.id, updateData, context2),
      ).rejects.toThrow(Error404);
    });
  });
});
