import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { propostaArchiveManyInputSchema as propostaArchiveManyInputSchema } from '../propostaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const propostaArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/proposta/archive',
  query: propostaArchiveManyInputSchema,
};

export const propostaArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'proposta_archive_many',
  description: dictionary.proposta.mcpDescription.archive,
  requiredPermissions: { proposta: ['archive'] },
  schema: toMcpJsonSchema(propostaArchiveManyInputSchema),
  handler: async (params, context) => {
    return await propostaArchiveManyController(params, context);
  },
});

export async function propostaArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      proposta: ['archive'],
    },
    context,
  );

  const { ids } = propostaArchiveManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldPropostas = await tx.proposta.findMany({
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

      const result = await tx.proposta.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
        },
      });

      const newPropostas = await tx.proposta.findMany({
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

      for (const oldProposta of oldPropostas) {
        const newProposta = newPropostas.find((c) => c.id === oldProposta.id);
        await auditLogCreate({
          entityId: oldProposta.id,
          entityName: 'Proposta',
          operation: auditLogOperations.update,
          context,
          oldData: oldProposta,
          newData: newProposta,
          tx,
        });
      }

      return result;
    },
  );
}
