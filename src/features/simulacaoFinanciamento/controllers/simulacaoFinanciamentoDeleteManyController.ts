import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { simulacaoFinanciamentoDeleteManyInputSchema } from '../simulacaoFinanciamentoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const simulacaoFinanciamentoDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/simulacao-financiamento',
  query: simulacaoFinanciamentoDeleteManyInputSchema,
};

export const simulacaoFinanciamentoDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'simulacaoFinanciamento_delete_many',
  description: dictionary.simulacaoFinanciamento.mcpDescription.delete,
  requiredPermissions: { simulacaoFinanciamento: ['delete'] },
  schema: toMcpJsonSchema(simulacaoFinanciamentoDeleteManyInputSchema),
  handler: async (params, context) => {
    return await simulacaoFinanciamentoDeleteManyController(params, context);
  },
});

export async function simulacaoFinanciamentoDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      simulacaoFinanciamento: ['delete'],
    },
    context,
  );

  const { ids } = simulacaoFinanciamentoDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const simulacoesFinanciamentoToDelete =
        await tx.simulacaoFinanciamento.findMany({
          where: {
            id: { in: ids },
            organizationId: currentOrganization.id,
          },
          include: {
            cliente: {
              select: {
                id: true,
                nomeRazaoSocial: true,
              },
            },
            imovel: {
              select: {
                id: true,
                titulo: true,
              },
            },
            proposta: {
              select: {
                id: true,
                codigo: true,
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

      const result = await tx.simulacaoFinanciamento.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const simulacaoFinanciamento of simulacoesFinanciamentoToDelete) {
        await auditLogCreate({
          entityId: simulacaoFinanciamento.id,
          entityName: 'SimulacaoFinanciamento',
          operation: auditLogOperations.delete,
          context,
          oldData: simulacaoFinanciamento,
          tx,
        });
      }

      return result;
    },
  );
}
