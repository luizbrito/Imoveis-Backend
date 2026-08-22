import { describe, it, expect, beforeEach, vi } from 'vitest';
import { testPrismaClient } from '../../../test/testPrismaClient';
import { createTestUserWithOrganization } from '../../../test/testFactories';
import { createAuthenticatedContext } from '../../../test/testUtils';
import { organizationCreateController } from '../controllers/organizationCreateController';
import { Error400 } from '../../../shared/errors/Error400';
import { Error403 } from '../../../shared/errors/Error403';
import { APIError } from 'better-auth';
import type { Env } from '../../../env';

// Create mutable mock env object (hoisted for vi.mock)
const mockEnv = vi.hoisted(
  () =>
    ({
      ORGANIZATION_MODE: 'multi',
      NODE_ENV: 'test',
    }) as Partial<Env>,
);

// Mock env module with mutable object
vi.mock('../../../env', () => ({
  env: mockEnv,
}));

// Mock Better Auth
vi.mock('../../auth/authBackend', () => ({
  authBackend: {
    api: {
      createOrganization: vi.fn(),
    },
  },
}));

import { authBackend } from '../../auth/authBackend';
import { dictionary } from '../../../translation/en/en';

describe('OrganizationCreateController', () => {
  beforeEach(() => {
    testPrismaClient();
    vi.clearAllMocks();

    // Reset mock env to defaults
    mockEnv.ORGANIZATION_MODE = 'multi';
    mockEnv.NODE_ENV = 'test';
  });

  describe('Success Cases', () => {
    it('should create organization with auto-generated slug', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      // In non-multi-domain mode (default), slug is optional - omit it entirely
      const orgData = {
        name: 'New Organization',
      };

      const mockOrg = {
        id: '550e8400-e29b-41d4-a716-446655440400',
        name: 'New Organization',
        slug: 'new-organization-' + Date.now(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(authBackend.api.createOrganization).mockResolvedValue(
        mockOrg as any,
      );

      const result = await organizationCreateController(orgData, context);

      expect(result).toBeDefined();
      expect(result.name).toBe('New Organization');
      expect(authBackend.api.createOrganization).toHaveBeenCalledWith({
        body: {
          name: 'New Organization',
          slug: expect.stringContaining('new-organization-'),
        },
        headers: context.headers,
      });
    });

    it('should generate slug with timestamp to ensure uniqueness', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      // In non-multi-domain mode (default), slug is optional - omit it entirely
      const orgData = {
        name: 'Test Org',
      };

      const mockOrg = {
        id: '550e8400-e29b-41d4-a716-446655440401',
        name: 'Test Org',
        slug: 'test-org-' + Date.now(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(authBackend.api.createOrganization).mockResolvedValue(
        mockOrg as any,
      );

      await organizationCreateController(orgData, context);

      const callArgs = vi.mocked(authBackend.api.createOrganization).mock
        .calls[0][0];
      expect(callArgs.body.slug).toMatch(/^test-org-\d+$/);
    });

    it('should normalize organization name to slug format', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      // In non-multi-domain mode (default), slug is optional - omit it entirely
      const orgData = {
        name: 'My Cool Company!!!',
      };

      const mockOrg = {
        id: '550e8400-e29b-41d4-a716-446655440402',
        name: 'My Cool Company!!!',
        slug: 'my-cool-company-' + Date.now(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(authBackend.api.createOrganization).mockResolvedValue(
        mockOrg as any,
      );

      await organizationCreateController(orgData, context);

      const callArgs = vi.mocked(authBackend.api.createOrganization).mock
        .calls[0][0];
      expect(callArgs.body.slug).toMatch(/^my-cool-company-\d+$/);
    });
  });

  describe('Validation', () => {
    it('should reject unauthenticated request', async () => {
      const context = {
        currentUser: null,
        headers: new Headers(),
      } as any;

      const orgData = {
        name: 'Test Org',
      };

      await expect(
        organizationCreateController(orgData, context),
      ).rejects.toThrow(Error403);
    });

    it('should reject missing name', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      await expect(organizationCreateController({}, context)).rejects.toThrow();
    });
  });

  describe('Better Auth Integration', () => {
    it('should handle APIError from Better Auth', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const orgData = {
        name: 'Error Org',
      };

      const apiError = new APIError({
        body: {
          code: 'ORGANIZATION_LIMIT_REACHED',
          message: 'Organization limit reached',
        },
      } as any);

      vi.mocked(authBackend.api.createOrganization).mockRejectedValue(apiError);

      await expect(
        organizationCreateController(orgData, context),
      ).rejects.toThrow(Error400);
    });

    it('should handle null response from Better Auth', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const orgData = {
        name: 'Null Org',
      };

      vi.mocked(authBackend.api.createOrganization).mockResolvedValue(
        null as any,
      );

      await expect(
        organizationCreateController(orgData, context),
      ).rejects.toThrow(dictionary.organization.errors.createFailed);
    });
  });
});
