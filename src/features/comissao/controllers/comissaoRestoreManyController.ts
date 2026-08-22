import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { comissaoRestoreManyInputSchema } from '../comissaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const comissaoRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/comissao/restore',
  query: comissaoRestoreManyInputSchema,
};

export const comissaoRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'comissao_restore_many',
  description: dictionary.comissao.mcpDescription.restore,
  requiredPermissions: { comissao: ['restore'] },
  schema: toMcpJsonSchema(comissaoRestoreManyInputSchema),
  handler: async (params, context) => {
    return await comissaoRestoreManyController(params, context);
  },
});

export async function comissaoRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      comissao: ['restore'],
    },
    context,
  );

  const { ids } = comissaoRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldComissoes = await tx.comissao.findMany({
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

      const result = await tx.comissao.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newComissoes = await tx.comissao.findMany({
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

      for (const oldComissao of oldComissoes) {
        const newComissao = newComissoes.find((c) => c.id === oldComissao.id);
        await auditLogCreate({
          entityId: oldComissao.id,
          entityName: 'Comissao',
          operation: auditLogOperations.update,
          context,
          oldData: oldComissao,
          newData: newComissao,
          tx,
        });
      }

      return result;
    },
  );
}
