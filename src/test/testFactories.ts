import { testPrismaClient } from './testPrismaClient';
import type { User, Organization, Member } from '../prisma/generated/client';

export async function createTestUser(
  overrides: Partial<User> = {},
): Promise<User> {
  const prisma = testPrismaClient();
  const timestamp = Date.now();

  return await prisma.user.create({
    data: {
      email: `test-${timestamp}@example.com`,
      name: 'Test User',
      emailVerified: true,
      ...overrides,
    },
  });
}

export async function createTestOrganization(
  overrides: Partial<Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>> = {},
): Promise<Organization> {
  const prisma = testPrismaClient();
  const timestamp = Date.now();

  return await prisma.organization.create({
    data: {
      name: `Test Organization ${timestamp}`,
      slug: `test-org-${timestamp}`,
      ...overrides,
    } as any,
  });
}

export async function createTestMember(
  userId: string,
  organizationId: string,
  overrides: Partial<Omit<Member, 'id' | 'createdAt' | 'updatedAt'>> = {},
): Promise<Member> {
  const prisma = testPrismaClient();

  return await prisma.member.create({
    data: {
      userId,
      organizationId,
      role: 'admin',
      ...overrides,
    } as any,
  });
}

export async function createTestUserWithOrganization(
  userOverrides: Partial<User> = {},
  orgOverrides: Partial<Organization> = {},
  memberOverrides: Partial<Omit<Member, 'id' | 'createdAt' | 'updatedAt'>> = {},
): Promise<{ user: User; organization: Organization; member: Member }> {
  const user = await createTestUser(userOverrides);
  const organization = await createTestOrganization(orgOverrides);
  const member = await createTestMember(
    user.id,
    organization.id,
    memberOverrides,
  );

  return { user, organization, member };
}

export async function createTestApiKey(
  userId: string,
  overrides: Partial<any> = {},
) {
  const prisma = testPrismaClient();
  const timestamp = Date.now();

  return await prisma.apiKey.create({
    data: {
      name: `Test API Key ${timestamp}`,
      key: 'test-key-hash-' + timestamp,
      prefix: 'test',
      start: 'test',
      referenceId: userId,
      enabled: true,
      ...overrides,
    },
  });
}

export async function createTestAuditLog(
  organizationId: string,
  memberId: string,
  overrides: Partial<any> = {},
) {
  const prisma = testPrismaClient();
  const timestamp = Date.now();

  return await prisma.auditLog.create({
    data: {
      entityName: 'Filial',
      entityId: `entity-${timestamp}`,
      operation: 'create',
      organizationId,
      memberId,
      ...overrides,
    },
  });
}
