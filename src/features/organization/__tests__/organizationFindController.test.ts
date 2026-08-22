import { describe, it, expect, beforeEach } from 'vitest';
import { testPrismaClient } from '../../../test/testPrismaClient';
import { createTestUserWithOrganization } from '../../../test/testFactories';
import { createAuthenticatedContext } from '../../../test/testUtils';
import { organizationFindController } from '../controllers/organizationFindController';

describe('OrganizationFindController', () => {
  let prisma: ReturnType<typeof testPrismaClient>;

  beforeEach(() => {
    prisma = testPrismaClient();
  });

  it('should find organization by ID', async () => {
    const { user, organization, member } =
      await createTestUserWithOrganization();
    const context = createAuthenticatedContext(user, organization, member);

    const result = await organizationFindController(
      { id: organization.id },
      context,
    );

    expect(result).toBeDefined();
    expect(result.id).toBe(organization.id);
    expect(result.name).toBe(organization.name);
  });

  it('should throw for non-existent organization', async () => {
    const { user, organization, member } =
      await createTestUserWithOrganization();
    const context = createAuthenticatedContext(user, organization, member);

    const nonExistentId = '550e8400-e29b-41d4-a716-999999999999';

    await expect(
      organizationFindController({ id: nonExistentId }, context),
    ).rejects.toThrow();
  });
});
