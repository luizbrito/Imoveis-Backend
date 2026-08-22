import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { locacaoRestoreManyInputSchema } from '../locacaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const locacaoRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/locacao/restore',
  query: locacaoRestoreManyInputSchema,
};

export const locacaoRestoreManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'locacao_restore_many',
  description: dictionary.locacao.mcpDescription.restore,
  requiredPermissions: { locacao: ['restore'] },
  schema: toMcpJsonSchema(locacaoRestoreManyInputSchema),
  handler: async (params, context) => {
    return await locacaoRestoreManyController(params, context);
  },
});

export async function locacaoRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      locacao: ['restore'],
    },
    context,
  );

  const { ids } = locacaoRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldLocacoes = await tx.locacao.findMany({
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

      const result = await tx.locacao.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newLocacoes = await tx.locacao.findMany({
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

      for (const oldLocacao of oldLocacoes) {
        const newLocacao = newLocacoes.find((c) => c.id === oldLocacao.id);
        await auditLogCreate({
          entityId: oldLocacao.id,
          entityName: 'Locacao',
          operation: auditLogOperations.update,
          context,
          oldData: oldLocacao,
          newData: newLocacao,
          tx,
        });
      }

      return result;
    },
  );
}
