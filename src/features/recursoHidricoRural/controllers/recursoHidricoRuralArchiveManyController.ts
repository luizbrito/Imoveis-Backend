import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { recursoHidricoRuralArchiveManyInputSchema as recursoHidricoRuralArchiveManyInputSchema } from '../recursoHidricoRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const recursoHidricoRuralArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/recurso-hidrico-rural/archive',
  query: recursoHidricoRuralArchiveManyInputSchema,
};

export const recursoHidricoRuralArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'recurso-hidrico-rural_archive_many',
  description: dictionary.recursoHidricoRural.mcpDescription.archive,
  requiredPermissions: { recursoHidricoRural: ['archive'] },
  schema: toMcpJsonSchema(recursoHidricoRuralArchiveManyInputSchema),
  handler: async (params, context) => {
    return await recursoHidricoRuralArchiveManyController(params, context);
  },
});

export async function recursoHidricoRuralArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      recursoHidricoRural: ['archive'],
    },
    context,
  );

  const { ids } = recursoHidricoRuralArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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
