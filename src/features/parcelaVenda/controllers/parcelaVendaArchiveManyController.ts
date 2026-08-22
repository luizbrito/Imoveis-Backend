import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { parcelaVendaArchiveManyInputSchema as parcelaVendaArchiveManyInputSchema } from '../parcelaVendaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const parcelaVendaArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/parcela-venda/archive',
  query: parcelaVendaArchiveManyInputSchema,
};

export const parcelaVendaArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'parcela-venda_archive_many',
  description: dictionary.parcelaVenda.mcpDescription.archive,
  requiredPermissions: { parcelaVenda: ['archive'] },
  schema: toMcpJsonSchema(parcelaVendaArchiveManyInputSchema),
  handler: async (params, context) => {
    return await parcelaVendaArchiveManyController(params, context);
  },
});

export async function parcelaVendaArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      parcelaVenda: ['archive'],
    },
    context,
  );

  const { ids } = parcelaVendaArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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
