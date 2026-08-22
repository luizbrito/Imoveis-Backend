import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { condominioRestoreManyInputSchema } from '../condominioSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const condominioRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/condominio/restore',
  query: condominioRestoreManyInputSchema,
};

export const condominioRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'condominio_restore_many',
  description: dictionary.condominio.mcpDescription.restore,
  requiredPermissions: { condominio: ['restore'] },
  schema: toMcpJsonSchema(condominioRestoreManyInputSchema),
  handler: async (params, context) => {
    return await condominioRestoreManyController(params, context);
  },
});

export async function condominioRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      condominio: ['restore'],
    },
    context,
  );

  const { ids } = condominioRestoreManyInputSchema.parse(query);

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
          archivedAt: null,
          archivedByMemberId: null,
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
