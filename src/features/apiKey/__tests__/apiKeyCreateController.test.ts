import { describe, it, expect, beforeEach, vi } from 'vitest';
import { testPrismaClient } from '../../../test/testPrismaClient';
import { createTestUserWithOrganization } from '../../../test/testFactories';
import { createAuthenticatedContext } from '../../../test/testUtils';
import { apiKeyCreateController } from '../controllers/apiKeyCreateController';
import { Error400 } from '../../../shared/errors/Error400';
import { APIError } from 'better-auth';

// Mock Better Auth
vi.mock('../../auth/authBackend', () => ({
  authBackend: {
    api: {
      createApiKey: vi.fn(),
    },
  },
}));

import { authBackend } from '../../auth/authBackend';
import { dictionary } from '../../../translation/en/en';

describe('ApiKeyCreateController', () => {
  let prisma: ReturnType<typeof testPrismaClient>;

  beforeEach(() => {
    prisma = testPrismaClient();
    vi.clearAllMocks();
  });

  const mockCreateApiKeyWithDbRow = (
    mockApiKey: { id: string; name: string; key: string; expiresAt: Date },
    referenceId: string,
  ) => {
    vi.mocked(authBackend.api.createApiKey).mockImplementation(async () => {
      await prisma.apiKey.create({
        data: {
          id: mockApiKey.id,
          name: mockApiKey.name,
          key: mockApiKey.key,
          referenceId,
          expiresAt: mockApiKey.expiresAt,
          enabled: true,
        },
      });
      return mockApiKey as any;
    });
  };

  describe('Success Cases', () => {
    it('should create API key with name and expiration', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization({}, {}, { role: 'admin' });
      const context = createAuthenticatedContext(user, organization, member);

      const apiKeyData = {
        name: 'Test API Key',
        expiresInSeconds: 86400, // 1 day
      };

      const mockApiKey = {
        id: '550e8400-e29b-41d4-a716-446655440600',
        name: 'Test API Key',
        key: 'ba_test_key_123',
        expiresAt: new Date(Date.now() + 86400 * 1000),
        createdAt: new Date(),
      };

      mockCreateApiKeyWithDbRow(mockApiKey, user.id);

      const result = await apiKeyCreateController(apiKeyData, context);

      expect(result).toBeDefined();
      expect(result.name).toBe('Test API Key');
      expect(authBackend.api.createApiKey).toHaveBeenCalledWith({
        body: {
          name: 'Test API Key',
          expiresIn: 86400,
          permissions: undefined,
          userId: user.id,
          organizationId: organization.id,
          metadata: {
            organizationId: organization.id,
          },
        },
      });
    });

    it('should create API key with permissions', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization({}, {}, { role: 'admin' });
      const context = createAuthenticatedContext(user, organization, member);

      const apiKeyData = {
        name: 'API Key With Permissions',
        expiresInSeconds: 86400,
        permissions: {
          filial: ['read', 'create'],
          member: ['read'],
        },
      };

      const mockApiKey = {
        id: '550e8400-e29b-41d4-a716-446655440601',
        name: 'API Key With Permissions',
        key: 'ba_test_key_456',
        expiresAt: new Date(Date.now() + 86400 * 1000),
        createdAt: new Date(),
      };

      mockCreateApiKeyWithDbRow(mockApiKey, user.id);

      const result = await apiKeyCreateController(apiKeyData, context);

      expect(result).toBeDefined();
      expect(authBackend.api.createApiKey).toHaveBeenCalledWith({
        body: expect.objectContaining({
          permissions: {
            filial: ['read', 'create'],
            member: ['read'],
          },
        }),
      });
    });

    it('should include organizationId in metadata', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization({}, {}, { role: 'admin' });
      const context = createAuthenticatedContext(user, organization, member);

      const apiKeyData = {
        name: 'Org API Key',
        expiresInSeconds: 3600,
      };

      const mockApiKey = {
        id: '550e8400-e29b-41d4-a716-446655440602',
        name: 'Org API Key',
        key: 'ba_test_key_789',
        expiresAt: new Date(Date.now() + 3600 * 1000),
        createdAt: new Date(),
      };

      mockCreateApiKeyWithDbRow(mockApiKey, user.id);

      await apiKeyCreateController(apiKeyData, context);

      expect(authBackend.api.createApiKey).toHaveBeenCalledWith({
        body: expect.objectContaining({
          metadata: {
            organizationId: organization.id,
          },
        }),
      });
    });
  });

  describe('Validation', () => {
    it('should reject missing name', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization({}, {}, { role: 'admin' });
      const context = createAuthenticatedContext(user, organization, member);

      await expect(
        apiKeyCreateController(
          {
            expiresInSeconds: 86400,
          } as any,
          context,
        ),
      ).rejects.toThrow();
    });

    it('should allow missing expiresInSeconds (optional)', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization({}, {}, { role: 'admin' });
      const context = createAuthenticatedContext(user, organization, member);

      const mockApiKey = {
        id: '550e8400-e29b-41d4-a716-446655440650',
        name: 'Test Key',
        key: 'ba_test_key_no_expiry',
        expiresAt: new Date(Date.now() + 3600 * 1000), // Default expiry
        createdAt: new Date(),
      };

      mockCreateApiKeyWithDbRow(mockApiKey, user.id);

      const result = await apiKeyCreateController(
        {
          name: 'Test Key',
        },
        context,
      );

      expect(result).toBeDefined();
    });
  });

  describe('Better Auth Integration', () => {
    it('should handle APIError from Better Auth', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization({}, {}, { role: 'admin' });
      const context = createAuthenticatedContext(user, organization, member);

      const apiKeyData = {
        name: 'Error Key',
        expiresInSeconds: 86400,
      };

      const apiError = new APIError({
        body: {
          code: 'API_KEY_LIMIT_REACHED',
          message: 'API key limit reached',
        },
      } as any);

      vi.mocked(authBackend.api.createApiKey).mockRejectedValue(apiError);

      await expect(apiKeyCreateController(apiKeyData, context)).rejects.toThrow(
        Error400,
      );
    });

    it('should handle null response from Better Auth', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization({}, {}, { role: 'admin' });
      const context = createAuthenticatedContext(user, organization, member);

      const apiKeyData = {
        name: 'Null Key',
        expiresInSeconds: 86400,
      };

      vi.mocked(authBackend.api.createApiKey).mockResolvedValue(null as any);

      await expect(apiKeyCreateController(apiKeyData, context)).rejects.toThrow(
        dictionary.apiKey.errors.createFailed,
      );
    });
  });
});
