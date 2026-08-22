import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { producaoHistoricaRuralRestoreManyInputSchema } from '../producaoHistoricaRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const producaoHistoricaRuralRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/producao-historica-rural/restore',
  query: producaoHistoricaRuralRestoreManyInputSchema,
};

export const producaoHistoricaRuralRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'producao-historica-rural_restore_many',
  description: dictionary.producaoHistoricaRural.mcpDescription.restore,
  requiredPermissions: { producaoHistoricaRural: ['restore'] },
  schema: toMcpJsonSchema(producaoHistoricaRuralRestoreManyInputSchema),
  handler: async (params, context) => {
    return await producaoHistoricaRuralRestoreManyController(params, context);
  },
});

export async function producaoHistoricaRuralRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      producaoHistoricaRural: ['restore'],
    },
    context,
  );

  const { ids } = producaoHistoricaRuralRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldProducoesHistoricasRurais =
        await tx.producaoHistoricaRural.findMany({
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

      const result = await tx.producaoHistoricaRural.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newProducoesHistoricasRurais =
        await tx.producaoHistoricaRural.findMany({
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

      for (const oldProducaoHistoricaRural of oldProducoesHistoricasRurais) {
        const newProducaoHistoricaRural = newProducoesHistoricasRurais.find(
          (c) => c.id === oldProducaoHistoricaRural.id,
        );
        await auditLogCreate({
          entityId: oldProducaoHistoricaRural.id,
          entityName: 'ProducaoHistoricaRural',
          operation: auditLogOperations.update,
          context,
          oldData: oldProducaoHistoricaRural,
          newData: newProducaoHistoricaRural,
          tx,
        });
      }

      return result;
    },
  );
}
