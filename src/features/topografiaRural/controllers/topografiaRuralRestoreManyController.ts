import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { topografiaRuralRestoreManyInputSchema } from '../topografiaRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const topografiaRuralRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/topografia-rural/restore',
  query: topografiaRuralRestoreManyInputSchema,
};

export const topografiaRuralRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'topografia-rural_restore_many',
  description: dictionary.topografiaRural.mcpDescription.restore,
  requiredPermissions: { topografiaRural: ['restore'] },
  schema: toMcpJsonSchema(topografiaRuralRestoreManyInputSchema),
  handler: async (params, context) => {
    return await topografiaRuralRestoreManyController(params, context);
  },
});

export async function topografiaRuralRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      topografiaRural: ['restore'],
    },
    context,
  );

  const { ids } = topografiaRuralRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldTopografiasRurais = await tx.topografiaRural.findMany({
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

      const result = await tx.topografiaRural.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newTopografiasRurais = await tx.topografiaRural.findMany({
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

      for (const oldTopografiaRural of oldTopografiasRurais) {
        const newTopografiaRural = newTopografiasRurais.find(
          (c) => c.id === oldTopografiaRural.id,
        );
        await auditLogCreate({
          entityId: oldTopografiaRural.id,
          entityName: 'TopografiaRural',
          operation: auditLogOperations.update,
          context,
          oldData: oldTopografiaRural,
          newData: newTopografiaRural,
          tx,
        });
      }

      return result;
    },
  );
}
