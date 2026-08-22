import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { garantiaLocacaoRestoreManyInputSchema } from '../garantiaLocacaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const garantiaLocacaoRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/garantia-locacao/restore',
  query: garantiaLocacaoRestoreManyInputSchema,
};

export const garantiaLocacaoRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'garantia-locacao_restore_many',
  description: dictionary.garantiaLocacao.mcpDescription.restore,
  requiredPermissions: { garantiaLocacao: ['restore'] },
  schema: toMcpJsonSchema(garantiaLocacaoRestoreManyInputSchema),
  handler: async (params, context) => {
    return await garantiaLocacaoRestoreManyController(params, context);
  },
});

export async function garantiaLocacaoRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      garantiaLocacao: ['restore'],
    },
    context,
  );

  const { ids } = garantiaLocacaoRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldGarantiasLocacao = await tx.garantiaLocacao.findMany({
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

      const result = await tx.garantiaLocacao.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newGarantiasLocacao = await tx.garantiaLocacao.findMany({
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

      for (const oldGarantiaLocacao of oldGarantiasLocacao) {
        const newGarantiaLocacao = newGarantiasLocacao.find(
          (c) => c.id === oldGarantiaLocacao.id,
        );
        await auditLogCreate({
          entityId: oldGarantiaLocacao.id,
          entityName: 'GarantiaLocacao',
          operation: auditLogOperations.update,
          context,
          oldData: oldGarantiaLocacao,
          newData: newGarantiaLocacao,
          tx,
        });
      }

      return result;
    },
  );
}
