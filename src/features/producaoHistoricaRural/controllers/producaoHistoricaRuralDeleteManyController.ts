import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { producaoHistoricaRuralDeleteManyInputSchema } from '../producaoHistoricaRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const producaoHistoricaRuralDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/producao-historica-rural',
  query: producaoHistoricaRuralDeleteManyInputSchema,
};

export const producaoHistoricaRuralDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'producaoHistoricaRural_delete_many',
  description: dictionary.producaoHistoricaRural.mcpDescription.delete,
  requiredPermissions: { producaoHistoricaRural: ['delete'] },
  schema: toMcpJsonSchema(producaoHistoricaRuralDeleteManyInputSchema),
  handler: async (params, context) => {
    return await producaoHistoricaRuralDeleteManyController(params, context);
  },
});

export async function producaoHistoricaRuralDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      producaoHistoricaRural: ['delete'],
    },
    context,
  );

  const { ids } = producaoHistoricaRuralDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const producoesHistoricasRuraisToDelete =
        await tx.producaoHistoricaRural.findMany({
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

      const result = await tx.producaoHistoricaRural.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const producaoHistoricaRural of producoesHistoricasRuraisToDelete) {
        await auditLogCreate({
          entityId: producaoHistoricaRural.id,
          entityName: 'ProducaoHistoricaRural',
          operation: auditLogOperations.delete,
          context,
          oldData: producaoHistoricaRural,
          tx,
        });
      }

      return result;
    },
  );
}
