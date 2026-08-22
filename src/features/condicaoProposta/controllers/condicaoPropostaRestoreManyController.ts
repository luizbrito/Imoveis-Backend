import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { condicaoPropostaRestoreManyInputSchema } from '../condicaoPropostaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const condicaoPropostaRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/condicao-proposta/restore',
  query: condicaoPropostaRestoreManyInputSchema,
};

export const condicaoPropostaRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'condicao-proposta_restore_many',
  description: dictionary.condicaoProposta.mcpDescription.restore,
  requiredPermissions: { condicaoProposta: ['restore'] },
  schema: toMcpJsonSchema(condicaoPropostaRestoreManyInputSchema),
  handler: async (params, context) => {
    return await condicaoPropostaRestoreManyController(params, context);
  },
});

export async function condicaoPropostaRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      condicaoProposta: ['restore'],
    },
    context,
  );

  const { ids } = condicaoPropostaRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldCondicoesProposta = await tx.condicaoProposta.findMany({
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

      const result = await tx.condicaoProposta.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newCondicoesProposta = await tx.condicaoProposta.findMany({
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

      for (const oldCondicaoProposta of oldCondicoesProposta) {
        const newCondicaoProposta = newCondicoesProposta.find(
          (c) => c.id === oldCondicaoProposta.id,
        );
        await auditLogCreate({
          entityId: oldCondicaoProposta.id,
          entityName: 'CondicaoProposta',
          operation: auditLogOperations.update,
          context,
          oldData: oldCondicaoProposta,
          newData: newCondicaoProposta,
          tx,
        });
      }

      return result;
    },
  );
}
