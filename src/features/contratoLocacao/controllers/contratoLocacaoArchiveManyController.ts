import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { contratoLocacaoArchiveManyInputSchema as contratoLocacaoArchiveManyInputSchema } from '../contratoLocacaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const contratoLocacaoArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/contrato-locacao/archive',
  query: contratoLocacaoArchiveManyInputSchema,
};

export const contratoLocacaoArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'contrato-locacao_archive_many',
  description: dictionary.contratoLocacao.mcpDescription.archive,
  requiredPermissions: { contratoLocacao: ['archive'] },
  schema: toMcpJsonSchema(contratoLocacaoArchiveManyInputSchema),
  handler: async (params, context) => {
    return await contratoLocacaoArchiveManyController(params, context);
  },
});

export async function contratoLocacaoArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      contratoLocacao: ['archive'],
    },
    context,
  );

  const { ids } = contratoLocacaoArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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
