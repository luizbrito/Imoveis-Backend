import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { divisaoOperacionalRuralRestoreManyInputSchema } from '../divisaoOperacionalRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const divisaoOperacionalRuralRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/divisao-operacional-rural/restore',
  query: divisaoOperacionalRuralRestoreManyInputSchema,
};

export const divisaoOperacionalRuralRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'divisao-operacional-rural_restore_many',
  description: dictionary.divisaoOperacionalRural.mcpDescription.restore,
  requiredPermissions: { divisaoOperacionalRural: ['restore'] },
  schema: toMcpJsonSchema(divisaoOperacionalRuralRestoreManyInputSchema),
  handler: async (params, context) => {
    return await divisaoOperacionalRuralRestoreManyController(params, context);
  },
});

export async function divisaoOperacionalRuralRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      divisaoOperacionalRural: ['restore'],
    },
    context,
  );

  const { ids } = divisaoOperacionalRuralRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldDivisoesOperacionaisRurais =
        await tx.divisaoOperacionalRural.findMany({
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

      const result = await tx.divisaoOperacionalRural.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newDivisoesOperacionaisRurais =
        await tx.divisaoOperacionalRural.findMany({
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

      for (const oldDivisaoOperacionalRural of oldDivisoesOperacionaisRurais) {
        const newDivisaoOperacionalRural = newDivisoesOperacionaisRurais.find(
          (c) => c.id === oldDivisaoOperacionalRural.id,
        );
        await auditLogCreate({
          entityId: oldDivisaoOperacionalRural.id,
          entityName: 'DivisaoOperacionalRural',
          operation: auditLogOperations.update,
          context,
          oldData: oldDivisaoOperacionalRural,
          newData: newDivisaoOperacionalRural,
          tx,
        });
      }

      return result;
    },
  );
}
