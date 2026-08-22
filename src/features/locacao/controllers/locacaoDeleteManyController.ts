import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { locacaoDeleteManyInputSchema } from '../locacaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const locacaoDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/locacao',
  query: locacaoDeleteManyInputSchema,
};

export const locacaoDeleteManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'locacao_delete_many',
  description: dictionary.locacao.mcpDescription.delete,
  requiredPermissions: { locacao: ['delete'] },
  schema: toMcpJsonSchema(locacaoDeleteManyInputSchema),
  handler: async (params, context) => {
    return await locacaoDeleteManyController(params, context);
  },
});

export async function locacaoDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      locacao: ['delete'],
    },
    context,
  );

  const { ids } = locacaoDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const locacoesToDelete = await tx.locacao.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        include: {
          filial: {
            select: {
              id: true,
              nome: true,
            },
          },
          proposta: {
            select: {
              id: true,
              codigo: true,
            },
          },
          imovel: {
            select: {
              id: true,
              titulo: true,
            },
          },
          proprietario: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          corretor: {
            select: {
              id: true,
              nomeCompleto: true,
            },
          },
          participantes: {
            select: {
              id: true,
              papel: true,
            },
          },
          garantias: {
            select: {
              id: true,
              tipo: true,
            },
          },
          contratos: {
            select: {
              id: true,
              numero: true,
            },
          },
          cobrancas: {
            select: {
              id: true,
              competencia: true,
            },
          },
          reajustes: {
            select: {
              id: true,
              dataBase: true,
            },
          },
          repasses: {
            select: {
              id: true,
              competencia: true,
            },
          },
          comissoes: {
            select: {
              id: true,
              codigo: true,
            },
          },
          solicitacoesManutencao: {
            select: {
              id: true,
              codigo: true,
            },
          },
          despesas: {
            select: {
              id: true,
              descricao: true,
            },
          },
          lancamentosFinanceiros: {
            select: {
              id: true,
              descricao: true,
            },
          },
          seguros: {
            select: {
              id: true,
              numeroApolice: true,
            },
          },
          ocorrencias: {
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

      const result = await tx.locacao.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const locacao of locacoesToDelete) {
        await auditLogCreate({
          entityId: locacao.id,
          entityName: 'Locacao',
          operation: auditLogOperations.delete,
          context,
          oldData: locacao,
          tx,
        });
      }

      return result;
    },
  );
}
