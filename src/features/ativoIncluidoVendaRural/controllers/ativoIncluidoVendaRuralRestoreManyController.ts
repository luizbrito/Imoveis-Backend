import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { ativoIncluidoVendaRuralRestoreManyInputSchema } from '../ativoIncluidoVendaRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const ativoIncluidoVendaRuralRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/ativo-incluido-venda-rural/restore',
  query: ativoIncluidoVendaRuralRestoreManyInputSchema,
};

export const ativoIncluidoVendaRuralRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'ativo-incluido-venda-rural_restore_many',
  description: dictionary.ativoIncluidoVendaRural.mcpDescription.restore,
  requiredPermissions: { ativoIncluidoVendaRural: ['restore'] },
  schema: toMcpJsonSchema(ativoIncluidoVendaRuralRestoreManyInputSchema),
  handler: async (params, context) => {
    return await ativoIncluidoVendaRuralRestoreManyController(params, context);
  },
});

export async function ativoIncluidoVendaRuralRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      ativoIncluidoVendaRural: ['restore'],
    },
    context,
  );

  const { ids } = ativoIncluidoVendaRuralRestoreManyInputSchema.parse(query);

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
          archivedAt: null,
          archivedByMemberId: null,
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
