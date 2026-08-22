import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { despesaImovelDeleteManyInputSchema } from '../despesaImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const despesaImovelDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/despesa-imovel',
  query: despesaImovelDeleteManyInputSchema,
};

export const despesaImovelDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'despesaImovel_delete_many',
  description: dictionary.despesaImovel.mcpDescription.delete,
  requiredPermissions: { despesaImovel: ['delete'] },
  schema: toMcpJsonSchema(despesaImovelDeleteManyInputSchema),
  handler: async (params, context) => {
    return await despesaImovelDeleteManyController(params, context);
  },
});

export async function despesaImovelDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      despesaImovel: ['delete'],
    },
    context,
  );

  const { ids } = despesaImovelDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const despesasImovelToDelete = await tx.despesaImovel.findMany({
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
          fornecedor: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          locacao: {
            select: {
              id: true,
              codigo: true,
            },
          },
          ordemServico: {
            select: {
              id: true,
              codigo: true,
            },
          },
          lancamentosFinanceiros: {
            select: {
              id: true,
              descricao: true,
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

      const result = await tx.despesaImovel.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const despesaImovel of despesasImovelToDelete) {
        await auditLogCreate({
          entityId: despesaImovel.id,
          entityName: 'DespesaImovel',
          operation: auditLogOperations.delete,
          context,
          oldData: despesaImovel,
          tx,
        });
      }

      return result;
    },
  );
}
