import { describe, expect, it, afterEach, beforeEach, vi } from 'vitest';
import { createAuthenticatedContext } from '../../../test/testUtils';
import { createTestUserWithOrganization } from '../../../test/testFactories';
import { organizationCreateController } from '../controllers/organizationCreateController';
import { organizationUpdateController } from '../controllers/organizationUpdateController';
import { Error400 } from '../../../shared/errors/Error400';
import type { Env } from '../../../env';

// Create mutable mock env object (hoisted for vi.mock)
const mockEnv = vi.hoisted(() => ({}) as Partial<Env>);

// Mock env module with mutable object
vi.mock('../../../env', () => ({
  env: mockEnv,
}));

describe('Organization Slug Validation', () => {
  beforeEach(() => {
    // Don't reset modules - tests mock Better Auth internally
  });

  afterEach(() => {
    // Don't reset modules - tests mock Better Auth internally
  });

  describe('Create Controller - Subdomain mode validation', () => {
    it('should reject slug matching reserved subdomain', async () => {
      mockEnv.FRONTEND_URL = 'https://app.project.localhost';
      mockEnv.ORGANIZATION_MODE = 'multi-domain';
      mockEnv.ORGANIZATION_MULTI_DOMAIN_MODE = 'subdomain';

      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      // Should reject "app" as it's reserved
      await expect(
        organizationCreateController(
          {
            name: 'Test Org',
            slug: 'app',
          },
          context,
        ),
      ).rejects.toThrow(Error400);

      // Verify the error message
      try {
        await organizationCreateController(
          {
            name: 'Test Org',
            slug: 'app',
          },
          context,
        );
      } catch (error) {
        if (error instanceof Error400) {
          expect(error.message).toContain('reserved for the application');
        }
      }
    });

    it('should accept non-reserved subdomain', async () => {
      mockEnv.FRONTEND_URL = 'https://app.project.localhost';
      mockEnv.ORGANIZATION_MODE = 'multi-domain';
      mockEnv.ORGANIZATION_MULTI_DOMAIN_MODE = 'subdomain';

      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      // Mock the Better Auth API call
      const originalAuth = await import('../../auth/authBackend');
      const mockCreateOrg = vi.fn().mockResolvedValue({
        id: 'test-org-id',
        name: 'Test Org',
        slug: 'workspace',
      });
      vi.spyOn(
        originalAuth.authBackend.api,
        'createOrganization',
      ).mockImplementation(mockCreateOrg);

      // Should accept "workspace" as it's not reserved
      const result = await organizationCreateController(
        {
          name: 'Test Org',
          slug: 'workspace',
        },
        context,
      );

      expect(result).toBeDefined();
      expect(mockCreateOrg).toHaveBeenCalled();
    });
  });

  describe('Create Controller - Full domain mode validation', () => {
    it('should reject slug matching reserved domain', async () => {
      mockEnv.FRONTEND_URL = 'https://app.project.localhost';
      mockEnv.ORGANIZATION_MODE = 'multi-domain';
      mockEnv.ORGANIZATION_MULTI_DOMAIN_MODE = 'domain';

      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      // Should reject "app.project.localhost" as it's reserved
      await expect(
        organizationCreateController(
          {
            name: 'Test Org',
            slug: 'app.project.localhost',
          },
          context,
        ),
      ).rejects.toThrow(Error400);

      // Verify the error message
      try {
        await organizationCreateController(
          {
            name: 'Test Org',
            slug: 'app.project.localhost',
          },
          context,
        );
      } catch (error) {
        if (error instanceof Error400) {
          expect(error.message).toContain('reserved for the application');
        }
      }
    });

    it('should accept non-reserved domain', async () => {
      mockEnv.FRONTEND_URL = 'https://app.project.localhost';
      mockEnv.ORGANIZATION_MODE = 'multi-domain';
      mockEnv.ORGANIZATION_MULTI_DOMAIN_MODE = 'domain';

      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      // Mock the Better Auth API call
      const originalAuth = await import('../../auth/authBackend');
      const mockCreateOrg = vi.fn().mockResolvedValue({
        id: 'test-org-id',
        name: 'Test Org',
        slug: 'customer.example.com',
      });
      vi.spyOn(
        originalAuth.authBackend.api,
        'createOrganization',
      ).mockImplementation(mockCreateOrg);

      // Should accept "customer.example.com" as it's not reserved
      const result = await organizationCreateController(
        {
          name: 'Test Org',
          slug: 'customer.example.com',
        },
        context,
      );

      expect(result).toBeDefined();
      expect(mockCreateOrg).toHaveBeenCalled();
    });
  });

  describe('Update Controller - Subdomain mode validation', () => {
    it('should reject slug matching reserved subdomain', async () => {
      mockEnv.FRONTEND_URL = 'https://app.project.localhost';
      mockEnv.ORGANIZATION_MODE = 'multi-domain';
      mockEnv.ORGANIZATION_MULTI_DOMAIN_MODE = 'subdomain';

      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      // Should reject "app" as it's reserved
      await expect(
        organizationUpdateController(
          { id: organization.id },
          { slug: 'app' },
          context,
        ),
      ).rejects.toThrow(Error400);

      // Verify the error message
      try {
        await organizationUpdateController(
          { id: organization.id },
          { slug: 'app' },
          context,
        );
      } catch (error) {
        if (error instanceof Error400) {
          expect(error.message).toContain('reserved for the application');
        }
      }
    });

    it('should accept non-reserved subdomain', async () => {
      mockEnv.FRONTEND_URL = 'https://app.project.localhost';
      mockEnv.ORGANIZATION_MODE = 'multi-domain';
      mockEnv.ORGANIZATION_MULTI_DOMAIN_MODE = 'subdomain';

      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      // Mock the Better Auth API call
      const originalAuth = await import('../../auth/authBackend');
      const mockUpdateOrg = vi.fn().mockResolvedValue({
        id: organization.id,
        name: 'Test Org',
        slug: 'workspace',
      });
      vi.spyOn(
        originalAuth.authBackend.api,
        'updateOrganization',
      ).mockImplementation(mockUpdateOrg);

      // Should accept "workspace" as it's not reserved
      const result = await organizationUpdateController(
        { id: organization.id },
        { slug: 'workspace' },
        context,
      );

      expect(result).toBeDefined();
      expect(mockUpdateOrg).toHaveBeenCalled();
    });
  });

  describe('Update Controller - Full domain mode validation', () => {
    it('should reject slug matching reserved domain', async () => {
      mockEnv.FRONTEND_URL = 'https://app.project.localhost';
      mockEnv.ORGANIZATION_MODE = 'multi-domain';
      mockEnv.ORGANIZATION_MULTI_DOMAIN_MODE = 'domain';

      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      // Should reject "app.project.localhost" as it's reserved
      await expect(
        organizationUpdateController(
          { id: organization.id },
          { slug: 'app.project.localhost' },
          context,
        ),
      ).rejects.toThrow(Error400);

      // Verify the error message
      try {
        await organizationUpdateController(
          { id: organization.id },
          { slug: 'app.project.localhost' },
          context,
        );
      } catch (error) {
        if (error instanceof Error400) {
          expect(error.message).toContain('reserved for the application');
        }
      }
    });

    it('should accept non-reserved domain', async () => {
      mockEnv.FRONTEND_URL = 'https://app.project.localhost';
      mockEnv.ORGANIZATION_MODE = 'multi-domain';
      mockEnv.ORGANIZATION_MULTI_DOMAIN_MODE = 'domain';

      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      // Mock the Better Auth API call
      const originalAuth = await import('../../auth/authBackend');
      const mockUpdateOrg = vi.fn().mockResolvedValue({
        id: organization.id,
        name: 'Test Org',
        slug: 'customer.example.com',
      });
      vi.spyOn(
        originalAuth.authBackend.api,
        'updateOrganization',
      ).mockImplementation(mockUpdateOrg);

      // Should accept "customer.example.com" as it's not reserved
      const result = await organizationUpdateController(
        { id: organization.id },
        { slug: 'customer.example.com' },
        context,
      );

      expect(result).toBeDefined();
      expect(mockUpdateOrg).toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle missing FRONTEND_URL', async () => {
      mockEnv.FRONTEND_URL = undefined;
      mockEnv.ORGANIZATION_MODE = 'multi-domain';
      mockEnv.ORGANIZATION_MULTI_DOMAIN_MODE = 'subdomain';

      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      // Mock the Better Auth API call
      const originalAuth = await import('../../auth/authBackend');
      const mockCreateOrg = vi.fn().mockResolvedValue({
        id: 'test-org-id',
        name: 'Test Org',
        slug: 'app',
      });
      vi.spyOn(
        originalAuth.authBackend.api,
        'createOrganization',
      ).mockImplementation(mockCreateOrg);

      // Should not throw when FRONTEND_URL is missing
      const result = await organizationCreateController(
        {
          name: 'Test Org',
          slug: 'app',
        },
        context,
      );

      expect(result).toBeDefined();
      expect(mockCreateOrg).toHaveBeenCalled();
    });

    it('should handle invalid FRONTEND_URL', async () => {
      mockEnv.FRONTEND_URL = 'not-a-valid-url';
      mockEnv.ORGANIZATION_MODE = 'multi-domain';
      mockEnv.ORGANIZATION_MULTI_DOMAIN_MODE = 'subdomain';

      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      // Mock the Better Auth API call
      const originalAuth = await import('../../auth/authBackend');
      const mockCreateOrg = vi.fn().mockResolvedValue({
        id: 'test-org-id',
        name: 'Test Org',
        slug: 'app',
      });
      vi.spyOn(
        originalAuth.authBackend.api,
        'createOrganization',
      ).mockImplementation(mockCreateOrg);

      // Should not throw when FRONTEND_URL is invalid (falls back to no validation)
      const result = await organizationCreateController(
        {
          name: 'Test Org',
          slug: 'app',
        },
        context,
      );

      expect(result).toBeDefined();
      expect(mockCreateOrg).toHaveBeenCalled();
    });

    it('should not validate slug in non-multi-domain mode', async () => {
      mockEnv.FRONTEND_URL = 'https://app.example.com';
      mockEnv.ORGANIZATION_MODE = 'multi';
      mockEnv.ORGANIZATION_MULTI_DOMAIN_MODE = 'subdomain';

      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      // Mock the Better Auth API call
      const originalAuth = await import('../../auth/authBackend');
      const mockCreateOrg = vi.fn().mockResolvedValue({
        id: 'test-org-id',
        name: 'Test Org',
        slug: 'test-org-123456789',
      });
      vi.spyOn(
        originalAuth.authBackend.api,
        'createOrganization',
      ).mockImplementation(mockCreateOrg);

      // In non-multi-domain mode, slug is generated with timestamp
      const result = await organizationCreateController(
        {
          name: 'Test Org',
        },
        context,
      );

      expect(result).toBeDefined();
      expect(mockCreateOrg).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            slug: expect.stringMatching(/^test-org-\d+$/),
          }),
        }),
      );
    });
  });
});
