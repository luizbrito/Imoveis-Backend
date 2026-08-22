import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { solicitacaoManutencaoRestoreManyInputSchema } from '../solicitacaoManutencaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const solicitacaoManutencaoRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/solicitacao-manutencao/restore',
  query: solicitacaoManutencaoRestoreManyInputSchema,
};

export const solicitacaoManutencaoRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'solicitacao-manutencao_restore_many',
  description: dictionary.solicitacaoManutencao.mcpDescription.restore,
  requiredPermissions: { solicitacaoManutencao: ['restore'] },
  schema: toMcpJsonSchema(solicitacaoManutencaoRestoreManyInputSchema),
  handler: async (params, context) => {
    return await solicitacaoManutencaoRestoreManyController(params, context);
  },
});

export async function solicitacaoManutencaoRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      solicitacaoManutencao: ['restore'],
    },
    context,
  );

  const { ids } = solicitacaoManutencaoRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldSolicitacoesManutencao = await tx.solicitacaoManutencao.findMany(
        {
          where: {
            id: { in: ids },
            organizationId: currentOrganization.id,
          },
          select: {
            id: true,
            archivedAt: true,
            archivedByMemberId: true,
          },
        },
      );

      const result = await tx.solicitacaoManutencao.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newSolicitacoesManutencao = await tx.solicitacaoManutencao.findMany(
        {
          where: {
            id: { in: ids },
            organizationId: currentOrganization.id,
          },
          select: {
            id: true,
            archivedAt: true,
            archivedByMemberId: true,
          },
        },
      );

      for (const oldSolicitacaoManutencao of oldSolicitacoesManutencao) {
        const newSolicitacaoManutencao = newSolicitacoesManutencao.find(
          (c) => c.id === oldSolicitacaoManutencao.id,
        );
        await auditLogCreate({
          entityId: oldSolicitacaoManutencao.id,
          entityName: 'SolicitacaoManutencao',
          operation: auditLogOperations.update,
          context,
          oldData: oldSolicitacaoManutencao,
          newData: newSolicitacaoManutencao,
          tx,
        });
      }

      return result;
    },
  );
}
