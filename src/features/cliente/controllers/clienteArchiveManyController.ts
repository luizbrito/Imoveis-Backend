import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { clienteArchiveManyInputSchema as clienteArchiveManyInputSchema } from '../clienteSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const clienteArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/cliente/archive',
  query: clienteArchiveManyInputSchema,
};

export const clienteArchiveManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'cliente_archive_many',
  description: dictionary.cliente.mcpDescription.archive,
  requiredPermissions: { cliente: ['archive'] },
  schema: toMcpJsonSchema(clienteArchiveManyInputSchema),
  handler: async (params, context) => {
    return await clienteArchiveManyController(params, context);
  },
});

export async function clienteArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      cliente: ['archive'],
    },
    context,
  );

  const { ids } = clienteArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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
