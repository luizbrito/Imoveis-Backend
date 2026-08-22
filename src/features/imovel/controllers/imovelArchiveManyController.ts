import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { imovelArchiveManyInputSchema as imovelArchiveManyInputSchema } from '../imovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const imovelArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/imovel/archive',
  query: imovelArchiveManyInputSchema,
};

export const imovelArchiveManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'imovel_archive_many',
  description: dictionary.imovel.mcpDescription.archive,
  requiredPermissions: { imovel: ['archive'] },
  schema: toMcpJsonSchema(imovelArchiveManyInputSchema),
  handler: async (params, context) => {
    return await imovelArchiveManyController(params, context);
  },
});

export async function imovelArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      imovel: ['archive'],
    },
    context,
  );

  const { ids } = imovelArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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
