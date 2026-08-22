import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { contratoVendaArchiveManyInputSchema as contratoVendaArchiveManyInputSchema } from '../contratoVendaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const contratoVendaArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/contrato-venda/archive',
  query: contratoVendaArchiveManyInputSchema,
};

export const contratoVendaArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'contrato-venda_archive_many',
  description: dictionary.contratoVenda.mcpDescription.archive,
  requiredPermissions: { contratoVenda: ['archive'] },
  schema: toMcpJsonSchema(contratoVendaArchiveManyInputSchema),
  handler: async (params, context) => {
    return await contratoVendaArchiveManyController(params, context);
  },
});

export async function contratoVendaArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      contratoVenda: ['archive'],
    },
    context,
  );

  const { ids } = contratoVendaArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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
