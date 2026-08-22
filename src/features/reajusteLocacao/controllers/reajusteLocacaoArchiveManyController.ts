import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { reajusteLocacaoArchiveManyInputSchema as reajusteLocacaoArchiveManyInputSchema } from '../reajusteLocacaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const reajusteLocacaoArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/reajuste-locacao/archive',
  query: reajusteLocacaoArchiveManyInputSchema,
};

export const reajusteLocacaoArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'reajuste-locacao_archive_many',
  description: dictionary.reajusteLocacao.mcpDescription.archive,
  requiredPermissions: { reajusteLocacao: ['archive'] },
  schema: toMcpJsonSchema(reajusteLocacaoArchiveManyInputSchema),
  handler: async (params, context) => {
    return await reajusteLocacaoArchiveManyController(params, context);
  },
});

export async function reajusteLocacaoArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      reajusteLocacao: ['archive'],
    },
    context,
  );

  const { ids } = reajusteLocacaoArchiveManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldReajustesLocacao = await tx.reajusteLocacao.findMany({
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

      const result = await tx.reajusteLocacao.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
        },
      });

      const newReajustesLocacao = await tx.reajusteLocacao.findMany({
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

      for (const oldReajusteLocacao of oldReajustesLocacao) {
        const newReajusteLocacao = newReajustesLocacao.find(
          (c) => c.id === oldReajusteLocacao.id,
        );
        await auditLogCreate({
          entityId: oldReajusteLocacao.id,
          entityName: 'ReajusteLocacao',
          operation: auditLogOperations.update,
          context,
          oldData: oldReajusteLocacao,
          newData: newReajusteLocacao,
          tx,
        });
      }

      return result;
    },
  );
}
