import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { tipoSoloRestoreManyInputSchema } from '../tipoSoloSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const tipoSoloRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/tipo-solo/restore',
  query: tipoSoloRestoreManyInputSchema,
};

export const tipoSoloRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'tipo-solo_restore_many',
  description: dictionary.tipoSolo.mcpDescription.restore,
  requiredPermissions: { tipoSolo: ['restore'] },
  schema: toMcpJsonSchema(tipoSoloRestoreManyInputSchema),
  handler: async (params, context) => {
    return await tipoSoloRestoreManyController(params, context);
  },
});

export async function tipoSoloRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      tipoSolo: ['restore'],
    },
    context,
  );

  const { ids } = tipoSoloRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldTiposSolo = await tx.tipoSolo.findMany({
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

      const result = await tx.tipoSolo.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newTiposSolo = await tx.tipoSolo.findMany({
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

      for (const oldTipoSolo of oldTiposSolo) {
        const newTipoSolo = newTiposSolo.find((c) => c.id === oldTipoSolo.id);
        await auditLogCreate({
          entityId: oldTipoSolo.id,
          entityName: 'TipoSolo',
          operation: auditLogOperations.update,
          context,
          oldData: oldTipoSolo,
          newData: newTipoSolo,
          tx,
        });
      }

      return result;
    },
  );
}
