import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { favoritoClienteArchiveManyInputSchema as favoritoClienteArchiveManyInputSchema } from '../favoritoClienteSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const favoritoClienteArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/favorito-cliente/archive',
  query: favoritoClienteArchiveManyInputSchema,
};

export const favoritoClienteArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'favorito-cliente_archive_many',
  description: dictionary.favoritoCliente.mcpDescription.archive,
  requiredPermissions: { favoritoCliente: ['archive'] },
  schema: toMcpJsonSchema(favoritoClienteArchiveManyInputSchema),
  handler: async (params, context) => {
    return await favoritoClienteArchiveManyController(params, context);
  },
});

export async function favoritoClienteArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      favoritoCliente: ['archive'],
    },
    context,
  );

  const { ids } = favoritoClienteArchiveManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldFavoritosCliente = await tx.favoritoCliente.findMany({
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

      const result = await tx.favoritoCliente.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
        },
      });

      const newFavoritosCliente = await tx.favoritoCliente.findMany({
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

      for (const oldFavoritoCliente of oldFavoritosCliente) {
        const newFavoritoCliente = newFavoritosCliente.find(
          (c) => c.id === oldFavoritoCliente.id,
        );
        await auditLogCreate({
          entityId: oldFavoritoCliente.id,
          entityName: 'FavoritoCliente',
          operation: auditLogOperations.update,
          context,
          oldData: oldFavoritoCliente,
          newData: newFavoritoCliente,
          tx,
        });
      }

      return result;
    },
  );
}
