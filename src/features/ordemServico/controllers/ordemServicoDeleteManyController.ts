import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { ordemServicoDeleteManyInputSchema } from '../ordemServicoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const ordemServicoDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/ordem-servico',
  query: ordemServicoDeleteManyInputSchema,
};

export const ordemServicoDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'ordemServico_delete_many',
  description: dictionary.ordemServico.mcpDescription.delete,
  requiredPermissions: { ordemServico: ['delete'] },
  schema: toMcpJsonSchema(ordemServicoDeleteManyInputSchema),
  handler: async (params, context) => {
    return await ordemServicoDeleteManyController(params, context);
  },
});

export async function ordemServicoDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      ordemServico: ['delete'],
    },
    context,
  );

  const { ids } = ordemServicoDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const ordensServicoToDelete = await tx.ordemServico.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        include: {
          solicitacao: {
            select: {
              id: true,
              codigo: true,
            },
          },
          fornecedor: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          despesas: {
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

      const result = await tx.ordemServico.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const ordemServico of ordensServicoToDelete) {
        await auditLogCreate({
          entityId: ordemServico.id,
          entityName: 'OrdemServico',
          operation: auditLogOperations.delete,
          context,
          oldData: ordemServico,
          tx,
        });
      }

      return result;
    },
  );
}
