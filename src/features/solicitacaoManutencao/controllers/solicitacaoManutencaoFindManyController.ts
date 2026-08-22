import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { solicitacaoManutencaoFindManyInputSchema } from '../solicitacaoManutencaoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const solicitacaoManutencaoFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/solicitacao-manutencao',
  query: solicitacaoManutencaoFindManyInputSchema,
  response:
    '{ solicitacoesManutencao: SolicitacaoManutencao[], count: number }',
};

export const solicitacaoManutencaoFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'solicitacaoManutencao_list',
  description: dictionary.solicitacaoManutencao.mcpDescription.list,
  requiredPermissions: { solicitacaoManutencao: ['read'] },
  schema: toMcpJsonSchema(solicitacaoManutencaoFindManyInputSchema),
  handler: async (params, context) => {
    return await solicitacaoManutencaoFindManyController(params, context);
  },
});

export async function solicitacaoManutencaoFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      solicitacaoManutencao: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    solicitacaoManutencaoFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.SolicitacaoManutencaoWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.archived !== 'true') {
        whereAnd.push({ archivedAt: null });
      }
      if (filter?.codigo != null) {
        whereAnd.push({
          codigo: { contains: filter?.codigo, mode: 'insensitive' },
        });
      }
      if (filter?.dataAberturaRange?.length) {
        const start = filter.dataAberturaRange?.[0];
        const end = filter.dataAberturaRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataAbertura: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataAbertura: {
              lte: end,
            },
          });
        }
      }
      if (filter?.origem != null) {
        whereAnd.push({
          origem: filter?.origem,
        });
      }
      if (filter?.categoria != null) {
        whereAnd.push({
          categoria: filter?.categoria,
        });
      }
      if (filter?.prioridade != null) {
        whereAnd.push({
          prioridade: filter?.prioridade,
        });
      }
      if (filter?.status != null) {
        whereAnd.push({
          status: filter?.status,
        });
      }
      if (filter?.titulo != null) {
        whereAnd.push({
          titulo: { contains: filter?.titulo, mode: 'insensitive' },
        });
      }
      if (filter?.responsabilidadeCusto != null) {
        whereAnd.push({
          responsabilidadeCusto: filter?.responsabilidadeCusto,
        });
      }
      if (filter?.valorLimiteAutorizadoRange?.length) {
        const start = filter.valorLimiteAutorizadoRange?.[0];
        const end = filter.valorLimiteAutorizadoRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorLimiteAutorizado: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorLimiteAutorizado: { lte: end },
          });
        }
      }
      if (filter?.dataConclusaoRange?.length) {
        const start = filter.dataConclusaoRange?.[0];
        const end = filter.dataConclusaoRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataConclusao: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataConclusao: {
              lte: end,
            },
          });
        }
      }
      if (filter?.imovel != null) {
        whereAnd.push({
          imovel: {
            id: filter.imovel,
          },
        });
      }
      if (filter?.locacao != null) {
        whereAnd.push({
          locacao: {
            id: filter.locacao,
          },
        });
      }
      if (filter?.clienteSolicitante != null) {
        whereAnd.push({
          clienteSolicitante: {
            id: filter.clienteSolicitante,
          },
        });
      }
      if (filter?.corretorResponsavel != null) {
        whereAnd.push({
          corretorResponsavel: {
            id: filter.corretorResponsavel,
          },
        });
      }
      if (filter?.createdByMember != null) {
        whereAnd.push({
          createdByMember: {
            id: filter.createdByMember,
          },
        });
      }

      if (filter?.updatedByMember != null) {
        whereAnd.push({
          updatedByMember: {
            id: filter.updatedByMember,
          },
        });
      }

      if (filter?.createdAtRange?.length) {
        const start = filter.createdAtRange?.[0];
        const end = filter.createdAtRange?.[1];

        if (start != null) {
          whereAnd.push({
            createdAt: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            createdAt: {
              lte: end,
            },
          });
        }
      }

      if (filter?.updatedAtRange?.length) {
        const start = filter.updatedAtRange?.[0];
        const end = filter.updatedAtRange?.[1];

        if (start != null) {
          whereAnd.push({
            updatedAt: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            updatedAt: {
              lte: end,
            },
          });
        }
      }

      let solicitacoesManutencao = await tx.solicitacaoManutencao.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          imovel: true,
          locacao: true,
          clienteSolicitante: true,
          corretorResponsavel: true,
          createdByMember: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
          updatedByMember: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      const count = await tx.solicitacaoManutencao.count({
        where: {
          AND: whereAnd,
        },
      });

      solicitacoesManutencao = await filePopulateDownloadUrlInTree(
        solicitacoesManutencao,
      );

      return { solicitacoesManutencao, count };
    },
  );
}
