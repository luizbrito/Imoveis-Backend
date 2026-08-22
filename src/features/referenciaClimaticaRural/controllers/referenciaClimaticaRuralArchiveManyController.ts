import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { referenciaClimaticaRuralArchiveManyInputSchema as referenciaClimaticaRuralArchiveManyInputSchema } from '../referenciaClimaticaRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const referenciaClimaticaRuralArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/referencia-climatica-rural/archive',
  query: referenciaClimaticaRuralArchiveManyInputSchema,
};

export const referenciaClimaticaRuralArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'referencia-climatica-rural_archive_many',
  description: dictionary.referenciaClimaticaRural.mcpDescription.archive,
  requiredPermissions: { referenciaClimaticaRural: ['archive'] },
  schema: toMcpJsonSchema(referenciaClimaticaRuralArchiveManyInputSchema),
  handler: async (params, context) => {
    return await referenciaClimaticaRuralArchiveManyController(params, context);
  },
});

export async function referenciaClimaticaRuralArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      referenciaClimaticaRural: ['archive'],
    },
    context,
  );

  const { ids } = referenciaClimaticaRuralArchiveManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldReferenciasClimaticasRurais =
        await tx.referenciaClimaticaRural.findMany({
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

      const result = await tx.referenciaClimaticaRural.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
        },
      });

      const newReferenciasClimaticasRurais =
        await tx.referenciaClimaticaRural.findMany({
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

      for (const oldReferenciaClimaticaRural of oldReferenciasClimaticasRurais) {
        const newReferenciaClimaticaRural = newReferenciasClimaticasRurais.find(
          (c) => c.id === oldReferenciaClimaticaRural.id,
        );
        await auditLogCreate({
          entityId: oldReferenciaClimaticaRural.id,
          entityName: 'ReferenciaClimaticaRural',
          operation: auditLogOperations.update,
          context,
          oldData: oldReferenciaClimaticaRural,
          newData: newReferenciaClimaticaRural,
          tx,
        });
      }

      return result;
    },
  );
}
