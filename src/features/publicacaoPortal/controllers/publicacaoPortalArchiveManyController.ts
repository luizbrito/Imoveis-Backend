import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { publicacaoPortalArchiveManyInputSchema as publicacaoPortalArchiveManyInputSchema } from '../publicacaoPortalSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const publicacaoPortalArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/publicacao-portal/archive',
  query: publicacaoPortalArchiveManyInputSchema,
};

export const publicacaoPortalArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'publicacao-portal_archive_many',
  description: dictionary.publicacaoPortal.mcpDescription.archive,
  requiredPermissions: { publicacaoPortal: ['archive'] },
  schema: toMcpJsonSchema(publicacaoPortalArchiveManyInputSchema),
  handler: async (params, context) => {
    return await publicacaoPortalArchiveManyController(params, context);
  },
});

export async function publicacaoPortalArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      publicacaoPortal: ['archive'],
    },
    context,
  );

  const { ids } = publicacaoPortalArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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
