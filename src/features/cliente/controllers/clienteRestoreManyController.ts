import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { clienteRestoreManyInputSchema } from '../clienteSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const clienteRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/cliente/restore',
  query: clienteRestoreManyInputSchema,
};

export const clienteRestoreManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'cliente_restore_many',
  description: dictionary.cliente.mcpDescription.restore,
  requiredPermissions: { cliente: ['restore'] },
  schema: toMcpJsonSchema(clienteRestoreManyInputSchema),
  handler: async (params, context) => {
    return await clienteRestoreManyController(params, context);
  },
});

export async function clienteRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      cliente: ['restore'],
    },
    context,
  );

  const { ids } = clienteRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldClientes = await tx.cliente.findMany({
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

      const result = await tx.cliente.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newClientes = await tx.cliente.findMany({
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

      for (const oldCliente of oldClientes) {
        const newCliente = newClientes.find((c) => c.id === oldCliente.id);
        await auditLogCreate({
          entityId: oldCliente.id,
          entityName: 'Cliente',
          operation: auditLogOperations.update,
          context,
          oldData: oldCliente,
          newData: newCliente,
          tx,
        });
      }

      return result;
    },
  );
}
