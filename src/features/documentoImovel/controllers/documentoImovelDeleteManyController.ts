import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { documentoImovelDeleteManyInputSchema } from '../documentoImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const documentoImovelDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/documento-imovel',
  query: documentoImovelDeleteManyInputSchema,
};

export const documentoImovelDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'documentoImovel_delete_many',
  description: dictionary.documentoImovel.mcpDescription.delete,
  requiredPermissions: { documentoImovel: ['delete'] },
  schema: toMcpJsonSchema(documentoImovelDeleteManyInputSchema),
  handler: async (params, context) => {
    return await documentoImovelDeleteManyController(params, context);
  },
});

export async function documentoImovelDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      documentoImovel: ['delete'],
    },
    context,
  );

  const { ids } = documentoImovelDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const documentosImovelToDelete = await tx.documentoImovel.findMany({
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

      const result = await tx.documentoImovel.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const documentoImovel of documentosImovelToDelete) {
        await auditLogCreate({
          entityId: documentoImovel.id,
          entityName: 'DocumentoImovel',
          operation: auditLogOperations.delete,
          context,
          oldData: documentoImovel,
          tx,
        });
      }

      return result;
    },
  );
}
