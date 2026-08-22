import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { chaveImovelArchiveManyInputSchema as chaveImovelArchiveManyInputSchema } from '../chaveImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const chaveImovelArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/chave-imovel/archive',
  query: chaveImovelArchiveManyInputSchema,
};

export const chaveImovelArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'chave-imovel_archive_many',
  description: dictionary.chaveImovel.mcpDescription.archive,
  requiredPermissions: { chaveImovel: ['archive'] },
  schema: toMcpJsonSchema(chaveImovelArchiveManyInputSchema),
  handler: async (params, context) => {
    return await chaveImovelArchiveManyController(params, context);
  },
});

export async function chaveImovelArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      chaveImovel: ['archive'],
    },
    context,
  );

  const { ids } = chaveImovelArchiveManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldChavesImovel = await tx.chaveImovel.findMany({
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

      const result = await tx.chaveImovel.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
        },
      });

      const newChavesImovel = await tx.chaveImovel.findMany({
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

      for (const oldChaveImovel of oldChavesImovel) {
        const newChaveImovel = newChavesImovel.find(
          (c) => c.id === oldChaveImovel.id,
        );
        await auditLogCreate({
          entityId: oldChaveImovel.id,
          entityName: 'ChaveImovel',
          operation: auditLogOperations.update,
          context,
          oldData: oldChaveImovel,
          newData: newChaveImovel,
          tx,
        });
      }

      return result;
    },
  );
}
