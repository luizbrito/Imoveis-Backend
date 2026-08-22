import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { campanhaAnuncioDeleteManyInputSchema } from '../campanhaAnuncioSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const campanhaAnuncioDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/campanha-anuncio',
  query: campanhaAnuncioDeleteManyInputSchema,
};

export const campanhaAnuncioDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'campanhaAnuncio_delete_many',
  description: dictionary.campanhaAnuncio.mcpDescription.delete,
  requiredPermissions: { campanhaAnuncio: ['delete'] },
  schema: toMcpJsonSchema(campanhaAnuncioDeleteManyInputSchema),
  handler: async (params, context) => {
    return await campanhaAnuncioDeleteManyController(params, context);
  },
});

export async function campanhaAnuncioDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      campanhaAnuncio: ['delete'],
    },
    context,
  );

  const { ids } = campanhaAnuncioDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const campanhasAnunciosToDelete = await tx.campanhaAnuncio.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        include: {
          campanha: {
            select: {
              id: true,
              nome: true,
            },
          },
          anuncio: {
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

      const result = await tx.campanhaAnuncio.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const campanhaAnuncio of campanhasAnunciosToDelete) {
        await auditLogCreate({
          entityId: campanhaAnuncio.id,
          entityName: 'CampanhaAnuncio',
          operation: auditLogOperations.delete,
          context,
          oldData: campanhaAnuncio,
          tx,
        });
      }

      return result;
    },
  );
}
