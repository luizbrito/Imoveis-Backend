import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { recursoHidricoRuralRestoreManyInputSchema } from '../recursoHidricoRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const recursoHidricoRuralRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/recurso-hidrico-rural/restore',
  query: recursoHidricoRuralRestoreManyInputSchema,
};

export const recursoHidricoRuralRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'recurso-hidrico-rural_restore_many',
  description: dictionary.recursoHidricoRural.mcpDescription.restore,
  requiredPermissions: { recursoHidricoRural: ['restore'] },
  schema: toMcpJsonSchema(recursoHidricoRuralRestoreManyInputSchema),
  handler: async (params, context) => {
    return await recursoHidricoRuralRestoreManyController(params, context);
  },
});

export async function recursoHidricoRuralRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      recursoHidricoRural: ['restore'],
    },
    context,
  );

  const { ids } = recursoHidricoRuralRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldRecursosHidricosRurais = await tx.recursoHidricoRural.findMany({
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

      const result = await tx.recursoHidricoRural.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newRecursosHidricosRurais = await tx.recursoHidricoRural.findMany({
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

      for (const oldRecursoHidricoRural of oldRecursosHidricosRurais) {
        const newRecursoHidricoRural = newRecursosHidricosRurais.find(
          (c) => c.id === oldRecursoHidricoRural.id,
        );
        await auditLogCreate({
          entityId: oldRecursoHidricoRural.id,
          entityName: 'RecursoHidricoRural',
          operation: auditLogOperations.update,
          context,
          oldData: oldRecursoHidricoRural,
          newData: newRecursoHidricoRural,
          tx,
        });
      }

      return result;
    },
  );
}
