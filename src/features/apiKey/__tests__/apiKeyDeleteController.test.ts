import { describe, it, expect, beforeEach, vi } from 'vitest';
import { testPrismaClient } from '../../../test/testPrismaClient';
import { createTestUserWithOrganization } from '../../../test/testFactories';
import { createAuthenticatedContext } from '../../../test/testUtils';
import { apiKeyDeleteController } from '../controllers/apiKeyDeleteController';
import { Error404 } from '../../../shared/errors/Error404';

// Mock Better Auth
vi.mock('../../auth/authBackend', () => ({
  authBackend: {
    api: {
      deleteApiKey: vi.fn(),
    },
  },
}));

import { authBackend } from '../../auth/authBackend';

describe('ApiKeyDeleteController', () => {
  let prisma: ReturnType<typeof testPrismaClient>;

  beforeEach(() => {
    prisma = testPrismaClient();
    vi.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should delete API key', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization({}, {}, { role: 'admin' });
      const context = createAuthenticatedContext(user, organization, member);

      const apiKey = await prisma.apiKey.create({
        data: {
          name: 'Delete Me',
          key: `ba_test_${Date.now()}`,
          expiresAt: new Date(Date.now() + 86400 * 1000),
          referenceId: user.id,
          organizationId: organization.id,
          enabled: true,
        },
      });

      vi.mocked(authBackend.api.deleteApiKey).mockResolvedValue({
        success: true,
      } as any);

      const result = await apiKeyDeleteController(apiKey.id, context);

      expect(result).toBeDefined();
      expect(result.id).toBe(apiKey.id);
      expect(authBackend.api.deleteApiKey).toHaveBeenCalledWith({
        body: { keyId: apiKey.id },
        headers: context.headers,
      });
    });
  });

  describe('Validation', () => {
    it('should reject non-existent API key', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization({}, {}, { role: 'admin' });
      const context = createAuthenticatedContext(user, organization, member);

      const nonExistentId = '550e8400-e29b-41d4-a716-999999999998';

      await expect(
        apiKeyDeleteController(nonExistentId, context),
      ).rejects.toThrow(Error404);
    });

    it('should reject deleting API key from different user', async () => {
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
          name: 'User1 Delete Key',
          key: `ba_test_${Date.now()}`,
          expiresAt: new Date(Date.now() + 86400 * 1000),
          referenceId: setup1.user.id,
          organizationId: setup1.organization.id,
          enabled: true,
        },
      });

      // User2 tries to delete User1's key
      await expect(apiKeyDeleteController(apiKey.id, context2)).rejects.toThrow(
        Error404,
      );
    });
  });
});
