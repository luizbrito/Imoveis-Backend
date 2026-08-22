import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { solicitacaoManutencaoDeleteManyInputSchema } from '../solicitacaoManutencaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const solicitacaoManutencaoDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/solicitacao-manutencao',
  query: solicitacaoManutencaoDeleteManyInputSchema,
};

export const solicitacaoManutencaoDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'solicitacaoManutencao_delete_many',
  description: dictionary.solicitacaoManutencao.mcpDescription.delete,
  requiredPermissions: { solicitacaoManutencao: ['delete'] },
  schema: toMcpJsonSchema(solicitacaoManutencaoDeleteManyInputSchema),
  handler: async (params, context) => {
    return await solicitacaoManutencaoDeleteManyController(params, context);
  },
});

export async function solicitacaoManutencaoDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      solicitacaoManutencao: ['delete'],
    },
    context,
  );

  const { ids } = solicitacaoManutencaoDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const solicitacoesManutencaoToDelete =
        await tx.solicitacaoManutencao.findMany({
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
            locacao: {
              select: {
                id: true,
                codigo: true,
              },
            },
            clienteSolicitante: {
              select: {
                id: true,
                nomeRazaoSocial: true,
              },
            },
            corretorResponsavel: {
              select: {
                id: true,
                nomeCompleto: true,
              },
            },
            ordensServico: {
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

      const result = await tx.solicitacaoManutencao.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const solicitacaoManutencao of solicitacoesManutencaoToDelete) {
        await auditLogCreate({
          entityId: solicitacaoManutencao.id,
          entityName: 'SolicitacaoManutencao',
          operation: auditLogOperations.delete,
          context,
          oldData: solicitacaoManutencao,
          tx,
        });
      }

      return result;
    },
  );
}
