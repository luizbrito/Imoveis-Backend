import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { campanhaAnuncioArchiveManyInputSchema as campanhaAnuncioArchiveManyInputSchema } from '../campanhaAnuncioSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const campanhaAnuncioArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/campanha-anuncio/archive',
  query: campanhaAnuncioArchiveManyInputSchema,
};

export const campanhaAnuncioArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'campanha-anuncio_archive_many',
  description: dictionary.campanhaAnuncio.mcpDescription.archive,
  requiredPermissions: { campanhaAnuncio: ['archive'] },
  schema: toMcpJsonSchema(campanhaAnuncioArchiveManyInputSchema),
  handler: async (params, context) => {
    return await campanhaAnuncioArchiveManyController(params, context);
  },
});

export async function campanhaAnuncioArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      campanhaAnuncio: ['archive'],
    },
    context,
  );

  const { ids } = campanhaAnuncioArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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
