import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { paisRestoreManyInputSchema } from '../paisSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const paisRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/pais/restore',
  query: paisRestoreManyInputSchema,
};

export const paisRestoreManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'pais_restore_many',
  description: dictionary.pais.mcpDescription.restore,
  requiredPermissions: { pais: ['restore'] },
  schema: toMcpJsonSchema(paisRestoreManyInputSchema),
  handler: async (params, context) => {
    return await paisRestoreManyController(params, context);
  },
});

export async function paisRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      pais: ['restore'],
    },
    context,
  );

  const { ids } = paisRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldPaiss = await tx.pais.findMany({
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

      const result = await tx.pais.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newPaiss = await tx.pais.findMany({
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

      for (const oldPais of oldPaiss) {
        const newPais = newPaiss.find((c) => c.id === oldPais.id);
        await auditLogCreate({
          entityId: oldPais.id,
          entityName: 'Pais',
          operation: auditLogOperations.update,
          context,
          oldData: oldPais,
          newData: newPais,
          tx,
        });
      }

      return result;
    },
  );
}
