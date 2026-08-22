import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { contratoVendaRestoreManyInputSchema } from '../contratoVendaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const contratoVendaRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/contrato-venda/restore',
  query: contratoVendaRestoreManyInputSchema,
};

export const contratoVendaRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'contrato-venda_restore_many',
  description: dictionary.contratoVenda.mcpDescription.restore,
  requiredPermissions: { contratoVenda: ['restore'] },
  schema: toMcpJsonSchema(contratoVendaRestoreManyInputSchema),
  handler: async (params, context) => {
    return await contratoVendaRestoreManyController(params, context);
  },
});

export async function contratoVendaRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      contratoVenda: ['restore'],
    },
    context,
  );

  const { ids } = contratoVendaRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldContratosVenda = await tx.contratoVenda.findMany({
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

      const result = await tx.contratoVenda.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newContratosVenda = await tx.contratoVenda.findMany({
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

      for (const oldContratoVenda of oldContratosVenda) {
        const newContratoVenda = newContratosVenda.find(
          (c) => c.id === oldContratoVenda.id,
        );
        await auditLogCreate({
          entityId: oldContratoVenda.id,
          entityName: 'ContratoVenda',
          operation: auditLogOperations.update,
          context,
          oldData: oldContratoVenda,
          newData: newContratoVenda,
          tx,
        });
      }

      return result;
    },
  );
}
