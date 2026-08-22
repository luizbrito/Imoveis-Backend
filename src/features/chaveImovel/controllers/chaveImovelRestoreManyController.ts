import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { chaveImovelRestoreManyInputSchema } from '../chaveImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const chaveImovelRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/chave-imovel/restore',
  query: chaveImovelRestoreManyInputSchema,
};

export const chaveImovelRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'chave-imovel_restore_many',
  description: dictionary.chaveImovel.mcpDescription.restore,
  requiredPermissions: { chaveImovel: ['restore'] },
  schema: toMcpJsonSchema(chaveImovelRestoreManyInputSchema),
  handler: async (params, context) => {
    return await chaveImovelRestoreManyController(params, context);
  },
});

export async function chaveImovelRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      chaveImovel: ['restore'],
    },
    context,
  );

  const { ids } = chaveImovelRestoreManyInputSchema.parse(query);

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
          archivedAt: null,
          archivedByMemberId: null,
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
