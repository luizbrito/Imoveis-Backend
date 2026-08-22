import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { topografiaRuralArchiveManyInputSchema as topografiaRuralArchiveManyInputSchema } from '../topografiaRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const topografiaRuralArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/topografia-rural/archive',
  query: topografiaRuralArchiveManyInputSchema,
};

export const topografiaRuralArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'topografia-rural_archive_many',
  description: dictionary.topografiaRural.mcpDescription.archive,
  requiredPermissions: { topografiaRural: ['archive'] },
  schema: toMcpJsonSchema(topografiaRuralArchiveManyInputSchema),
  handler: async (params, context) => {
    return await topografiaRuralArchiveManyController(params, context);
  },
});

export async function topografiaRuralArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      topografiaRural: ['archive'],
    },
    context,
  );

  const { ids } = topografiaRuralArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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
