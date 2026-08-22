import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { corretorRestoreManyInputSchema } from '../corretorSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const corretorRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/corretor/restore',
  query: corretorRestoreManyInputSchema,
};

export const corretorRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'corretor_restore_many',
  description: dictionary.corretor.mcpDescription.restore,
  requiredPermissions: { corretor: ['restore'] },
  schema: toMcpJsonSchema(corretorRestoreManyInputSchema),
  handler: async (params, context) => {
    return await corretorRestoreManyController(params, context);
  },
});

export async function corretorRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      corretor: ['restore'],
    },
    context,
  );

  const { ids } = corretorRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldCorretores = await tx.corretor.findMany({
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

      const result = await tx.corretor.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newCorretores = await tx.corretor.findMany({
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

      for (const oldCorretor of oldCorretores) {
        const newCorretor = newCorretores.find((c) => c.id === oldCorretor.id);
        await auditLogCreate({
          entityId: oldCorretor.id,
          entityName: 'Corretor',
          operation: auditLogOperations.update,
          context,
          oldData: oldCorretor,
          newData: newCorretor,
          tx,
        });
      }

      return result;
    },
  );
}
