import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { contratoLocacaoRestoreManyInputSchema } from '../contratoLocacaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const contratoLocacaoRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/contrato-locacao/restore',
  query: contratoLocacaoRestoreManyInputSchema,
};

export const contratoLocacaoRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'contrato-locacao_restore_many',
  description: dictionary.contratoLocacao.mcpDescription.restore,
  requiredPermissions: { contratoLocacao: ['restore'] },
  schema: toMcpJsonSchema(contratoLocacaoRestoreManyInputSchema),
  handler: async (params, context) => {
    return await contratoLocacaoRestoreManyController(params, context);
  },
});

export async function contratoLocacaoRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      contratoLocacao: ['restore'],
    },
    context,
  );

  const { ids } = contratoLocacaoRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldContratosLocacao = await tx.contratoLocacao.findMany({
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

      const result = await tx.contratoLocacao.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newContratosLocacao = await tx.contratoLocacao.findMany({
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

      for (const oldContratoLocacao of oldContratosLocacao) {
        const newContratoLocacao = newContratosLocacao.find(
          (c) => c.id === oldContratoLocacao.id,
        );
        await auditLogCreate({
          entityId: oldContratoLocacao.id,
          entityName: 'ContratoLocacao',
          operation: auditLogOperations.update,
          context,
          oldData: oldContratoLocacao,
          newData: newContratoLocacao,
          tx,
        });
      }

      return result;
    },
  );
}
