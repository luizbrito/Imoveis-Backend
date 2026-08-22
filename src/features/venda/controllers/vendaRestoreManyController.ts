import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { vendaRestoreManyInputSchema } from '../vendaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const vendaRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/venda/restore',
  query: vendaRestoreManyInputSchema,
};

export const vendaRestoreManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'venda_restore_many',
  description: dictionary.venda.mcpDescription.restore,
  requiredPermissions: { venda: ['restore'] },
  schema: toMcpJsonSchema(vendaRestoreManyInputSchema),
  handler: async (params, context) => {
    return await vendaRestoreManyController(params, context);
  },
});

export async function vendaRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      venda: ['restore'],
    },
    context,
  );

  const { ids } = vendaRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldVendas = await tx.venda.findMany({
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

      const result = await tx.venda.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newVendas = await tx.venda.findMany({
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

      for (const oldVenda of oldVendas) {
        const newVenda = newVendas.find((c) => c.id === oldVenda.id);
        await auditLogCreate({
          entityId: oldVenda.id,
          entityName: 'Venda',
          operation: auditLogOperations.update,
          context,
          oldData: oldVenda,
          newData: newVenda,
          tx,
        });
      }

      return result;
    },
  );
}
