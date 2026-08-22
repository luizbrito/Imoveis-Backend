import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { seguroImovelFindManyInputSchema } from '../seguroImovelSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const seguroImovelFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/seguro-imovel',
  query: seguroImovelFindManyInputSchema,
  response: '{ segurosImovel: SeguroImovel[], count: number }',
};

export const seguroImovelFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'seguroImovel_list',
  description: dictionary.seguroImovel.mcpDescription.list,
  requiredPermissions: { seguroImovel: ['read'] },
  schema: toMcpJsonSchema(seguroImovelFindManyInputSchema),
  handler: async (params, context) => {
    return await seguroImovelFindManyController(params, context);
  },
});

export async function seguroImovelFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      seguroImovel: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    seguroImovelFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.SeguroImovelWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.archived !== 'true') {
        whereAnd.push({ archivedAt: null });
      }
      if (filter?.tipo != null) {
        whereAnd.push({
          tipo: filter?.tipo,
        });
      }
      if (filter?.seguradora != null) {
        whereAnd.push({
          seguradora: { contains: filter?.seguradora, mode: 'insensitive' },
        });
      }
      if (filter?.numeroApolice != null) {
        whereAnd.push({
          numeroApolice: {
            contains: filter?.numeroApolice,
            mode: 'insensitive',
          },
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
      if (filter?.valorPremioRange?.length) {
        const start = filter.valorPremioRange?.[0];
        const end = filter.valorPremioRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorPremio: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorPremio: { lte: end },
          });
        }
      }
      if (filter?.valorCoberturaRange?.length) {
        const start = filter.valorCoberturaRange?.[0];
        const end = filter.valorCoberturaRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorCobertura: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorCobertura: { lte: end },
          });
        }
      }
      if (filter?.status != null) {
        whereAnd.push({
          status: filter?.status,
        });
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

      let segurosImovel = await tx.seguroImovel.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          imovel: true,
          locacao: true,
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

      const count = await tx.seguroImovel.count({
        where: {
          AND: whereAnd,
        },
      });

      segurosImovel = await filePopulateDownloadUrlInTree(segurosImovel);

      return { segurosImovel, count };
    },
  );
}
