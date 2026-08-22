import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { midiaImovelArchiveManyInputSchema as midiaImovelArchiveManyInputSchema } from '../midiaImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const midiaImovelArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/midia-imovel/archive',
  query: midiaImovelArchiveManyInputSchema,
};

export const midiaImovelArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'midia-imovel_archive_many',
  description: dictionary.midiaImovel.mcpDescription.archive,
  requiredPermissions: { midiaImovel: ['archive'] },
  schema: toMcpJsonSchema(midiaImovelArchiveManyInputSchema),
  handler: async (params, context) => {
    return await midiaImovelArchiveManyController(params, context);
  },
});

export async function midiaImovelArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      midiaImovel: ['archive'],
    },
    context,
  );

  const { ids } = midiaImovelArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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
