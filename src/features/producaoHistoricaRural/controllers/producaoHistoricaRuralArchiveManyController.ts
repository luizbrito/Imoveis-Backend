import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { producaoHistoricaRuralArchiveManyInputSchema as producaoHistoricaRuralArchiveManyInputSchema } from '../producaoHistoricaRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const producaoHistoricaRuralArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/producao-historica-rural/archive',
  query: producaoHistoricaRuralArchiveManyInputSchema,
};

export const producaoHistoricaRuralArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'producao-historica-rural_archive_many',
  description: dictionary.producaoHistoricaRural.mcpDescription.archive,
  requiredPermissions: { producaoHistoricaRural: ['archive'] },
  schema: toMcpJsonSchema(producaoHistoricaRuralArchiveManyInputSchema),
  handler: async (params, context) => {
    return await producaoHistoricaRuralArchiveManyController(params, context);
  },
});

export async function producaoHistoricaRuralArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      producaoHistoricaRural: ['archive'],
    },
    context,
  );

  const { ids } = producaoHistoricaRuralArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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
