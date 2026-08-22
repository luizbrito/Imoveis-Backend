import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { favoritoClienteRestoreManyInputSchema } from '../favoritoClienteSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const favoritoClienteRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/favorito-cliente/restore',
  query: favoritoClienteRestoreManyInputSchema,
};

export const favoritoClienteRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'favorito-cliente_restore_many',
  description: dictionary.favoritoCliente.mcpDescription.restore,
  requiredPermissions: { favoritoCliente: ['restore'] },
  schema: toMcpJsonSchema(favoritoClienteRestoreManyInputSchema),
  handler: async (params, context) => {
    return await favoritoClienteRestoreManyController(params, context);
  },
});

export async function favoritoClienteRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      favoritoCliente: ['restore'],
    },
    context,
  );

  const { ids } = favoritoClienteRestoreManyInputSchema.parse(query);

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
          archivedAt: null,
          archivedByMemberId: null,
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
