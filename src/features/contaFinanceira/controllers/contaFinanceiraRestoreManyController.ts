import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { contaFinanceiraRestoreManyInputSchema } from '../contaFinanceiraSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const contaFinanceiraRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/conta-financeira/restore',
  query: contaFinanceiraRestoreManyInputSchema,
};

export const contaFinanceiraRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'conta-financeira_restore_many',
  description: dictionary.contaFinanceira.mcpDescription.restore,
  requiredPermissions: { contaFinanceira: ['restore'] },
  schema: toMcpJsonSchema(contaFinanceiraRestoreManyInputSchema),
  handler: async (params, context) => {
    return await contaFinanceiraRestoreManyController(params, context);
  },
});

export async function contaFinanceiraRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      contaFinanceira: ['restore'],
    },
    context,
  );

  const { ids } = contaFinanceiraRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldContasFinanceiras = await tx.contaFinanceira.findMany({
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

      const result = await tx.contaFinanceira.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newContasFinanceiras = await tx.contaFinanceira.findMany({
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

      for (const oldContaFinanceira of oldContasFinanceiras) {
        const newContaFinanceira = newContasFinanceiras.find(
          (c) => c.id === oldContaFinanceira.id,
        );
        await auditLogCreate({
          entityId: oldContaFinanceira.id,
          entityName: 'ContaFinanceira',
          operation: auditLogOperations.update,
          context,
          oldData: oldContaFinanceira,
          newData: newContaFinanceira,
          tx,
        });
      }

      return result;
    },
  );
}
