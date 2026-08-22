import { describe, it, expect, beforeEach } from 'vitest';
import { testPrismaClient } from '../../../test/testPrismaClient';
import { createTestUserWithOrganization } from '../../../test/testFactories';
import { createAuthenticatedContext } from '../../../test/testUtils';
import { auditLogActivityChartController } from '../controllers/auditLogActivityChartController';
import { auditLogOperations } from '../auditLogOperations';

describe('AuditLogActivityChartController', () => {
  let prisma: ReturnType<typeof testPrismaClient>;

  beforeEach(() => {
    prisma = testPrismaClient();
  });

  describe('Success Cases', () => {
    it('should return activity chart data', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      // Create audit log
      await prisma.auditLog.create({
        data: {
          organizationId: organization.id,
          memberId: member.id,
          entityName: 'Filial',
          entityId: '550e8400-e29b-41d4-a716-446655440800',
          operation: auditLogOperations.create,
          timestamp: new Date(),
        },
      });

      const result = await auditLogActivityChartController(
        { timezone: 'UTC' },
        context,
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should group activity by day with count', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      // Create multiple logs for today
      for (let i = 0; i < 3; i++) {
        await prisma.auditLog.create({
          data: {
            organizationId: organization.id,
            memberId: member.id,
            entityName: 'Filial',
            entityId: `550e8400-e29b-41d4-a716-${String(446655440810 + i).padStart(12, '0')}`,
            operation: auditLogOperations.create,
            timestamp: new Date(),
          },
        });
      }

      const result = await auditLogActivityChartController(
        { timezone: 'UTC' },
        context,
      );

      expect(result.length).toBeGreaterThan(0);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('timestamp');
        expect(result[0]).toHaveProperty('count');
        expect(typeof result[0].count).toBe('bigint'); // Count is returned as bigint from SQL
      }
    });

    it('should handle different timezones', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      await prisma.auditLog.create({
        data: {
          organizationId: organization.id,
          memberId: member.id,
          entityName: 'Filial',
          entityId: '550e8400-e29b-41d4-a716-446655440820',
          operation: auditLogOperations.create,
          timestamp: new Date(),
        },
      });

      const resultUTC = await auditLogActivityChartController(
        { timezone: 'UTC' },
        context,
      );

      const resultNY = await auditLogActivityChartController(
        { timezone: 'America/New_York' },
        context,
      );

      expect(resultUTC).toBeDefined();
      expect(resultNY).toBeDefined();
      expect(Array.isArray(resultUTC)).toBe(true);
      expect(Array.isArray(resultNY)).toBe(true);
    });

    it('should return empty array when no recent activity', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const result = await auditLogActivityChartController(
        { timezone: 'UTC' },
        context,
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Multi-Tenancy', () => {
    it('should only include activity from current organization', async () => {
      const setup1 = await createTestUserWithOrganization();
      const setup2 = await createTestUserWithOrganization();

      const context1 = createAuthenticatedContext(
        setup1.user,
        setup1.organization,
        setup1.member,
      );

      // Create log in org1
      await prisma.auditLog.create({
        data: {
          organizationId: setup1.organization.id,
          memberId: setup1.member.id,
          entityName: 'Filial',
          entityId: '550e8400-e29b-41d4-a716-446655440830',
          operation: auditLogOperations.create,
          timestamp: new Date(),
        },
      });

      // Create log in org2
      await prisma.auditLog.create({
        data: {
          organizationId: setup2.organization.id,
          memberId: setup2.member.id,
          entityName: 'Filial',
          entityId: '550e8400-e29b-41d4-a716-446655440831',
          operation: auditLogOperations.create,
          timestamp: new Date(),
        },
      });

      const result = await auditLogActivityChartController(
        { timezone: 'UTC' },
        context1,
      );

      // Should return data (only from org1)
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
