import { describe, it, expect, beforeEach } from 'vitest';
import { testPrismaClient } from '../../../test/testPrismaClient';
import { createTestUserWithOrganization } from '../../../test/testFactories';
import { createAuthenticatedContext } from '../../../test/testUtils';
import { apiKeyListController } from '../controllers/apiKeyListController';

describe('ApiKeyListController', () => {
  let prisma: ReturnType<typeof testPrismaClient>;

  beforeEach(() => {
    prisma = testPrismaClient();
  });

  describe('Success Cases', () => {
    it('should list API keys for current organization', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization({}, {}, { role: 'admin' });
      const context = createAuthenticatedContext(user, organization, member);

      await prisma.apiKey.create({
        data: {
          name: 'Key 1',
          key: `ba_test_key_1_${Date.now()}`,
          expiresAt: new Date(Date.now() + 86400 * 1000),
          referenceId: user.id,
          organizationId: organization.id,
          enabled: true,
        },
      });
      await prisma.apiKey.create({
        data: {
          name: 'Key 2',
          key: `ba_test_key_2_${Date.now()}`,
          expiresAt: new Date(Date.now() + 86400 * 1000),
          referenceId: user.id,
          organizationId: organization.id,
          enabled: true,
        },
      });

      const result = await apiKeyListController({}, context);

      expect(result.count).toBe(2);
      expect(result.apiKeys.length).toBe(2);
    });

    it('should filter API keys by organization', async () => {
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
      const context = createAuthenticatedContext(
        setup1.user,
        setup1.organization,
        setup1.member,
      );

      await prisma.apiKey.create({
        data: {
          name: 'Same Org Key',
          key: `ba_test_key_same_${Date.now()}`,
          expiresAt: new Date(Date.now() + 86400 * 1000),
          referenceId: setup1.user.id,
          organizationId: setup1.organization.id,
          enabled: true,
        },
      });
      await prisma.apiKey.create({
        data: {
          name: 'Other Org Key',
          key: `ba_test_key_other_${Date.now()}`,
          expiresAt: new Date(Date.now() + 86400 * 1000),
          referenceId: setup2.user.id,
          organizationId: setup2.organization.id,
          enabled: true,
        },
      });

      const result = await apiKeyListController({}, context);

      expect(result.count).toBe(1);
      expect(result.apiKeys[0].name).toBe('Same Org Key');
    });

    it('should handle empty result', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization({}, {}, { role: 'admin' });
      const context = createAuthenticatedContext(user, organization, member);

      const result = await apiKeyListController({}, context);

      expect(result.count).toBe(0);
      expect(result.apiKeys).toEqual([]);
    });

    it('should not list API keys created by other users in the same organization', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization({}, {}, { role: 'admin' });
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
      const context = createAuthenticatedContext(user, organization, member);

      await prisma.apiKey.create({
        data: {
          name: 'My Key',
          key: `ba_test_mine_${Date.now()}`,
          expiresAt: new Date(Date.now() + 86400 * 1000),
          referenceId: user.id,
          organizationId: organization.id,
          enabled: true,
        },
      });
      await prisma.apiKey.create({
        data: {
          name: 'Teammate Key',
          key: `ba_test_teammate_${Date.now()}`,
          expiresAt: new Date(Date.now() + 86400 * 1000),
          referenceId: otherUser.id,
          organizationId: organization.id,
          enabled: true,
        },
      });

      const result = await apiKeyListController({}, context);

      expect(result.count).toBe(1);
      expect(result.apiKeys[0].name).toBe('My Key');
    });

    it('should filter by name', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization({}, {}, { role: 'admin' });
      const context = createAuthenticatedContext(user, organization, member);

      await prisma.apiKey.create({
        data: {
          name: 'Production Key',
          key: `ba_test_prod_${Date.now()}`,
          expiresAt: new Date(Date.now() + 86400 * 1000),
          referenceId: user.id,
          organizationId: organization.id,
          enabled: true,
        },
      });
      await prisma.apiKey.create({
        data: {
          name: 'Staging Key',
          key: `ba_test_staging_${Date.now()}`,
          expiresAt: new Date(Date.now() + 86400 * 1000),
          referenceId: user.id,
          organizationId: organization.id,
          enabled: true,
        },
      });

      const result = await apiKeyListController(
        { filter: { name: 'production' } },
        context,
      );

      expect(result.count).toBe(1);
      expect(result.apiKeys[0].name).toBe('Production Key');
    });
  });
});
