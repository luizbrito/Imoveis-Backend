import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { divisaoOperacionalRuralArchiveManyInputSchema as divisaoOperacionalRuralArchiveManyInputSchema } from '../divisaoOperacionalRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const divisaoOperacionalRuralArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/divisao-operacional-rural/archive',
  query: divisaoOperacionalRuralArchiveManyInputSchema,
};

export const divisaoOperacionalRuralArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'divisao-operacional-rural_archive_many',
  description: dictionary.divisaoOperacionalRural.mcpDescription.archive,
  requiredPermissions: { divisaoOperacionalRural: ['archive'] },
  schema: toMcpJsonSchema(divisaoOperacionalRuralArchiveManyInputSchema),
  handler: async (params, context) => {
    return await divisaoOperacionalRuralArchiveManyController(params, context);
  },
});

export async function divisaoOperacionalRuralArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      divisaoOperacionalRural: ['archive'],
    },
    context,
  );

  const { ids } = divisaoOperacionalRuralArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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
