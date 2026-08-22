import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { fornecedorArchiveManyInputSchema as fornecedorArchiveManyInputSchema } from '../fornecedorSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const fornecedorArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/fornecedor/archive',
  query: fornecedorArchiveManyInputSchema,
};

export const fornecedorArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'fornecedor_archive_many',
  description: dictionary.fornecedor.mcpDescription.archive,
  requiredPermissions: { fornecedor: ['archive'] },
  schema: toMcpJsonSchema(fornecedorArchiveManyInputSchema),
  handler: async (params, context) => {
    return await fornecedorArchiveManyController(params, context);
  },
});

export async function fornecedorArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      fornecedor: ['archive'],
    },
    context,
  );

  const { ids } = fornecedorArchiveManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldFornecedores = await tx.fornecedor.findMany({
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

      const result = await tx.fornecedor.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
        },
      });

      const newFornecedores = await tx.fornecedor.findMany({
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

      for (const oldFornecedor of oldFornecedores) {
        const newFornecedor = newFornecedores.find(
          (c) => c.id === oldFornecedor.id,
        );
        await auditLogCreate({
          entityId: oldFornecedor.id,
          entityName: 'Fornecedor',
          operation: auditLogOperations.update,
          context,
          oldData: oldFornecedor,
          newData: newFornecedor,
          tx,
        });
      }

      return result;
    },
  );
}
