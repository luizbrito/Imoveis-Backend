import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { estadoRestoreManyInputSchema } from '../estadoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const estadoRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/estado/restore',
  query: estadoRestoreManyInputSchema,
};

export const estadoRestoreManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'estado_restore_many',
  description: dictionary.estado.mcpDescription.restore,
  requiredPermissions: { estado: ['restore'] },
  schema: toMcpJsonSchema(estadoRestoreManyInputSchema),
  handler: async (params, context) => {
    return await estadoRestoreManyController(params, context);
  },
});

export async function estadoRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      estado: ['restore'],
    },
    context,
  );

  const { ids } = estadoRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldEstados = await tx.estado.findMany({
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

      const result = await tx.estado.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newEstados = await tx.estado.findMany({
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

      for (const oldEstado of oldEstados) {
        const newEstado = newEstados.find((c) => c.id === oldEstado.id);
        await auditLogCreate({
          entityId: oldEstado.id,
          entityName: 'Estado',
          operation: auditLogOperations.update,
          context,
          oldData: oldEstado,
          newData: newEstado,
          tx,
        });
      }

      return result;
    },
  );
}
