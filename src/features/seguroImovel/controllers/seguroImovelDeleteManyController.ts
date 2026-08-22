import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { seguroImovelDeleteManyInputSchema } from '../seguroImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const seguroImovelDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/seguro-imovel',
  query: seguroImovelDeleteManyInputSchema,
};

export const seguroImovelDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'seguroImovel_delete_many',
  description: dictionary.seguroImovel.mcpDescription.delete,
  requiredPermissions: { seguroImovel: ['delete'] },
  schema: toMcpJsonSchema(seguroImovelDeleteManyInputSchema),
  handler: async (params, context) => {
    return await seguroImovelDeleteManyController(params, context);
  },
});

export async function seguroImovelDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      seguroImovel: ['delete'],
    },
    context,
  );

  const { ids } = seguroImovelDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const segurosImovelToDelete = await tx.seguroImovel.findMany({
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
          locacao: {
            select: {
              id: true,
              codigo: true,
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

      const result = await tx.seguroImovel.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const seguroImovel of segurosImovelToDelete) {
        await auditLogCreate({
          entityId: seguroImovel.id,
          entityName: 'SeguroImovel',
          operation: auditLogOperations.delete,
          context,
          oldData: seguroImovel,
          tx,
        });
      }

      return result;
    },
  );
}
