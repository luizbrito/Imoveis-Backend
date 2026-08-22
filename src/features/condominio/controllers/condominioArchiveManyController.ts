import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { condominioArchiveManyInputSchema as condominioArchiveManyInputSchema } from '../condominioSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const condominioArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/condominio/archive',
  query: condominioArchiveManyInputSchema,
};

export const condominioArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'condominio_archive_many',
  description: dictionary.condominio.mcpDescription.archive,
  requiredPermissions: { condominio: ['archive'] },
  schema: toMcpJsonSchema(condominioArchiveManyInputSchema),
  handler: async (params, context) => {
    return await condominioArchiveManyController(params, context);
  },
});

export async function condominioArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      condominio: ['archive'],
    },
    context,
  );

  const { ids } = condominioArchiveManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldCondominios = await tx.condominio.findMany({
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

      const result = await tx.condominio.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
        },
      });

      const newCondominios = await tx.condominio.findMany({
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

      for (const oldCondominio of oldCondominios) {
        const newCondominio = newCondominios.find(
          (c) => c.id === oldCondominio.id,
        );
        await auditLogCreate({
          entityId: oldCondominio.id,
          entityName: 'Condominio',
          operation: auditLogOperations.update,
          context,
          oldData: oldCondominio,
          newData: newCondominio,
          tx,
        });
      }

      return result;
    },
  );
}
