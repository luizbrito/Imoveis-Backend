import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { seguroImovelRestoreManyInputSchema } from '../seguroImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const seguroImovelRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/seguro-imovel/restore',
  query: seguroImovelRestoreManyInputSchema,
};

export const seguroImovelRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'seguro-imovel_restore_many',
  description: dictionary.seguroImovel.mcpDescription.restore,
  requiredPermissions: { seguroImovel: ['restore'] },
  schema: toMcpJsonSchema(seguroImovelRestoreManyInputSchema),
  handler: async (params, context) => {
    return await seguroImovelRestoreManyController(params, context);
  },
});

export async function seguroImovelRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      seguroImovel: ['restore'],
    },
    context,
  );

  const { ids } = seguroImovelRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldSegurosImovel = await tx.seguroImovel.findMany({
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

      const result = await tx.seguroImovel.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newSegurosImovel = await tx.seguroImovel.findMany({
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

      for (const oldSeguroImovel of oldSegurosImovel) {
        const newSeguroImovel = newSegurosImovel.find(
          (c) => c.id === oldSeguroImovel.id,
        );
        await auditLogCreate({
          entityId: oldSeguroImovel.id,
          entityName: 'SeguroImovel',
          operation: auditLogOperations.update,
          context,
          oldData: oldSeguroImovel,
          newData: newSeguroImovel,
          tx,
        });
      }

      return result;
    },
  );
}
