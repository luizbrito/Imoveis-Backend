import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { estadoArchiveManyInputSchema as estadoArchiveManyInputSchema } from '../estadoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const estadoArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/estado/archive',
  query: estadoArchiveManyInputSchema,
};

export const estadoArchiveManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'estado_archive_many',
  description: dictionary.estado.mcpDescription.archive,
  requiredPermissions: { estado: ['archive'] },
  schema: toMcpJsonSchema(estadoArchiveManyInputSchema),
  handler: async (params, context) => {
    return await estadoArchiveManyController(params, context);
  },
});

export async function estadoArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      estado: ['archive'],
    },
    context,
  );

  const { ids } = estadoArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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
