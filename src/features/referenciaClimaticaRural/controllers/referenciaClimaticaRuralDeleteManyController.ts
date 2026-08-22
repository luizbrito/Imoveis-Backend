import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { referenciaClimaticaRuralDeleteManyInputSchema } from '../referenciaClimaticaRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const referenciaClimaticaRuralDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/referencia-climatica-rural',
  query: referenciaClimaticaRuralDeleteManyInputSchema,
};

export const referenciaClimaticaRuralDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'referenciaClimaticaRural_delete_many',
  description: dictionary.referenciaClimaticaRural.mcpDescription.delete,
  requiredPermissions: { referenciaClimaticaRural: ['delete'] },
  schema: toMcpJsonSchema(referenciaClimaticaRuralDeleteManyInputSchema),
  handler: async (params, context) => {
    return await referenciaClimaticaRuralDeleteManyController(params, context);
  },
});

export async function referenciaClimaticaRuralDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      referenciaClimaticaRural: ['delete'],
    },
    context,
  );

  const { ids } = referenciaClimaticaRuralDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const referenciasClimaticasRuraisToDelete =
        await tx.referenciaClimaticaRural.findMany({
          where: {
            id: { in: ids },
            organizationId: currentOrganization.id,
          },
          include: {
            imovel: {
              select: {
                id: true,
                titulo: true,
              },
            },
            createdByMember: {
              select: {
                id: true,
                fullName: true,
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
            updatedByMember: {
              select: {
                id: true,
                fullName: true,
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
            archivedByMember: {
              select: {
                id: true,
                fullName: true,
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
          },
        });

      const result = await tx.referenciaClimaticaRural.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const referenciaClimaticaRural of referenciasClimaticasRuraisToDelete) {
        await auditLogCreate({
          entityId: referenciaClimaticaRural.id,
          entityName: 'ReferenciaClimaticaRural',
          operation: auditLogOperations.delete,
          context,
          oldData: referenciaClimaticaRural,
          tx,
        });
      }

      return result;
    },
  );
}
