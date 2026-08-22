import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { condicaoComercialRuralRestoreManyInputSchema } from '../condicaoComercialRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const condicaoComercialRuralRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/condicao-comercial-rural/restore',
  query: condicaoComercialRuralRestoreManyInputSchema,
};

export const condicaoComercialRuralRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'condicao-comercial-rural_restore_many',
  description: dictionary.condicaoComercialRural.mcpDescription.restore,
  requiredPermissions: { condicaoComercialRural: ['restore'] },
  schema: toMcpJsonSchema(condicaoComercialRuralRestoreManyInputSchema),
  handler: async (params, context) => {
    return await condicaoComercialRuralRestoreManyController(params, context);
  },
});

export async function condicaoComercialRuralRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      condicaoComercialRural: ['restore'],
    },
    context,
  );

  const { ids } = condicaoComercialRuralRestoreManyInputSchema.parse(query);

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
          archivedAt: null,
          archivedByMemberId: null,
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
