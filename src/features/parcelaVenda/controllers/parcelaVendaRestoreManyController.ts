import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { parcelaVendaRestoreManyInputSchema } from '../parcelaVendaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const parcelaVendaRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/parcela-venda/restore',
  query: parcelaVendaRestoreManyInputSchema,
};

export const parcelaVendaRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'parcela-venda_restore_many',
  description: dictionary.parcelaVenda.mcpDescription.restore,
  requiredPermissions: { parcelaVenda: ['restore'] },
  schema: toMcpJsonSchema(parcelaVendaRestoreManyInputSchema),
  handler: async (params, context) => {
    return await parcelaVendaRestoreManyController(params, context);
  },
});

export async function parcelaVendaRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      parcelaVenda: ['restore'],
    },
    context,
  );

  const { ids } = parcelaVendaRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldParcelasVenda = await tx.parcelaVenda.findMany({
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

      const result = await tx.parcelaVenda.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newParcelasVenda = await tx.parcelaVenda.findMany({
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

      for (const oldParcelaVenda of oldParcelasVenda) {
        const newParcelaVenda = newParcelasVenda.find(
          (c) => c.id === oldParcelaVenda.id,
        );
        await auditLogCreate({
          entityId: oldParcelaVenda.id,
          entityName: 'ParcelaVenda',
          operation: auditLogOperations.update,
          context,
          oldData: oldParcelaVenda,
          newData: newParcelaVenda,
          tx,
        });
      }

      return result;
    },
  );
}
