import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { midiaImovelRestoreManyInputSchema } from '../midiaImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const midiaImovelRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/midia-imovel/restore',
  query: midiaImovelRestoreManyInputSchema,
};

export const midiaImovelRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'midia-imovel_restore_many',
  description: dictionary.midiaImovel.mcpDescription.restore,
  requiredPermissions: { midiaImovel: ['restore'] },
  schema: toMcpJsonSchema(midiaImovelRestoreManyInputSchema),
  handler: async (params, context) => {
    return await midiaImovelRestoreManyController(params, context);
  },
});

export async function midiaImovelRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      midiaImovel: ['restore'],
    },
    context,
  );

  const { ids } = midiaImovelRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldMidiasImovel = await tx.midiaImovel.findMany({
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

      const result = await tx.midiaImovel.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newMidiasImovel = await tx.midiaImovel.findMany({
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

      for (const oldMidiaImovel of oldMidiasImovel) {
        const newMidiaImovel = newMidiasImovel.find(
          (c) => c.id === oldMidiaImovel.id,
        );
        await auditLogCreate({
          entityId: oldMidiaImovel.id,
          entityName: 'MidiaImovel',
          operation: auditLogOperations.update,
          context,
          oldData: oldMidiaImovel,
          newData: newMidiaImovel,
          tx,
        });
      }

      return result;
    },
  );
}
