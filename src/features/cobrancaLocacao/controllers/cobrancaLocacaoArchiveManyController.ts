import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { cobrancaLocacaoArchiveManyInputSchema as cobrancaLocacaoArchiveManyInputSchema } from '../cobrancaLocacaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const cobrancaLocacaoArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/cobranca-locacao/archive',
  query: cobrancaLocacaoArchiveManyInputSchema,
};

export const cobrancaLocacaoArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'cobranca-locacao_archive_many',
  description: dictionary.cobrancaLocacao.mcpDescription.archive,
  requiredPermissions: { cobrancaLocacao: ['archive'] },
  schema: toMcpJsonSchema(cobrancaLocacaoArchiveManyInputSchema),
  handler: async (params, context) => {
    return await cobrancaLocacaoArchiveManyController(params, context);
  },
});

export async function cobrancaLocacaoArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      cobrancaLocacao: ['archive'],
    },
    context,
  );

  const { ids } = cobrancaLocacaoArchiveManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldCobrancasLocacao = await tx.cobrancaLocacao.findMany({
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

      const result = await tx.cobrancaLocacao.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
        },
      });

      const newCobrancasLocacao = await tx.cobrancaLocacao.findMany({
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

      for (const oldCobrancaLocacao of oldCobrancasLocacao) {
        const newCobrancaLocacao = newCobrancasLocacao.find(
          (c) => c.id === oldCobrancaLocacao.id,
        );
        await auditLogCreate({
          entityId: oldCobrancaLocacao.id,
          entityName: 'CobrancaLocacao',
          operation: auditLogOperations.update,
          context,
          oldData: oldCobrancaLocacao,
          newData: newCobrancaLocacao,
          tx,
        });
      }

      return result;
    },
  );
}
