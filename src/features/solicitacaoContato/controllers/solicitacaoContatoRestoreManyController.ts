import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { solicitacaoContatoRestoreManyInputSchema } from '../solicitacaoContatoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const solicitacaoContatoRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/solicitacao-contato/restore',
  query: solicitacaoContatoRestoreManyInputSchema,
};

export const solicitacaoContatoRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'solicitacao-contato_restore_many',
  description: dictionary.solicitacaoContato.mcpDescription.restore,
  requiredPermissions: { solicitacaoContato: ['restore'] },
  schema: toMcpJsonSchema(solicitacaoContatoRestoreManyInputSchema),
  handler: async (params, context) => {
    return await solicitacaoContatoRestoreManyController(params, context);
  },
});

export async function solicitacaoContatoRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      solicitacaoContato: ['restore'],
    },
    context,
  );

  const { ids } = solicitacaoContatoRestoreManyInputSchema.parse(query);

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
          archivedAt: null,
          archivedByMemberId: null,
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
