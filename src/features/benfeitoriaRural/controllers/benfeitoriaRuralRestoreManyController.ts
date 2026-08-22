import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { benfeitoriaRuralRestoreManyInputSchema } from '../benfeitoriaRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const benfeitoriaRuralRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/benfeitoria-rural/restore',
  query: benfeitoriaRuralRestoreManyInputSchema,
};

export const benfeitoriaRuralRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'benfeitoria-rural_restore_many',
  description: dictionary.benfeitoriaRural.mcpDescription.restore,
  requiredPermissions: { benfeitoriaRural: ['restore'] },
  schema: toMcpJsonSchema(benfeitoriaRuralRestoreManyInputSchema),
  handler: async (params, context) => {
    return await benfeitoriaRuralRestoreManyController(params, context);
  },
});

export async function benfeitoriaRuralRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      benfeitoriaRural: ['restore'],
    },
    context,
  );

  const { ids } = benfeitoriaRuralRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldBenfeitoriasRurais = await tx.benfeitoriaRural.findMany({
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

      const result = await tx.benfeitoriaRural.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newBenfeitoriasRurais = await tx.benfeitoriaRural.findMany({
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

      for (const oldBenfeitoriaRural of oldBenfeitoriasRurais) {
        const newBenfeitoriaRural = newBenfeitoriasRurais.find(
          (c) => c.id === oldBenfeitoriaRural.id,
        );
        await auditLogCreate({
          entityId: oldBenfeitoriaRural.id,
          entityName: 'BenfeitoriaRural',
          operation: auditLogOperations.update,
          context,
          oldData: oldBenfeitoriaRural,
          newData: newBenfeitoriaRural,
          tx,
        });
      }

      return result;
    },
  );
}
