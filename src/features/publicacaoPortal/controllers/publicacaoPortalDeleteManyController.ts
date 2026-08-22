import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { publicacaoPortalDeleteManyInputSchema } from '../publicacaoPortalSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const publicacaoPortalDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/publicacao-portal',
  query: publicacaoPortalDeleteManyInputSchema,
};

export const publicacaoPortalDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'publicacaoPortal_delete_many',
  description: dictionary.publicacaoPortal.mcpDescription.delete,
  requiredPermissions: { publicacaoPortal: ['delete'] },
  schema: toMcpJsonSchema(publicacaoPortalDeleteManyInputSchema),
  handler: async (params, context) => {
    return await publicacaoPortalDeleteManyController(params, context);
  },
});

export async function publicacaoPortalDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      publicacaoPortal: ['delete'],
    },
    context,
  );

  const { ids } = publicacaoPortalDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const publicacoesPortalToDelete = await tx.publicacaoPortal.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        include: {
          anuncio: {
            select: {
              id: true,
              titulo: true,
            },
          },
          portal: {
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

      const result = await tx.publicacaoPortal.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const publicacaoPortal of publicacoesPortalToDelete) {
        await auditLogCreate({
          entityId: publicacaoPortal.id,
          entityName: 'PublicacaoPortal',
          operation: auditLogOperations.delete,
          context,
          oldData: publicacaoPortal,
          tx,
        });
      }

      return result;
    },
  );
}
