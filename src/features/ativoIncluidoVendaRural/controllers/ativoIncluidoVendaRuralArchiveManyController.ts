import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { ativoIncluidoVendaRuralArchiveManyInputSchema as ativoIncluidoVendaRuralArchiveManyInputSchema } from '../ativoIncluidoVendaRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const ativoIncluidoVendaRuralArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/ativo-incluido-venda-rural/archive',
  query: ativoIncluidoVendaRuralArchiveManyInputSchema,
};

export const ativoIncluidoVendaRuralArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'ativo-incluido-venda-rural_archive_many',
  description: dictionary.ativoIncluidoVendaRural.mcpDescription.archive,
  requiredPermissions: { ativoIncluidoVendaRural: ['archive'] },
  schema: toMcpJsonSchema(ativoIncluidoVendaRuralArchiveManyInputSchema),
  handler: async (params, context) => {
    return await ativoIncluidoVendaRuralArchiveManyController(params, context);
  },
});

export async function ativoIncluidoVendaRuralArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      ativoIncluidoVendaRural: ['archive'],
    },
    context,
  );

  const { ids } = ativoIncluidoVendaRuralArchiveManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldAtivosIncluidosVendaRural =
        await tx.ativoIncluidoVendaRural.findMany({
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

      const result = await tx.ativoIncluidoVendaRural.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
        },
      });

      const newAtivosIncluidosVendaRural =
        await tx.ativoIncluidoVendaRural.findMany({
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

      for (const oldAtivoIncluidoVendaRural of oldAtivosIncluidosVendaRural) {
        const newAtivoIncluidoVendaRural = newAtivosIncluidosVendaRural.find(
          (c) => c.id === oldAtivoIncluidoVendaRural.id,
        );
        await auditLogCreate({
          entityId: oldAtivoIncluidoVendaRural.id,
          entityName: 'AtivoIncluidoVendaRural',
          operation: auditLogOperations.update,
          context,
          oldData: oldAtivoIncluidoVendaRural,
          newData: newAtivoIncluidoVendaRural,
          tx,
        });
      }

      return result;
    },
  );
}
