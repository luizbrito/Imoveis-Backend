import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { contratoAdministracaoFindManyInputSchema } from '../contratoAdministracaoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const contratoAdministracaoFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/contrato-administracao',
  query: contratoAdministracaoFindManyInputSchema,
  response:
    '{ contratosAdministracao: ContratoAdministracao[], count: number }',
};

export const contratoAdministracaoFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'contratoAdministracao_list',
  description: dictionary.contratoAdministracao.mcpDescription.list,
  requiredPermissions: { contratoAdministracao: ['read'] },
  schema: toMcpJsonSchema(contratoAdministracaoFindManyInputSchema),
  handler: async (params, context) => {
    return await contratoAdministracaoFindManyController(params, context);
  },
});

export async function contratoAdministracaoFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      contratoAdministracao: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    contratoAdministracaoFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.ContratoAdministracaoWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.archived !== 'true') {
        whereAnd.push({ archivedAt: null });
      }
      if (filter?.numero != null) {
        whereAnd.push({
          numero: { contains: filter?.numero, mode: 'insensitive' },
        });
      }
      if (filter?.status != null) {
        whereAnd.push({
          status: filter?.status,
        });
      }
      if (filter?.dataInicioRange?.length) {
        const start = filter.dataInicioRange?.[0];
        const end = filter.dataInicioRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataInicio: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataInicio: {
              lte: end,
            },
          });
        }
      }
      if (filter?.dataFimRange?.length) {
        const start = filter.dataFimRange?.[0];
        const end = filter.dataFimRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataFim: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataFim: {
              lte: end,
            },
          });
        }
      }
      if (filter?.taxaAdministracaoPercentualRange?.length) {
        const start = filter.taxaAdministracaoPercentualRange?.[0];
        const end = filter.taxaAdministracaoPercentualRange?.[1];

        if (start != null) {
          whereAnd.push({
            taxaAdministracaoPercentual: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            taxaAdministracaoPercentual: { lte: end },
          });
        }
      }
      if (filter?.taxaIntermediacaoPercentualRange?.length) {
        const start = filter.taxaIntermediacaoPercentualRange?.[0];
        const end = filter.taxaIntermediacaoPercentualRange?.[1];

        if (start != null) {
          whereAnd.push({
            taxaIntermediacaoPercentual: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            taxaIntermediacaoPercentual: { lte: end },
          });
        }
      }
      if (filter?.prazoRepasseDiasRange?.length) {
        const start = filter.prazoRepasseDiasRange?.[0];
        const end = filter.prazoRepasseDiasRange?.[1];

        if (start != null) {
          whereAnd.push({
            prazoRepasseDias: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            prazoRepasseDias: { lte: end },
          });
        }
      }
      if (filter?.autorizaManutencaoAteRange?.length) {
        const start = filter.autorizaManutencaoAteRange?.[0];
        const end = filter.autorizaManutencaoAteRange?.[1];

        if (start != null) {
          whereAnd.push({
            autorizaManutencaoAte: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            autorizaManutencaoAte: { lte: end },
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
      if (filter?.proprietario != null) {
        whereAnd.push({
          proprietario: {
            id: filter.proprietario,
          },
        });
      }
      if (filter?.filial != null) {
        whereAnd.push({
          filial: {
            id: filter.filial,
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

      let contratosAdministracao = await tx.contratoAdministracao.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          imovel: true,
          proprietario: true,
          filial: true,
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

      const count = await tx.contratoAdministracao.count({
        where: {
          AND: whereAnd,
        },
      });

      contratosAdministracao = await filePopulateDownloadUrlInTree(
        contratosAdministracao,
      );

      return { contratosAdministracao, count };
    },
  );
}
