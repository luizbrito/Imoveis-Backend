import { describe, it, expect, beforeEach } from 'vitest';
import { testPrismaClient } from '../../../test/testPrismaClient';
import { createTestUserWithOrganization } from '../../../test/testFactories';
import { createAuthenticatedContext } from '../../../test/testUtils';
import { memberFindController } from '../controllers/memberFindController';

describe('MemberFindController', () => {
  let prisma: ReturnType<typeof testPrismaClient>;

  beforeEach(() => {
    prisma = testPrismaClient();
  });

  it('should find member by ID', async () => {
    const { user, organization, member } =
      await createTestUserWithOrganization();
    const context = createAuthenticatedContext(user, organization, member);

    const result = await memberFindController({ id: member.id }, context);

    expect(result).toBeDefined();
    expect(result?.id).toBe(member.id);
    expect(result?.userId).toBe(user.id);
    expect(result?.organizationId).toBe(organization.id);
  });

  it('should include user relationship', async () => {
    const { user, organization, member } =
      await createTestUserWithOrganization();
    const context = createAuthenticatedContext(user, organization, member);

    const result = await memberFindController({ id: member.id }, context);

    expect(result?.user).toBeDefined();
    expect(result?.user?.id).toBe(user.id);
    expect(result?.user?.email).toBe(user.email);
  });

  it('should return null for non-existent member', async () => {
    const { user, organization, member } =
      await createTestUserWithOrganization();
    const context = createAuthenticatedContext(user, organization, member);

    // Must be valid UUID format
    const nonExistentId = '550e8400-e29b-41d4-a716-999999999999';

    const result = await memberFindController({ id: nonExistentId }, context);

    expect(result).toBeNull();
  });

  it('should enforce organization isolation', async () => {
    const setup1 = await createTestUserWithOrganization();
    const setup2 = await createTestUserWithOrganization();

    const context2 = createAuthenticatedContext(
      setup2.user,
      setup2.organization,
      setup2.member,
    );

    // Try to access member from org1 using org2 context
    const result = await memberFindController(
      { id: setup1.member.id },
      context2,
    );

    expect(result).toBeNull();
  });
});
