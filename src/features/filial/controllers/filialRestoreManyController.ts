import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filialRestoreManyInputSchema } from '../filialSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const filialRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/filial/restore',
  query: filialRestoreManyInputSchema,
};

export const filialRestoreManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'filial_restore_many',
  description: dictionary.filial.mcpDescription.restore,
  requiredPermissions: { filial: ['restore'] },
  schema: toMcpJsonSchema(filialRestoreManyInputSchema),
  handler: async (params, context) => {
    return await filialRestoreManyController(params, context);
  },
});

export async function filialRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      filial: ['restore'],
    },
    context,
  );

  const { ids } = filialRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldFiliais = await tx.filial.findMany({
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

      const result = await tx.filial.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newFiliais = await tx.filial.findMany({
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

      for (const oldFilial of oldFiliais) {
        const newFilial = newFiliais.find((c) => c.id === oldFilial.id);
        await auditLogCreate({
          entityId: oldFilial.id,
          entityName: 'Filial',
          operation: auditLogOperations.update,
          context,
          oldData: oldFilial,
          newData: newFilial,
          tx,
        });
      }

      return result;
    },
  );
}
