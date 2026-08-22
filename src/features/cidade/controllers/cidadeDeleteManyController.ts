import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { cidadeDeleteManyInputSchema } from '../cidadeSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const cidadeDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/cidade',
  query: cidadeDeleteManyInputSchema,
};

export const cidadeDeleteManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'cidade_delete_many',
  description: dictionary.cidade.mcpDescription.delete,
  requiredPermissions: { cidade: ['delete'] },
  schema: toMcpJsonSchema(cidadeDeleteManyInputSchema),
  handler: async (params, context) => {
    return await cidadeDeleteManyController(params, context);
  },
});

export async function cidadeDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      cidade: ['delete'],
    },
    context,
  );

  const { ids } = cidadeDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const cidadesToDelete = await tx.cidade.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        include: {
          estado: {
            select: {
              id: true,
              nome: true,
            },
          },
          imoveisCidade: {
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

      const result = await tx.cidade.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const cidade of cidadesToDelete) {
        await auditLogCreate({
          entityId: cidade.id,
          entityName: 'Cidade',
          operation: auditLogOperations.delete,
          context,
          oldData: cidade,
          tx,
        });
      }

      return result;
    },
  );
}
