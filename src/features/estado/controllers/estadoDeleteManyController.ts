import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { estadoDeleteManyInputSchema } from '../estadoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const estadoDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/estado',
  query: estadoDeleteManyInputSchema,
};

export const estadoDeleteManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'estado_delete_many',
  description: dictionary.estado.mcpDescription.delete,
  requiredPermissions: { estado: ['delete'] },
  schema: toMcpJsonSchema(estadoDeleteManyInputSchema),
  handler: async (params, context) => {
    return await estadoDeleteManyController(params, context);
  },
});

export async function estadoDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      estado: ['delete'],
    },
    context,
  );

  const { ids } = estadoDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const estadosToDelete = await tx.estado.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        include: {
          pais: {
            select: {
              id: true,
              nome: true,
            },
          },
          cidades: {
            select: {
              id: true,
              nome: true,
            },
          },
          imoveisEstado: {
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

      const result = await tx.estado.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const estado of estadosToDelete) {
        await auditLogCreate({
          entityId: estado.id,
          entityName: 'Estado',
          operation: auditLogOperations.delete,
          context,
          oldData: estado,
          tx,
        });
      }

      return result;
    },
  );
}
