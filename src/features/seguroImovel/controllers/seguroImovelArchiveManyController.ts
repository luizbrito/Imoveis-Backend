import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { seguroImovelArchiveManyInputSchema as seguroImovelArchiveManyInputSchema } from '../seguroImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const seguroImovelArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/seguro-imovel/archive',
  query: seguroImovelArchiveManyInputSchema,
};

export const seguroImovelArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'seguro-imovel_archive_many',
  description: dictionary.seguroImovel.mcpDescription.archive,
  requiredPermissions: { seguroImovel: ['archive'] },
  schema: toMcpJsonSchema(seguroImovelArchiveManyInputSchema),
  handler: async (params, context) => {
    return await seguroImovelArchiveManyController(params, context);
  },
});

export async function seguroImovelArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      seguroImovel: ['archive'],
    },
    context,
  );

  const { ids } = seguroImovelArchiveManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldSegurosImovel = await tx.seguroImovel.findMany({
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

      const result = await tx.seguroImovel.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
        },
      });

      const newSegurosImovel = await tx.seguroImovel.findMany({
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

      for (const oldSeguroImovel of oldSegurosImovel) {
        const newSeguroImovel = newSegurosImovel.find(
          (c) => c.id === oldSeguroImovel.id,
        );
        await auditLogCreate({
          entityId: oldSeguroImovel.id,
          entityName: 'SeguroImovel',
          operation: auditLogOperations.update,
          context,
          oldData: oldSeguroImovel,
          newData: newSeguroImovel,
          tx,
        });
      }

      return result;
    },
  );
}
