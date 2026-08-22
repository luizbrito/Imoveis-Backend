import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { condominioDeleteManyInputSchema } from '../condominioSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const condominioDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/condominio',
  query: condominioDeleteManyInputSchema,
};

export const condominioDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'condominio_delete_many',
  description: dictionary.condominio.mcpDescription.delete,
  requiredPermissions: { condominio: ['delete'] },
  schema: toMcpJsonSchema(condominioDeleteManyInputSchema),
  handler: async (params, context) => {
    return await condominioDeleteManyController(params, context);
  },
});

export async function condominioDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      condominio: ['delete'],
    },
    context,
  );

  const { ids } = condominioDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const condominiosToDelete = await tx.condominio.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        include: {
          imoveis: {
            select: {
              id: true,
              titulo: true,
            },
          },
          arquivosKml: {
            select: {
              id: true,
              nome: true,
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

      const result = await tx.condominio.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const condominio of condominiosToDelete) {
        await auditLogCreate({
          entityId: condominio.id,
          entityName: 'Condominio',
          operation: auditLogOperations.delete,
          context,
          oldData: condominio,
          tx,
        });
      }

      return result;
    },
  );
}
