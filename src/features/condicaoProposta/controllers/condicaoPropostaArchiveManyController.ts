import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { condicaoPropostaArchiveManyInputSchema as condicaoPropostaArchiveManyInputSchema } from '../condicaoPropostaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const condicaoPropostaArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/condicao-proposta/archive',
  query: condicaoPropostaArchiveManyInputSchema,
};

export const condicaoPropostaArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'condicao-proposta_archive_many',
  description: dictionary.condicaoProposta.mcpDescription.archive,
  requiredPermissions: { condicaoProposta: ['archive'] },
  schema: toMcpJsonSchema(condicaoPropostaArchiveManyInputSchema),
  handler: async (params, context) => {
    return await condicaoPropostaArchiveManyController(params, context);
  },
});

export async function condicaoPropostaArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      condicaoProposta: ['archive'],
    },
    context,
  );

  const { ids } = condicaoPropostaArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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
