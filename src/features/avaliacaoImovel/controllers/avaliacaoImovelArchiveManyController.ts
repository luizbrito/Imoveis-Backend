import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { avaliacaoImovelArchiveManyInputSchema as avaliacaoImovelArchiveManyInputSchema } from '../avaliacaoImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const avaliacaoImovelArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/avaliacao-imovel/archive',
  query: avaliacaoImovelArchiveManyInputSchema,
};

export const avaliacaoImovelArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'avaliacao-imovel_archive_many',
  description: dictionary.avaliacaoImovel.mcpDescription.archive,
  requiredPermissions: { avaliacaoImovel: ['archive'] },
  schema: toMcpJsonSchema(avaliacaoImovelArchiveManyInputSchema),
  handler: async (params, context) => {
    return await avaliacaoImovelArchiveManyController(params, context);
  },
});

export async function avaliacaoImovelArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      avaliacaoImovel: ['archive'],
    },
    context,
  );

  const { ids } = avaliacaoImovelArchiveManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldAvaliacoesImovel = await tx.avaliacaoImovel.findMany({
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

      const result = await tx.avaliacaoImovel.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
        },
      });

      const newAvaliacoesImovel = await tx.avaliacaoImovel.findMany({
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

      for (const oldAvaliacaoImovel of oldAvaliacoesImovel) {
        const newAvaliacaoImovel = newAvaliacoesImovel.find(
          (c) => c.id === oldAvaliacaoImovel.id,
        );
        await auditLogCreate({
          entityId: oldAvaliacaoImovel.id,
          entityName: 'AvaliacaoImovel',
          operation: auditLogOperations.update,
          context,
          oldData: oldAvaliacaoImovel,
          newData: newAvaliacaoImovel,
          tx,
        });
      }

      return result;
    },
  );
}
