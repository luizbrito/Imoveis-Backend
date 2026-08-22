import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { imovelRestoreManyInputSchema } from '../imovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const imovelRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/imovel/restore',
  query: imovelRestoreManyInputSchema,
};

export const imovelRestoreManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'imovel_restore_many',
  description: dictionary.imovel.mcpDescription.restore,
  requiredPermissions: { imovel: ['restore'] },
  schema: toMcpJsonSchema(imovelRestoreManyInputSchema),
  handler: async (params, context) => {
    return await imovelRestoreManyController(params, context);
  },
});

export async function imovelRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      imovel: ['restore'],
    },
    context,
  );

  const { ids } = imovelRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldImoveis = await tx.imovel.findMany({
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

      const result = await tx.imovel.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newImoveis = await tx.imovel.findMany({
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

      for (const oldImovel of oldImoveis) {
        const newImovel = newImoveis.find((c) => c.id === oldImovel.id);
        await auditLogCreate({
          entityId: oldImovel.id,
          entityName: 'Imovel',
          operation: auditLogOperations.update,
          context,
          oldData: oldImovel,
          newData: newImovel,
          tx,
        });
      }

      return result;
    },
  );
}
