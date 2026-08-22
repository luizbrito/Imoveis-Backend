import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { paisDeleteManyInputSchema } from '../paisSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const paisDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/pais',
  query: paisDeleteManyInputSchema,
};

export const paisDeleteManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'pais_delete_many',
  description: dictionary.pais.mcpDescription.delete,
  requiredPermissions: { pais: ['delete'] },
  schema: toMcpJsonSchema(paisDeleteManyInputSchema),
  handler: async (params, context) => {
    return await paisDeleteManyController(params, context);
  },
});

export async function paisDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      pais: ['delete'],
    },
    context,
  );

  const { ids } = paisDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const paissToDelete = await tx.pais.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        include: {
          estados: {
            select: {
              id: true,
              nome: true,
            },
          },
          imoveisPais: {
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

      const result = await tx.pais.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const pais of paissToDelete) {
        await auditLogCreate({
          entityId: pais.id,
          entityName: 'Pais',
          operation: auditLogOperations.delete,
          context,
          oldData: pais,
          tx,
        });
      }

      return result;
    },
  );
}
