import { prisma, prismaDangerouslyBypassRLS } from '../../prisma';
import { AppContext } from '../../shared/controller/appContext';
import { auditLogOperations } from './auditLogOperations';

type AuditLogCreateParams = {
  entityId: string;
  entityName: string;
  operation: (typeof auditLogOperations)[keyof typeof auditLogOperations];
  oldData?: any;
  newData?: any;
  tx?: any; // Prisma transaction client
} & (
  | {
      context: AppContext;
      organizationId?: never;
      userId?: never;
      memberId?: never;
      apiKeyId?: never;
    }
  | {
      context?: never;
      organizationId?: string | null;
      userId?: string | null;
      memberId?: string | null;
      apiKeyId?: string | null;
    }
);

/**
 * Recursively cleans objects for JSON serialization:
 * - Removes downloadUrl properties (security: signed URLs shouldn't be logged)
 * - Converts Date objects to ISO strings (Date.prototype has no enumerable props)
 * - Converts Decimal objects to strings (Prisma Decimal isn't JSON-serializable)
 */
function sanitizeForJsonField(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (obj instanceof Date) {
    return obj.toISOString();
  }

  if (obj?.constructor?.name === 'Decimal') {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeForJsonField(item));
  }

  if (typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      if (key !== 'downloadUrl') {
        newObj[key] = sanitizeForJsonField(obj[key]);
      }
    }
    return newObj;
  }

  return obj;
}

/**
 * Creates an audit log entry
 * @param params - Audit log parameters
 * @returns Promise that resolves when audit log is created
 */
export async function auditLogCreate(
  params: AuditLogCreateParams,
): Promise<void> {
  const { entityId, entityName, operation, oldData, newData, tx } = params;

  let organizationId: string | null;
  let userId: string | null;
  let memberId: string | null;
  let apiKeyId: string | null;

  if ('context' in params && params.context) {
    organizationId = params.context.currentOrganization?.id ?? null;
    userId = params.context.currentUser?.id ?? null;
    memberId = params.context.currentMember?.id ?? null;
    apiKeyId = params.context.apiKey?.id ?? null;
  } else {
    organizationId = params.organizationId ?? null;
    userId = params.userId ?? null;
    memberId = params.memberId ?? null;
    apiKeyId = params.apiKeyId ?? null;
  }

  const auditLogData = {
    entityId,
    entityName,
    organizationId,
    userId,
    memberId,
    apiKeyId,
    operation,
    oldData: sanitizeForJsonField(oldData) as any,
    newData: sanitizeForJsonField(newData) as any,
    timestamp: new Date(),
  };

  if (tx) {
    await tx.auditLog.create({ data: auditLogData });
  } else {
    await prismaDangerouslyBypassRLS.auditLog.create({ data: auditLogData });
  }
}
