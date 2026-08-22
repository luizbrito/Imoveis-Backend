import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { condicaoComercialRuralArchiveManyInputSchema as condicaoComercialRuralArchiveManyInputSchema } from '../condicaoComercialRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const condicaoComercialRuralArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/condicao-comercial-rural/archive',
  query: condicaoComercialRuralArchiveManyInputSchema,
};

export const condicaoComercialRuralArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'condicao-comercial-rural_archive_many',
  description: dictionary.condicaoComercialRural.mcpDescription.archive,
  requiredPermissions: { condicaoComercialRural: ['archive'] },
  schema: toMcpJsonSchema(condicaoComercialRuralArchiveManyInputSchema),
  handler: async (params, context) => {
    return await condicaoComercialRuralArchiveManyController(params, context);
  },
});

export async function condicaoComercialRuralArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      condicaoComercialRural: ['archive'],
    },
    context,
  );

  const { ids } = condicaoComercialRuralArchiveManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldCondicoesComerciaisRurais =
        await tx.condicaoComercialRural.findMany({
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

      const result = await tx.condicaoComercialRural.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
        },
      });

      const newCondicoesComerciaisRurais =
        await tx.condicaoComercialRural.findMany({
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

      for (const oldCondicaoComercialRural of oldCondicoesComerciaisRurais) {
        const newCondicaoComercialRural = newCondicoesComerciaisRurais.find(
          (c) => c.id === oldCondicaoComercialRural.id,
        );
        await auditLogCreate({
          entityId: oldCondicaoComercialRural.id,
          entityName: 'CondicaoComercialRural',
          operation: auditLogOperations.update,
          context,
          oldData: oldCondicaoComercialRural,
          newData: newCondicaoComercialRural,
          tx,
        });
      }

      return result;
    },
  );
}
