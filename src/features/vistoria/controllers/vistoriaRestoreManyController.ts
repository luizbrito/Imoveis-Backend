import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { vistoriaRestoreManyInputSchema } from '../vistoriaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const vistoriaRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/vistoria/restore',
  query: vistoriaRestoreManyInputSchema,
};

export const vistoriaRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'vistoria_restore_many',
  description: dictionary.vistoria.mcpDescription.restore,
  requiredPermissions: { vistoria: ['restore'] },
  schema: toMcpJsonSchema(vistoriaRestoreManyInputSchema),
  handler: async (params, context) => {
    return await vistoriaRestoreManyController(params, context);
  },
});

export async function vistoriaRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      vistoria: ['restore'],
    },
    context,
  );

  const { ids } = vistoriaRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldVistorias = await tx.vistoria.findMany({
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

      const result = await tx.vistoria.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newVistorias = await tx.vistoria.findMany({
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

      for (const oldVistoria of oldVistorias) {
        const newVistoria = newVistorias.find((c) => c.id === oldVistoria.id);
        await auditLogCreate({
          entityId: oldVistoria.id,
          entityName: 'Vistoria',
          operation: auditLogOperations.update,
          context,
          oldData: oldVistoria,
          newData: newVistoria,
          tx,
        });
      }

      return result;
    },
  );
}
