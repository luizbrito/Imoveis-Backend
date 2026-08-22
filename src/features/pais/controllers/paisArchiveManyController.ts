import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { paisArchiveManyInputSchema as paisArchiveManyInputSchema } from '../paisSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const paisArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/pais/archive',
  query: paisArchiveManyInputSchema,
};

export const paisArchiveManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'pais_archive_many',
  description: dictionary.pais.mcpDescription.archive,
  requiredPermissions: { pais: ['archive'] },
  schema: toMcpJsonSchema(paisArchiveManyInputSchema),
  handler: async (params, context) => {
    return await paisArchiveManyController(params, context);
  },
});

export async function paisArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      pais: ['archive'],
    },
    context,
  );

  const { ids } = paisArchiveManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldPaiss = await tx.pais.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        select: {
          id: true,
          archivedAt: true,
          archivedByMemberId: true,
        },
      });

      const result = await tx.pais.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
        },
      });

      const newPaiss = await tx.pais.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        select: {
          id: true,
          archivedAt: true,
          archivedByMemberId: true,
        },
      });

      for (const oldPais of oldPaiss) {
        const newPais = newPaiss.find((c) => c.id === oldPais.id);
        await auditLogCreate({
          entityId: oldPais.id,
          entityName: 'Pais',
          operation: auditLogOperations.update,
          context,
          oldData: oldPais,
          newData: newPais,
          tx,
        });
      }

      return result;
    },
  );
}
