import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { reajusteLocacaoRestoreManyInputSchema } from '../reajusteLocacaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const reajusteLocacaoRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/reajuste-locacao/restore',
  query: reajusteLocacaoRestoreManyInputSchema,
};

export const reajusteLocacaoRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'reajuste-locacao_restore_many',
  description: dictionary.reajusteLocacao.mcpDescription.restore,
  requiredPermissions: { reajusteLocacao: ['restore'] },
  schema: toMcpJsonSchema(reajusteLocacaoRestoreManyInputSchema),
  handler: async (params, context) => {
    return await reajusteLocacaoRestoreManyController(params, context);
  },
});

export async function reajusteLocacaoRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      reajusteLocacao: ['restore'],
    },
    context,
  );

  const { ids } = reajusteLocacaoRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldReajustesLocacao = await tx.reajusteLocacao.findMany({
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

      const result = await tx.reajusteLocacao.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newReajustesLocacao = await tx.reajusteLocacao.findMany({
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

      for (const oldReajusteLocacao of oldReajustesLocacao) {
        const newReajusteLocacao = newReajustesLocacao.find(
          (c) => c.id === oldReajusteLocacao.id,
        );
        await auditLogCreate({
          entityId: oldReajusteLocacao.id,
          entityName: 'ReajusteLocacao',
          operation: auditLogOperations.update,
          context,
          oldData: oldReajusteLocacao,
          newData: newReajusteLocacao,
          tx,
        });
      }

      return result;
    },
  );
}
