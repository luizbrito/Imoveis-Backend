import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { favoritoClienteDeleteManyInputSchema } from '../favoritoClienteSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const favoritoClienteDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/favorito-cliente',
  query: favoritoClienteDeleteManyInputSchema,
};

export const favoritoClienteDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'favoritoCliente_delete_many',
  description: dictionary.favoritoCliente.mcpDescription.delete,
  requiredPermissions: { favoritoCliente: ['delete'] },
  schema: toMcpJsonSchema(favoritoClienteDeleteManyInputSchema),
  handler: async (params, context) => {
    return await favoritoClienteDeleteManyController(params, context);
  },
});

export async function favoritoClienteDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      favoritoCliente: ['delete'],
    },
    context,
  );

  const { ids } = favoritoClienteDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const favoritosClienteToDelete = await tx.favoritoCliente.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        include: {
          cliente: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          imovel: {
            select: {
              id: true,
              titulo: true,
            },
          },
          createdByMember: {
            select: {
              id: true,
              fullName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          updatedByMember: {
            select: {
              id: true,
              fullName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          archivedByMember: {
            select: {
              id: true,
              fullName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      });

      const result = await tx.favoritoCliente.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const favoritoCliente of favoritosClienteToDelete) {
        await auditLogCreate({
          entityId: favoritoCliente.id,
          entityName: 'FavoritoCliente',
          operation: auditLogOperations.delete,
          context,
          oldData: favoritoCliente,
          tx,
        });
      }

      return result;
    },
  );
}
