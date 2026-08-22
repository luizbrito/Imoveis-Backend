import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { propostaRestoreManyInputSchema } from '../propostaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const propostaRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/proposta/restore',
  query: propostaRestoreManyInputSchema,
};

export const propostaRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'proposta_restore_many',
  description: dictionary.proposta.mcpDescription.restore,
  requiredPermissions: { proposta: ['restore'] },
  schema: toMcpJsonSchema(propostaRestoreManyInputSchema),
  handler: async (params, context) => {
    return await propostaRestoreManyController(params, context);
  },
});

export async function propostaRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      proposta: ['restore'],
    },
    context,
  );

  const { ids } = propostaRestoreManyInputSchema.parse(query);

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
          archivedAt: null,
          archivedByMemberId: null,
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
