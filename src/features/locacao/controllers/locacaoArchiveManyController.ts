import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { locacaoArchiveManyInputSchema as locacaoArchiveManyInputSchema } from '../locacaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const locacaoArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/locacao/archive',
  query: locacaoArchiveManyInputSchema,
};

export const locacaoArchiveManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'locacao_archive_many',
  description: dictionary.locacao.mcpDescription.archive,
  requiredPermissions: { locacao: ['archive'] },
  schema: toMcpJsonSchema(locacaoArchiveManyInputSchema),
  handler: async (params, context) => {
    return await locacaoArchiveManyController(params, context);
  },
});

export async function locacaoArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      locacao: ['archive'],
    },
    context,
  );

  const { ids } = locacaoArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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
