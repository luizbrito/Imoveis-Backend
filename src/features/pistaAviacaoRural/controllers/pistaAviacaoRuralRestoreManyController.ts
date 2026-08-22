import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { pistaAviacaoRuralRestoreManyInputSchema } from '../pistaAviacaoRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const pistaAviacaoRuralRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/pista-aviacao-rural/restore',
  query: pistaAviacaoRuralRestoreManyInputSchema,
};

export const pistaAviacaoRuralRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'pista-aviacao-rural_restore_many',
  description: dictionary.pistaAviacaoRural.mcpDescription.restore,
  requiredPermissions: { pistaAviacaoRural: ['restore'] },
  schema: toMcpJsonSchema(pistaAviacaoRuralRestoreManyInputSchema),
  handler: async (params, context) => {
    return await pistaAviacaoRuralRestoreManyController(params, context);
  },
});

export async function pistaAviacaoRuralRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      pistaAviacaoRural: ['restore'],
    },
    context,
  );

  const { ids } = pistaAviacaoRuralRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldPistasAviacaoRurais = await tx.pistaAviacaoRural.findMany({
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

      const result = await tx.pistaAviacaoRural.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newPistasAviacaoRurais = await tx.pistaAviacaoRural.findMany({
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

      for (const oldPistaAviacaoRural of oldPistasAviacaoRurais) {
        const newPistaAviacaoRural = newPistasAviacaoRurais.find(
          (c) => c.id === oldPistaAviacaoRural.id,
        );
        await auditLogCreate({
          entityId: oldPistaAviacaoRural.id,
          entityName: 'PistaAviacaoRural',
          operation: auditLogOperations.update,
          context,
          oldData: oldPistaAviacaoRural,
          newData: newPistaAviacaoRural,
          tx,
        });
      }

      return result;
    },
  );
}
