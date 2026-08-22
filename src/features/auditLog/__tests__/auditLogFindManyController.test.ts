import { describe, it, expect, beforeEach } from 'vitest';
import { testPrismaClient } from '../../../test/testPrismaClient';
import { createTestUserWithOrganization } from '../../../test/testFactories';
import { createAuthenticatedContext } from '../../../test/testUtils';
import { auditLogFindManyController } from '../controllers/auditLogFindManyController';
import { auditLogOperations } from '../auditLogOperations';

describe('AuditLogFindManyController', () => {
  let prisma: ReturnType<typeof testPrismaClient>;

  beforeEach(() => {
    prisma = testPrismaClient();
  });

  describe('Success Cases', () => {
    it('should return all audit logs for organization', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      // Create some audit logs
      await prisma.auditLog.create({
        data: {
          organizationId: organization.id,
          memberId: member.id,
          entityName: 'Filial',
          entityId: '550e8400-e29b-41d4-a716-446655440700',
          operation: auditLogOperations.create,
          timestamp: new Date(),
        },
      });

      const result = await auditLogFindManyController({}, context);

      expect(result.auditLogs).toBeDefined();
      expect(result.count).toBeGreaterThan(0);
      expect(Array.isArray(result.auditLogs)).toBe(true);
    });

    it('should filter by entityName', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      // Create Filial audit log
      await prisma.auditLog.create({
        data: {
          organizationId: organization.id,
          memberId: member.id,
          entityName: 'Filial',
          entityId: '550e8400-e29b-41d4-a716-446655440710',
          operation: auditLogOperations.create,
          timestamp: new Date(),
        },
      });

      // Create Member audit log
      await prisma.auditLog.create({
        data: {
          organizationId: organization.id,
          memberId: member.id,
          entityName: 'Member',
          entityId: '550e8400-e29b-41d4-a716-446655440711',
          operation: auditLogOperations.update,
          timestamp: new Date(),
        },
      });

      const result = await auditLogFindManyController(
        {
          filter: { entityNames: ['Filial'] },
        },
        context,
      );

      expect(result.auditLogs.length).toBeGreaterThan(0);
      expect(result.auditLogs.every((log) => log.entityName === 'Filial')).toBe(
        true,
      );
    });

    it('should filter by member', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      // Create audit log for this member
      await prisma.auditLog.create({
        data: {
          organizationId: organization.id,
          memberId: member.id,
          entityName: 'Filial',
          entityId: '550e8400-e29b-41d4-a716-446655440720',
          operation: auditLogOperations.create,
          timestamp: new Date(),
        },
      });

      const result = await auditLogFindManyController(
        {
          filter: { member: member.id },
        },
        context,
      );

      expect(result.auditLogs.length).toBeGreaterThan(0);
      expect(result.auditLogs.every((log) => log.memberId === member.id)).toBe(
        true,
      );
    });

    it('should filter by entityId', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const entityId = '550e8400-e29b-41d4-a716-446655440730';

      await prisma.auditLog.create({
        data: {
          organizationId: organization.id,
          memberId: member.id,
          entityName: 'Filial',
          entityId,
          operation: auditLogOperations.create,
          timestamp: new Date(),
        },
      });

      const result = await auditLogFindManyController(
        {
          filter: { entityId },
        },
        context,
      );

      expect(result.auditLogs.length).toBeGreaterThan(0);
      expect(result.auditLogs.every((log) => log.entityId === entityId)).toBe(
        true,
      );
    });

    it('should filter by operation', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      // Create logs
      await prisma.auditLog.create({
        data: {
          organizationId: organization.id,
          memberId: member.id,
          entityName: 'Filial',
          entityId: '550e8400-e29b-41d4-a716-446655440740',
          operation: auditLogOperations.create,
          timestamp: new Date(),
        },
      });

      await prisma.auditLog.create({
        data: {
          organizationId: organization.id,
          memberId: member.id,
          entityName: 'Filial',
          entityId: '550e8400-e29b-41d4-a716-446655440741',
          operation: auditLogOperations.update,
          timestamp: new Date(),
        },
      });

      const result = await auditLogFindManyController(
        {
          filter: { operations: [auditLogOperations.create] },
        },
        context,
      );

      expect(result.auditLogs.length).toBeGreaterThan(0);
      expect(
        result.auditLogs.every(
          (log) => log.operation === auditLogOperations.create,
        ),
      ).toBe(true);
    });

    it('should filter by timestamp range', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

      // Create recent log
      await prisma.auditLog.create({
        data: {
          organizationId: organization.id,
          memberId: member.id,
          entityName: 'Filial',
          entityId: '550e8400-e29b-41d4-a716-446655440750',
          operation: auditLogOperations.create,
          timestamp: now,
        },
      });

      // Create old log
      await prisma.auditLog.create({
        data: {
          organizationId: organization.id,
          memberId: member.id,
          entityName: 'Filial',
          entityId: '550e8400-e29b-41d4-a716-446655440751',
          operation: auditLogOperations.create,
          timestamp: twoHoursAgo,
        },
      });

      const result = await auditLogFindManyController(
        {
          filter: { timestampRange: [oneHourAgo, now] },
        },
        context,
      );

      // Should only include recent log
      expect(result.auditLogs.length).toBeGreaterThan(0);
      expect(
        result.auditLogs.every((log) => new Date(log.timestamp) >= oneHourAgo),
      ).toBe(true);
    });

    it('should accept empty/null entries in timestampRange', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      await prisma.auditLog.create({
        data: {
          organizationId: organization.id,
          memberId: member.id,
          entityName: 'Filial',
          entityId: '550e8400-e29b-41d4-a716-446655440752',
          operation: auditLogOperations.create,
          timestamp: new Date(),
        },
      });

      const allEmpty = await auditLogFindManyController(
        { filter: { timestampRange: ['', null] as any } },
        context,
      );
      expect(allEmpty.auditLogs.length).toBeGreaterThan(0);

      const onlyEnd = await auditLogFindManyController(
        { filter: { timestampRange: [null, new Date()] as any } },
        context,
      );
      expect(onlyEnd.auditLogs.length).toBeGreaterThan(0);

      const onlyStart = await auditLogFindManyController(
        {
          filter: {
            timestampRange: [new Date(Date.now() - 60 * 60 * 1000), ''] as any,
          },
        },
        context,
      );
      expect(onlyStart.auditLogs.length).toBeGreaterThan(0);
    });

    it('should support pagination', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      // Create multiple logs
      for (let i = 0; i < 5; i++) {
        await prisma.auditLog.create({
          data: {
            organizationId: organization.id,
            memberId: member.id,
            entityName: 'Filial',
            entityId: `550e8400-e29b-41d4-a716-${String(446655440760 + i).padStart(12, '0')}`,
            operation: auditLogOperations.create,
            timestamp: new Date(Date.now() + i * 1000),
          },
        });
      }

      const result = await auditLogFindManyController(
        {
          skip: 1,
          take: 2,
        },
        context,
      );

      expect(result.auditLogs.length).toBe(2);
      expect(result.count).toBeGreaterThanOrEqual(5);
    });

    it('should include author information', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      await prisma.auditLog.create({
        data: {
          organizationId: organization.id,
          memberId: member.id,
          entityName: 'Filial',
          entityId: '550e8400-e29b-41d4-a716-446655440770',
          operation: auditLogOperations.create,
          timestamp: new Date(),
        },
      });

      const result = await auditLogFindManyController({}, context);

      const logWithAuthor = result.auditLogs.find(
        (log) => log.memberId === member.id,
      );
      expect(logWithAuthor).toBeDefined();
      expect(logWithAuthor?.authorEmail).toBe(user.email);
    });
  });

  describe('Multi-Tenancy', () => {
    it('should only return audit logs from current organization', async () => {
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
          entityId: '550e8400-e29b-41d4-a716-446655440780',
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
          entityId: '550e8400-e29b-41d4-a716-446655440781',
          operation: auditLogOperations.create,
          timestamp: new Date(),
        },
      });

      const result = await auditLogFindManyController({}, context1);

      const orgIds = result.auditLogs.map((log) => log.organizationId);
      expect(orgIds.every((id) => id === setup1.organization.id)).toBe(true);
      expect(orgIds.includes(setup2.organization.id)).toBe(false);
    });
  });
});
