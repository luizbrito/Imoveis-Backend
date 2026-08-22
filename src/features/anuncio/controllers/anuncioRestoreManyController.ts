import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { anuncioRestoreManyInputSchema } from '../anuncioSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const anuncioRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/anuncio/restore',
  query: anuncioRestoreManyInputSchema,
};

export const anuncioRestoreManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'anuncio_restore_many',
  description: dictionary.anuncio.mcpDescription.restore,
  requiredPermissions: { anuncio: ['restore'] },
  schema: toMcpJsonSchema(anuncioRestoreManyInputSchema),
  handler: async (params, context) => {
    return await anuncioRestoreManyController(params, context);
  },
});

export async function anuncioRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      anuncio: ['restore'],
    },
    context,
  );

  const { ids } = anuncioRestoreManyInputSchema.parse(query);

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
          archivedAt: null,
          archivedByMemberId: null,
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
