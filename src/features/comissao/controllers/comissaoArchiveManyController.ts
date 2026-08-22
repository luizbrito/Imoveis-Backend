import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { comissaoArchiveManyInputSchema as comissaoArchiveManyInputSchema } from '../comissaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const comissaoArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/comissao/archive',
  query: comissaoArchiveManyInputSchema,
};

export const comissaoArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'comissao_archive_many',
  description: dictionary.comissao.mcpDescription.archive,
  requiredPermissions: { comissao: ['archive'] },
  schema: toMcpJsonSchema(comissaoArchiveManyInputSchema),
  handler: async (params, context) => {
    return await comissaoArchiveManyController(params, context);
  },
});

export async function comissaoArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      comissao: ['archive'],
    },
    context,
  );

  const { ids } = comissaoArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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
