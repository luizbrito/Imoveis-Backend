import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { campanhaAnuncioRestoreManyInputSchema } from '../campanhaAnuncioSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const campanhaAnuncioRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/campanha-anuncio/restore',
  query: campanhaAnuncioRestoreManyInputSchema,
};

export const campanhaAnuncioRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'campanha-anuncio_restore_many',
  description: dictionary.campanhaAnuncio.mcpDescription.restore,
  requiredPermissions: { campanhaAnuncio: ['restore'] },
  schema: toMcpJsonSchema(campanhaAnuncioRestoreManyInputSchema),
  handler: async (params, context) => {
    return await campanhaAnuncioRestoreManyController(params, context);
  },
});

export async function campanhaAnuncioRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      campanhaAnuncio: ['restore'],
    },
    context,
  );

  const { ids } = campanhaAnuncioRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldCampanhasAnuncios = await tx.campanhaAnuncio.findMany({
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

      const result = await tx.campanhaAnuncio.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newCampanhasAnuncios = await tx.campanhaAnuncio.findMany({
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

      for (const oldCampanhaAnuncio of oldCampanhasAnuncios) {
        const newCampanhaAnuncio = newCampanhasAnuncios.find(
          (c) => c.id === oldCampanhaAnuncio.id,
        );
        await auditLogCreate({
          entityId: oldCampanhaAnuncio.id,
          entityName: 'CampanhaAnuncio',
          operation: auditLogOperations.update,
          context,
          oldData: oldCampanhaAnuncio,
          newData: newCampanhaAnuncio,
          tx,
        });
      }

      return result;
    },
  );
}
