import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { referenciaClimaticaRuralRestoreManyInputSchema } from '../referenciaClimaticaRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const referenciaClimaticaRuralRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/referencia-climatica-rural/restore',
  query: referenciaClimaticaRuralRestoreManyInputSchema,
};

export const referenciaClimaticaRuralRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'referencia-climatica-rural_restore_many',
  description: dictionary.referenciaClimaticaRural.mcpDescription.restore,
  requiredPermissions: { referenciaClimaticaRural: ['restore'] },
  schema: toMcpJsonSchema(referenciaClimaticaRuralRestoreManyInputSchema),
  handler: async (params, context) => {
    return await referenciaClimaticaRuralRestoreManyController(params, context);
  },
});

export async function referenciaClimaticaRuralRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      referenciaClimaticaRural: ['restore'],
    },
    context,
  );

  const { ids } = referenciaClimaticaRuralRestoreManyInputSchema.parse(query);

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
          archivedAt: null,
          archivedByMemberId: null,
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
