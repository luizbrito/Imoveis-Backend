import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { contaFinanceiraArchiveManyInputSchema as contaFinanceiraArchiveManyInputSchema } from '../contaFinanceiraSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const contaFinanceiraArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/conta-financeira/archive',
  query: contaFinanceiraArchiveManyInputSchema,
};

export const contaFinanceiraArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'conta-financeira_archive_many',
  description: dictionary.contaFinanceira.mcpDescription.archive,
  requiredPermissions: { contaFinanceira: ['archive'] },
  schema: toMcpJsonSchema(contaFinanceiraArchiveManyInputSchema),
  handler: async (params, context) => {
    return await contaFinanceiraArchiveManyController(params, context);
  },
});

export async function contaFinanceiraArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      contaFinanceira: ['archive'],
    },
    context,
  );

  const { ids } = contaFinanceiraArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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
