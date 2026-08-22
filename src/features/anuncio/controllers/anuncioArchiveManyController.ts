import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { anuncioArchiveManyInputSchema as anuncioArchiveManyInputSchema } from '../anuncioSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const anuncioArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/anuncio/archive',
  query: anuncioArchiveManyInputSchema,
};

export const anuncioArchiveManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'anuncio_archive_many',
  description: dictionary.anuncio.mcpDescription.archive,
  requiredPermissions: { anuncio: ['archive'] },
  schema: toMcpJsonSchema(anuncioArchiveManyInputSchema),
  handler: async (params, context) => {
    return await anuncioArchiveManyController(params, context);
  },
});

export async function anuncioArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      anuncio: ['archive'],
    },
    context,
  );

  const { ids } = anuncioArchiveManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldAnuncios = await tx.anuncio.findMany({
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

      const result = await tx.anuncio.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
        },
      });

      const newAnuncios = await tx.anuncio.findMany({
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

      for (const oldAnuncio of oldAnuncios) {
        const newAnuncio = newAnuncios.find((c) => c.id === oldAnuncio.id);
        await auditLogCreate({
          entityId: oldAnuncio.id,
          entityName: 'Anuncio',
          operation: auditLogOperations.update,
          context,
          oldData: oldAnuncio,
          newData: newAnuncio,
          tx,
        });
      }

      return result;
    },
  );
}
