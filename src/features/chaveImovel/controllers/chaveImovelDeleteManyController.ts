import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { chaveImovelDeleteManyInputSchema } from '../chaveImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const chaveImovelDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/chave-imovel',
  query: chaveImovelDeleteManyInputSchema,
};

export const chaveImovelDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'chaveImovel_delete_many',
  description: dictionary.chaveImovel.mcpDescription.delete,
  requiredPermissions: { chaveImovel: ['delete'] },
  schema: toMcpJsonSchema(chaveImovelDeleteManyInputSchema),
  handler: async (params, context) => {
    return await chaveImovelDeleteManyController(params, context);
  },
});

export async function chaveImovelDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      chaveImovel: ['delete'],
    },
    context,
  );

  const { ids } = chaveImovelDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const chavesImovelToDelete = await tx.chaveImovel.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        include: {
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

      const result = await tx.chaveImovel.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const chaveImovel of chavesImovelToDelete) {
        await auditLogCreate({
          entityId: chaveImovel.id,
          entityName: 'ChaveImovel',
          operation: auditLogOperations.delete,
          context,
          oldData: chaveImovel,
          tx,
        });
      }

      return result;
    },
  );
}
