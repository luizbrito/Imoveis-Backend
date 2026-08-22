import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { visitaArchiveManyInputSchema as visitaArchiveManyInputSchema } from '../visitaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const visitaArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/visita/archive',
  query: visitaArchiveManyInputSchema,
};

export const visitaArchiveManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'visita_archive_many',
  description: dictionary.visita.mcpDescription.archive,
  requiredPermissions: { visita: ['archive'] },
  schema: toMcpJsonSchema(visitaArchiveManyInputSchema),
  handler: async (params, context) => {
    return await visitaArchiveManyController(params, context);
  },
});

export async function visitaArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      visita: ['archive'],
    },
    context,
  );

  const { ids } = visitaArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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
