import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { benfeitoriaRuralArchiveManyInputSchema as benfeitoriaRuralArchiveManyInputSchema } from '../benfeitoriaRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const benfeitoriaRuralArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/benfeitoria-rural/archive',
  query: benfeitoriaRuralArchiveManyInputSchema,
};

export const benfeitoriaRuralArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'benfeitoria-rural_archive_many',
  description: dictionary.benfeitoriaRural.mcpDescription.archive,
  requiredPermissions: { benfeitoriaRural: ['archive'] },
  schema: toMcpJsonSchema(benfeitoriaRuralArchiveManyInputSchema),
  handler: async (params, context) => {
    return await benfeitoriaRuralArchiveManyController(params, context);
  },
});

export async function benfeitoriaRuralArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      benfeitoriaRural: ['archive'],
    },
    context,
  );

  const { ids } = benfeitoriaRuralArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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
