import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { solicitacaoManutencaoArchiveManyInputSchema as solicitacaoManutencaoArchiveManyInputSchema } from '../solicitacaoManutencaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const solicitacaoManutencaoArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/solicitacao-manutencao/archive',
  query: solicitacaoManutencaoArchiveManyInputSchema,
};

export const solicitacaoManutencaoArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'solicitacao-manutencao_archive_many',
  description: dictionary.solicitacaoManutencao.mcpDescription.archive,
  requiredPermissions: { solicitacaoManutencao: ['archive'] },
  schema: toMcpJsonSchema(solicitacaoManutencaoArchiveManyInputSchema),
  handler: async (params, context) => {
    return await solicitacaoManutencaoArchiveManyController(params, context);
  },
});

export async function solicitacaoManutencaoArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      solicitacaoManutencao: ['archive'],
    },
    context,
  );

  const { ids } = solicitacaoManutencaoArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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
