import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { visitaRestoreManyInputSchema } from '../visitaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const visitaRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/visita/restore',
  query: visitaRestoreManyInputSchema,
};

export const visitaRestoreManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'visita_restore_many',
  description: dictionary.visita.mcpDescription.restore,
  requiredPermissions: { visita: ['restore'] },
  schema: toMcpJsonSchema(visitaRestoreManyInputSchema),
  handler: async (params, context) => {
    return await visitaRestoreManyController(params, context);
  },
});

export async function visitaRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      visita: ['restore'],
    },
    context,
  );

  const { ids } = visitaRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldVisitas = await tx.visita.findMany({
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

      const result = await tx.visita.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newVisitas = await tx.visita.findMany({
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

      for (const oldVisita of oldVisitas) {
        const newVisita = newVisitas.find((c) => c.id === oldVisita.id);
        await auditLogCreate({
          entityId: oldVisita.id,
          entityName: 'Visita',
          operation: auditLogOperations.update,
          context,
          oldData: oldVisita,
          newData: newVisita,
          tx,
        });
      }

      return result;
    },
  );
}
