import { describe, it, expect, beforeEach } from 'vitest';
import { testPrismaClient } from '../../../test/testPrismaClient';
import { createTestUserWithOrganization } from '../../../test/testFactories';
import { createAuthenticatedContext } from '../../../test/testUtils';
import { memberUpdateController } from '../controllers/memberUpdateController';
import { Error400 } from '../../../shared/errors/Error400';

describe('MemberUpdateController', () => {
  let prisma: ReturnType<typeof testPrismaClient>;

  beforeEach(() => {
    prisma = testPrismaClient();
  });

  describe('Success Cases', () => {
    it('should update member firstName and lastName', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const updateData = {
        firstName: 'UpdatedFirst',
        lastName: 'UpdatedLast',
        role: member.role,
      };

      const result = await memberUpdateController(
        { id: member.id },
        updateData,
        context,
      );

      expect(result.firstName).toBe('UpdatedFirst');
      expect(result.lastName).toBe('UpdatedLast');
      expect(result.fullName).toBe('UpdatedFirst UpdatedLast');
    });

    it('should update member role', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization({}, {}, { role: 'admin' });

      // Create a regular member (not admin)
      const memberUser = await prisma.user.create({
        data: {
          email: `member-${Date.now()}@example.com`,
          emailVerified: true,
        },
      });

      const regularMember = await prisma.member.create({
        data: {
          userId: memberUser.id,
          organizationId: organization.id,
          role: 'member',
          fullName: 'Regular Member',
        },
      });

      // Use admin context to update member role
      const context = createAuthenticatedContext(user, organization, member);

      const updateData = {
        role: 'admin' as const,
      };

      const result = await memberUpdateController(
        { id: regularMember.id },
        updateData,
        context,
      );

      expect(result).toBeDefined();
      expect(result.role).toBe('admin');
    });

    it('should update avatars', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const updateData = {
        avatars: [
          {
            key: 'avatar1.jpg',
            name: 'avatar1.jpg',
            size: 1024,
            type: 'image/jpeg',
          },
          {
            key: 'avatar2.jpg',
            name: 'avatar2.jpg',
            size: 2048,
            type: 'image/jpeg',
          },
        ],
        role: member.role,
      };

      const result = await memberUpdateController(
        { id: member.id },
        updateData,
        context,
      );

      // Avatars are transformed by filePopulateDownloadUrlInTree
      expect(result.avatars).toBeDefined();
      expect(Array.isArray(result.avatars)).toBe(true);
      expect((result.avatars as any[]).length).toBe(2);
    });
  });

  describe('Validation', () => {
    it('should prevent member from removing own admin role', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization({}, {}, { role: 'admin' });
      const context = createAuthenticatedContext(user, organization, member);

      const updateData = {
        role: 'member' as const,
      };

      await expect(
        memberUpdateController({ id: member.id }, updateData, context),
      ).rejects.toThrow(Error400);
    });
  });

  describe('Multi-Tenancy', () => {
    it('should enforce organization isolation', async () => {
      const setup1 = await createTestUserWithOrganization();
      const setup2 = await createTestUserWithOrganization();

      const context2 = createAuthenticatedContext(
        setup2.user,
        setup2.organization,
        setup2.member,
      );

      const updateData = {
        firstName: 'Hacker',
        role: setup1.member.role,
      };

      await expect(
        memberUpdateController({ id: setup1.member.id }, updateData, context2),
      ).rejects.toThrow();
    });
  });
});
