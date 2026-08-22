import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { solicitacaoContatoArchiveManyInputSchema as solicitacaoContatoArchiveManyInputSchema } from '../solicitacaoContatoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const solicitacaoContatoArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/solicitacao-contato/archive',
  query: solicitacaoContatoArchiveManyInputSchema,
};

export const solicitacaoContatoArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'solicitacao-contato_archive_many',
  description: dictionary.solicitacaoContato.mcpDescription.archive,
  requiredPermissions: { solicitacaoContato: ['archive'] },
  schema: toMcpJsonSchema(solicitacaoContatoArchiveManyInputSchema),
  handler: async (params, context) => {
    return await solicitacaoContatoArchiveManyController(params, context);
  },
});

export async function solicitacaoContatoArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      solicitacaoContato: ['archive'],
    },
    context,
  );

  const { ids } = solicitacaoContatoArchiveManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldSolicitacoesContato = await tx.solicitacaoContato.findMany({
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

      const result = await tx.solicitacaoContato.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
        },
      });

      const newSolicitacoesContato = await tx.solicitacaoContato.findMany({
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

      for (const oldSolicitacaoContato of oldSolicitacoesContato) {
        const newSolicitacaoContato = newSolicitacoesContato.find(
          (c) => c.id === oldSolicitacaoContato.id,
        );
        await auditLogCreate({
          entityId: oldSolicitacaoContato.id,
          entityName: 'SolicitacaoContato',
          operation: auditLogOperations.update,
          context,
          oldData: oldSolicitacaoContato,
          newData: newSolicitacaoContato,
          tx,
        });
      }

      return result;
    },
  );
}
