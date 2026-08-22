import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { ativoIncluidoVendaRuralDeleteManyInputSchema } from '../ativoIncluidoVendaRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const ativoIncluidoVendaRuralDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/ativo-incluido-venda-rural',
  query: ativoIncluidoVendaRuralDeleteManyInputSchema,
};

export const ativoIncluidoVendaRuralDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'ativoIncluidoVendaRural_delete_many',
  description: dictionary.ativoIncluidoVendaRural.mcpDescription.delete,
  requiredPermissions: { ativoIncluidoVendaRural: ['delete'] },
  schema: toMcpJsonSchema(ativoIncluidoVendaRuralDeleteManyInputSchema),
  handler: async (params, context) => {
    return await ativoIncluidoVendaRuralDeleteManyController(params, context);
  },
});

export async function ativoIncluidoVendaRuralDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      ativoIncluidoVendaRural: ['delete'],
    },
    context,
  );

  const { ids } = ativoIncluidoVendaRuralDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const ativosIncluidosVendaRuralToDelete =
        await tx.ativoIncluidoVendaRural.findMany({
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

      const result = await tx.ativoIncluidoVendaRural.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const ativoIncluidoVendaRural of ativosIncluidosVendaRuralToDelete) {
        await auditLogCreate({
          entityId: ativoIncluidoVendaRural.id,
          entityName: 'AtivoIncluidoVendaRural',
          operation: auditLogOperations.delete,
          context,
          oldData: ativoIncluidoVendaRural,
          tx,
        });
      }

      return result;
    },
  );
}
