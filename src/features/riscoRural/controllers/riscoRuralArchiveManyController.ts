import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { riscoRuralArchiveManyInputSchema as riscoRuralArchiveManyInputSchema } from '../riscoRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const riscoRuralArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/risco-rural/archive',
  query: riscoRuralArchiveManyInputSchema,
};

export const riscoRuralArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'risco-rural_archive_many',
  description: dictionary.riscoRural.mcpDescription.archive,
  requiredPermissions: { riscoRural: ['archive'] },
  schema: toMcpJsonSchema(riscoRuralArchiveManyInputSchema),
  handler: async (params, context) => {
    return await riscoRuralArchiveManyController(params, context);
  },
});

export async function riscoRuralArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      riscoRural: ['archive'],
    },
    context,
  );

  const { ids } = riscoRuralArchiveManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldRiscosRurais = await tx.riscoRural.findMany({
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

      const result = await tx.riscoRural.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
        },
      });

      const newRiscosRurais = await tx.riscoRural.findMany({
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

      for (const oldRiscoRural of oldRiscosRurais) {
        const newRiscoRural = newRiscosRurais.find(
          (c) => c.id === oldRiscoRural.id,
        );
        await auditLogCreate({
          entityId: oldRiscoRural.id,
          entityName: 'RiscoRural',
          operation: auditLogOperations.update,
          context,
          oldData: oldRiscoRural,
          newData: newRiscoRural,
          tx,
        });
      }

      return result;
    },
  );
}
