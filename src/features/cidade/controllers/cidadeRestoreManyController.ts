import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { cidadeRestoreManyInputSchema } from '../cidadeSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const cidadeRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/cidade/restore',
  query: cidadeRestoreManyInputSchema,
};

export const cidadeRestoreManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'cidade_restore_many',
  description: dictionary.cidade.mcpDescription.restore,
  requiredPermissions: { cidade: ['restore'] },
  schema: toMcpJsonSchema(cidadeRestoreManyInputSchema),
  handler: async (params, context) => {
    return await cidadeRestoreManyController(params, context);
  },
});

export async function cidadeRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      cidade: ['restore'],
    },
    context,
  );

  const { ids } = cidadeRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldCidades = await tx.cidade.findMany({
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

      const result = await tx.cidade.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newCidades = await tx.cidade.findMany({
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

      for (const oldCidade of oldCidades) {
        const newCidade = newCidades.find((c) => c.id === oldCidade.id);
        await auditLogCreate({
          entityId: oldCidade.id,
          entityName: 'Cidade',
          operation: auditLogOperations.update,
          context,
          oldData: oldCidade,
          newData: newCidade,
          tx,
        });
      }

      return result;
    },
  );
}
