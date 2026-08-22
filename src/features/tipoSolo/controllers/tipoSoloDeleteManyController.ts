import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { tipoSoloDeleteManyInputSchema } from '../tipoSoloSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const tipoSoloDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/tipo-solo',
  query: tipoSoloDeleteManyInputSchema,
};

export const tipoSoloDeleteManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'tipoSolo_delete_many',
  description: dictionary.tipoSolo.mcpDescription.delete,
  requiredPermissions: { tipoSolo: ['delete'] },
  schema: toMcpJsonSchema(tipoSoloDeleteManyInputSchema),
  handler: async (params, context) => {
    return await tipoSoloDeleteManyController(params, context);
  },
});

export async function tipoSoloDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      tipoSolo: ['delete'],
    },
    context,
  );

  const { ids } = tipoSoloDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const tiposSoloToDelete = await tx.tipoSolo.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        include: {
          areasImoveis: {
            select: {
              id: true,
              nomeArea: true,
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

      const result = await tx.tipoSolo.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const tipoSolo of tiposSoloToDelete) {
        await auditLogCreate({
          entityId: tipoSolo.id,
          entityName: 'TipoSolo',
          operation: auditLogOperations.delete,
          context,
          oldData: tipoSolo,
          tx,
        });
      }

      return result;
    },
  );
}
