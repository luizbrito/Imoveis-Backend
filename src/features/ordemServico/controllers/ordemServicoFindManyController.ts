import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { ordemServicoFindManyInputSchema } from '../ordemServicoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const ordemServicoFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/ordem-servico',
  query: ordemServicoFindManyInputSchema,
  response: '{ ordensServico: OrdemServico[], count: number }',
};

export const ordemServicoFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'ordemServico_list',
  description: dictionary.ordemServico.mcpDescription.list,
  requiredPermissions: { ordemServico: ['read'] },
  schema: toMcpJsonSchema(ordemServicoFindManyInputSchema),
  handler: async (params, context) => {
    return await ordemServicoFindManyController(params, context);
  },
});

export async function ordemServicoFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      ordemServico: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    ordemServicoFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.OrdemServicoWhereInput> = [];

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
      if (filter?.status != null) {
        whereAnd.push({
          status: filter?.status,
        });
      }
      if (filter?.dataEmissaoRange?.length) {
        const start = filter.dataEmissaoRange?.[0];
        const end = filter.dataEmissaoRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataEmissao: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataEmissao: {
              lte: end,
            },
          });
        }
      }
      if (filter?.dataAgendadaRange?.length) {
        const start = filter.dataAgendadaRange?.[0];
        const end = filter.dataAgendadaRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataAgendada: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataAgendada: {
              lte: end,
            },
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
      if (filter?.valorOrcadoRange?.length) {
        const start = filter.valorOrcadoRange?.[0];
        const end = filter.valorOrcadoRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorOrcado: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorOrcado: { lte: end },
          });
        }
      }
      if (filter?.valorAprovadoRange?.length) {
        const start = filter.valorAprovadoRange?.[0];
        const end = filter.valorAprovadoRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorAprovado: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorAprovado: { lte: end },
          });
        }
      }
      if (filter?.valorFinalRange?.length) {
        const start = filter.valorFinalRange?.[0];
        const end = filter.valorFinalRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorFinal: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorFinal: { lte: end },
          });
        }
      }
      if (filter?.avaliacaoServicoRange?.length) {
        const start = filter.avaliacaoServicoRange?.[0];
        const end = filter.avaliacaoServicoRange?.[1];

        if (start != null) {
          whereAnd.push({
            avaliacaoServico: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            avaliacaoServico: { lte: end },
          });
        }
      }
      if (filter?.solicitacao != null) {
        whereAnd.push({
          solicitacao: {
            id: filter.solicitacao,
          },
        });
      }
      if (filter?.fornecedor != null) {
        whereAnd.push({
          fornecedor: {
            id: filter.fornecedor,
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

      let ordensServico = await tx.ordemServico.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          solicitacao: true,
          fornecedor: true,
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

      const count = await tx.ordemServico.count({
        where: {
          AND: whereAnd,
        },
      });

      ordensServico = await filePopulateDownloadUrlInTree(ordensServico);

      return { ordensServico, count };
    },
  );
}
