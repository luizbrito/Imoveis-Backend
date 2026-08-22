import { Prisma } from '../../../prisma/generated/client';
import { uniq } from 'lodash-es';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { auditLogFindManyInputSchema } from '../auditLogSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const auditLogFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/audit-log',
  query: auditLogFindManyInputSchema,
  response: '{ auditLogs: AuditLogWithAuthor[], count: number }',
};

export const auditLogFindManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'audit_log_list',
  description: dictionary.auditLog.mcpDescription.list,
  requiredPermissions: { auditLog: ['read'] },
  schema: toMcpJsonSchema(auditLogFindManyInputSchema),
  handler: async (params, context) => {
    return await auditLogFindManyController(params, context);
  },
});

export async function auditLogFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      auditLog: ['read'],
    },
    context,
  );

  let { filter, orderBy, skip, take } =
    auditLogFindManyInputSchema.parse(query);

  if (orderBy?.['apiKey_name']) {
    orderBy = {
      apiKey: {
        name: orderBy['apiKey_name'] === 'asc' ? 'asc' : 'desc',
      },
    };
  }

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.AuditLogWhereInput> = [];

      // Defense in depth: explicit organizationId filter + RLS at database level
      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.entityNames?.length) {
        whereAnd.push({
          OR: filter.entityNames?.map((entityName) => ({
            entityName: { equals: entityName, mode: 'insensitive' },
          })),
        });
      }

      if (filter?.member != null) {
        whereAnd.push({
          memberId: filter.member,
        });
      }

      if (filter?.entityId != null) {
        whereAnd.push({
          entityId: filter.entityId,
        });
      }

      if (filter?.apiKey != null) {
        whereAnd.push({
          apiKeyId: filter.apiKey,
        });
      }

      if (filter?.apiHttpResponseCode != null) {
        whereAnd.push({
          apiHttpResponseCode: filter.apiHttpResponseCode,
        });
      }

      if (filter?.apiEndpoint != null) {
        whereAnd.push({
          apiEndpoint: { contains: filter?.apiEndpoint, mode: 'insensitive' },
        });
      }

      if (filter?.operations?.length) {
        whereAnd.push({
          operation: {
            in: filter.operations,
          },
        });
      }

      if (filter?.timestampRange?.length) {
        const start = filter.timestampRange?.[0];
        const end = filter.timestampRange?.[1];

        if (start != null) {
          whereAnd.push({
            timestamp: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            timestamp: {
              lte: end,
            },
          });
        }
      }

      const auditLogs = await tx.auditLog.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
      });

      let authors = await tx.member.findMany({
        where: {
          id: {
            in: uniq(
              auditLogs.map((auditLog) => auditLog.memberId).filter(Boolean),
            ),
          },
          organizationId: currentOrganization.id,
        },
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      });

      const apiKeys = await tx.apiKey.findMany({
        where: {
          id: {
            in: uniq(
              auditLogs.map((auditLog) => auditLog.apiKeyId).filter(Boolean),
            ),
          },
        },
        select: {
          id: true,
          name: true,
        },
      });

      authors = await filePopulateDownloadUrlInTree(authors);

      const auditLogsWithAuthorAndApiKey = auditLogs.map((auditLog) => {
        const apiKey = apiKeys.find(
          (apiKey) => apiKey.id === auditLog.apiKeyId,
        );

        let author = authors.find((author) => author.id === auditLog.memberId);

        return {
          ...auditLog,
          apiKey,
          authorEmail: author?.user?.email,
          authorFirstName: author?.firstName,
          authorLastName: author?.lastName,
          authorAvatars: author?.avatars,
        };
      });

      const count = await tx.auditLog.count({
        where: {
          AND: whereAnd,
        },
      });

      return { auditLogs: auditLogsWithAuthorAndApiKey, count };
    },
  );
}
