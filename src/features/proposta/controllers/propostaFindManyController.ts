import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { propostaFindManyInputSchema } from '../propostaSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const propostaFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/proposta',
  query: propostaFindManyInputSchema,
  response: '{ propostas: Proposta[], count: number }',
};

export const propostaFindManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'proposta_list',
  description: dictionary.proposta.mcpDescription.list,
  requiredPermissions: { proposta: ['read'] },
  schema: toMcpJsonSchema(propostaFindManyInputSchema),
  handler: async (params, context) => {
    return await propostaFindManyController(params, context);
  },
});

export async function propostaFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      proposta: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    propostaFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.PropostaWhereInput> = [];

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
      if (filter?.tipo != null) {
        whereAnd.push({
          tipo: filter?.tipo,
        });
      }
      if (filter?.dataPropostaRange?.length) {
        const start = filter.dataPropostaRange?.[0];
        const end = filter.dataPropostaRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataProposta: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataProposta: {
              lte: end,
            },
          });
        }
      }
      if (filter?.validadeAteRange?.length) {
        const start = filter.validadeAteRange?.[0];
        const end = filter.validadeAteRange?.[1];

        if (start != null) {
          whereAnd.push({
            validadeAte: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            validadeAte: {
              lte: end,
            },
          });
        }
      }
      if (filter?.status != null) {
        whereAnd.push({
          status: filter?.status,
        });
      }
      if (filter?.valorPropostoRange?.length) {
        const start = filter.valorPropostoRange?.[0];
        const end = filter.valorPropostoRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorProposto: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorProposto: { lte: end },
          });
        }
      }
      if (filter?.moeda != null) {
        whereAnd.push({
          moeda: filter?.moeda,
        });
      }
      if (filter?.sinalRange?.length) {
        const start = filter.sinalRange?.[0];
        const end = filter.sinalRange?.[1];

        if (start != null) {
          whereAnd.push({
            sinal: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            sinal: { lte: end },
          });
        }
      }
      if (filter?.formaPagamento != null) {
        whereAnd.push({
          formaPagamento: filter?.formaPagamento,
        });
      }
      if (filter?.percentualComissaoRange?.length) {
        const start = filter.percentualComissaoRange?.[0];
        const end = filter.percentualComissaoRange?.[1];

        if (start != null) {
          whereAnd.push({
            percentualComissao: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            percentualComissao: { lte: end },
          });
        }
      }
      if (filter?.motivoRecusa != null) {
        whereAnd.push({
          motivoRecusa: { contains: filter?.motivoRecusa, mode: 'insensitive' },
        });
      }
      if (filter?.visitaOrigem != null) {
        whereAnd.push({
          visitaOrigem: {
            id: filter.visitaOrigem,
          },
        });
      }
      if (filter?.lead != null) {
        whereAnd.push({
          lead: {
            id: filter.lead,
          },
        });
      }
      if (filter?.cliente != null) {
        whereAnd.push({
          cliente: {
            id: filter.cliente,
          },
        });
      }
      if (filter?.imovel != null) {
        whereAnd.push({
          imovel: {
            id: filter.imovel,
          },
        });
      }
      if (filter?.corretor != null) {
        whereAnd.push({
          corretor: {
            id: filter.corretor,
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

      let propostas = await tx.proposta.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          visitaOrigem: true,
          lead: true,
          cliente: true,
          imovel: true,
          corretor: true,
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

      const count = await tx.proposta.count({
        where: {
          AND: whereAnd,
        },
      });

      propostas = await filePopulateDownloadUrlInTree(propostas);

      return { propostas, count };
    },
  );
}
