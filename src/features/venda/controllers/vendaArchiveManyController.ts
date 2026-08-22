import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { vendaArchiveManyInputSchema as vendaArchiveManyInputSchema } from '../vendaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const vendaArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/venda/archive',
  query: vendaArchiveManyInputSchema,
};

export const vendaArchiveManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'venda_archive_many',
  description: dictionary.venda.mcpDescription.archive,
  requiredPermissions: { venda: ['archive'] },
  schema: toMcpJsonSchema(vendaArchiveManyInputSchema),
  handler: async (params, context) => {
    return await vendaArchiveManyController(params, context);
  },
});

export async function vendaArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      venda: ['archive'],
    },
    context,
  );

  const { ids } = vendaArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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
