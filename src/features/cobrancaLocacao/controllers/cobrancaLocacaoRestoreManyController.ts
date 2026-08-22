import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { cobrancaLocacaoRestoreManyInputSchema } from '../cobrancaLocacaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const cobrancaLocacaoRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/cobranca-locacao/restore',
  query: cobrancaLocacaoRestoreManyInputSchema,
};

export const cobrancaLocacaoRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'cobranca-locacao_restore_many',
  description: dictionary.cobrancaLocacao.mcpDescription.restore,
  requiredPermissions: { cobrancaLocacao: ['restore'] },
  schema: toMcpJsonSchema(cobrancaLocacaoRestoreManyInputSchema),
  handler: async (params, context) => {
    return await cobrancaLocacaoRestoreManyController(params, context);
  },
});

export async function cobrancaLocacaoRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      cobrancaLocacao: ['restore'],
    },
    context,
  );

  const { ids } = cobrancaLocacaoRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldCobrancasLocacao = await tx.cobrancaLocacao.findMany({
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

      const result = await tx.cobrancaLocacao.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newCobrancasLocacao = await tx.cobrancaLocacao.findMany({
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

      for (const oldCobrancaLocacao of oldCobrancasLocacao) {
        const newCobrancaLocacao = newCobrancasLocacao.find(
          (c) => c.id === oldCobrancaLocacao.id,
        );
        await auditLogCreate({
          entityId: oldCobrancaLocacao.id,
          entityName: 'CobrancaLocacao',
          operation: auditLogOperations.update,
          context,
          oldData: oldCobrancaLocacao,
          newData: newCobrancaLocacao,
          tx,
        });
      }

      return result;
    },
  );
}
