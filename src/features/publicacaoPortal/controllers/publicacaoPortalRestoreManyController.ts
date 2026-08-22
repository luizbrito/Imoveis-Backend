import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { publicacaoPortalRestoreManyInputSchema } from '../publicacaoPortalSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const publicacaoPortalRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/publicacao-portal/restore',
  query: publicacaoPortalRestoreManyInputSchema,
};

export const publicacaoPortalRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'publicacao-portal_restore_many',
  description: dictionary.publicacaoPortal.mcpDescription.restore,
  requiredPermissions: { publicacaoPortal: ['restore'] },
  schema: toMcpJsonSchema(publicacaoPortalRestoreManyInputSchema),
  handler: async (params, context) => {
    return await publicacaoPortalRestoreManyController(params, context);
  },
});

export async function publicacaoPortalRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      publicacaoPortal: ['restore'],
    },
    context,
  );

  const { ids } = publicacaoPortalRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldPublicacoesPortal = await tx.publicacaoPortal.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        select: {
          id: true,
          archivedAt: true,
          archivedByMemberId: true,
        },
      });

      const result = await tx.publicacaoPortal.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newPublicacoesPortal = await tx.publicacaoPortal.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        select: {
          id: true,
          archivedAt: true,
          archivedByMemberId: true,
        },
      });

      for (const oldPublicacaoPortal of oldPublicacoesPortal) {
        const newPublicacaoPortal = newPublicacoesPortal.find(
          (c) => c.id === oldPublicacaoPortal.id,
        );
        await auditLogCreate({
          entityId: oldPublicacaoPortal.id,
          entityName: 'PublicacaoPortal',
          operation: auditLogOperations.update,
          context,
          oldData: oldPublicacaoPortal,
          newData: newPublicacaoPortal,
          tx,
        });
      }

      return result;
    },
  );
}
