import { describe, it, expect, beforeEach, vi } from 'vitest';
import { testPrismaClient } from '../../../test/testPrismaClient';
import { createTestUserWithOrganization } from '../../../test/testFactories';
import { createAuthenticatedContext } from '../../../test/testUtils';
import { organizationUpdateController } from '../controllers/organizationUpdateController';
import { Error400 } from '../../../shared/errors/Error400';
import { APIError } from 'better-auth';

// Mock Better Auth
vi.mock('../../auth/authBackend', () => ({
  authBackend: {
    api: {
      updateOrganization: vi.fn(),
    },
  },
}));

import { authBackend } from '../../auth/authBackend';
import { dictionary } from '../../../translation/en/en';

describe('OrganizationUpdateController', () => {
  let prisma: ReturnType<typeof testPrismaClient>;

  beforeEach(() => {
    prisma = testPrismaClient();
    vi.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should update organization name', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const updateData = {
        name: 'Updated Organization Name',
      };

      const mockOrg = {
        ...organization,
        name: 'Updated Organization Name',
        updatedAt: new Date(),
      };

      vi.mocked(authBackend.api.updateOrganization).mockResolvedValue(
        mockOrg as any,
      );

      const result = await organizationUpdateController(
        { id: organization.id },
        updateData,
        context,
      );

      expect(result).toBeDefined();
      expect(result.name).toBe('Updated Organization Name');
      expect(authBackend.api.updateOrganization).toHaveBeenCalledWith({
        body: {
          organizationId: organization.id,
          data: {
            name: 'Updated Organization Name',
          },
        },
        headers: context.headers,
      });
    });

    it('should handle partial updates', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const updateData = {
        name: 'Partial Update',
      };

      const mockOrg = {
        ...organization,
        name: 'Partial Update',
      };

      vi.mocked(authBackend.api.updateOrganization).mockResolvedValue(
        mockOrg as any,
      );

      const result = await organizationUpdateController(
        { id: organization.id },
        updateData,
        context,
      );

      expect(result).toBeDefined();
    });
  });

  describe('Better Auth Integration', () => {
    it('should handle APIError from Better Auth', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const updateData = {
        name: 'Error Update',
      };

      const apiError = new APIError({
        body: {
          code: 'PERMISSION_DENIED',
          message: 'Permission denied',
        },
      } as any);

      vi.mocked(authBackend.api.updateOrganization).mockRejectedValue(apiError);

      await expect(
        organizationUpdateController(
          { id: organization.id },
          updateData,
          context,
        ),
      ).rejects.toThrow(Error400);
    });

    it('should handle null response from Better Auth', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const updateData = {
        name: 'Null Update',
      };

      vi.mocked(authBackend.api.updateOrganization).mockResolvedValue(
        null as any,
      );

      await expect(
        organizationUpdateController(
          { id: organization.id },
          updateData,
          context,
        ),
      ).rejects.toThrow(dictionary.organization.errors.updateFailed);
    });
  });
});
