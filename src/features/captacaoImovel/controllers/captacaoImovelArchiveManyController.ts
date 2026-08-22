import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { captacaoImovelArchiveManyInputSchema as captacaoImovelArchiveManyInputSchema } from '../captacaoImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const captacaoImovelArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/captacao-imovel/archive',
  query: captacaoImovelArchiveManyInputSchema,
};

export const captacaoImovelArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'captacao-imovel_archive_many',
  description: dictionary.captacaoImovel.mcpDescription.archive,
  requiredPermissions: { captacaoImovel: ['archive'] },
  schema: toMcpJsonSchema(captacaoImovelArchiveManyInputSchema),
  handler: async (params, context) => {
    return await captacaoImovelArchiveManyController(params, context);
  },
});

export async function captacaoImovelArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      captacaoImovel: ['archive'],
    },
    context,
  );

  const { ids } = captacaoImovelArchiveManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldCaptacoesImovel = await tx.captacaoImovel.findMany({
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

      const result = await tx.captacaoImovel.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
        },
      });

      const newCaptacoesImovel = await tx.captacaoImovel.findMany({
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

      for (const oldCaptacaoImovel of oldCaptacoesImovel) {
        const newCaptacaoImovel = newCaptacoesImovel.find(
          (c) => c.id === oldCaptacaoImovel.id,
        );
        await auditLogCreate({
          entityId: oldCaptacaoImovel.id,
          entityName: 'CaptacaoImovel',
          operation: auditLogOperations.update,
          context,
          oldData: oldCaptacaoImovel,
          newData: newCaptacaoImovel,
          tx,
        });
      }

      return result;
    },
  );
}
