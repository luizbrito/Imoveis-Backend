import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { pistaAviacaoRuralArchiveManyInputSchema as pistaAviacaoRuralArchiveManyInputSchema } from '../pistaAviacaoRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const pistaAviacaoRuralArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/pista-aviacao-rural/archive',
  query: pistaAviacaoRuralArchiveManyInputSchema,
};

export const pistaAviacaoRuralArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'pista-aviacao-rural_archive_many',
  description: dictionary.pistaAviacaoRural.mcpDescription.archive,
  requiredPermissions: { pistaAviacaoRural: ['archive'] },
  schema: toMcpJsonSchema(pistaAviacaoRuralArchiveManyInputSchema),
  handler: async (params, context) => {
    return await pistaAviacaoRuralArchiveManyController(params, context);
  },
});

export async function pistaAviacaoRuralArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      pistaAviacaoRural: ['archive'],
    },
    context,
  );

  const { ids } = pistaAviacaoRuralArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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
