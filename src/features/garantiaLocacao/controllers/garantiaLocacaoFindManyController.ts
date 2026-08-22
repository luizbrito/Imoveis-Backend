import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { garantiaLocacaoFindManyInputSchema } from '../garantiaLocacaoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const garantiaLocacaoFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/garantia-locacao',
  query: garantiaLocacaoFindManyInputSchema,
  response: '{ garantiasLocacao: GarantiaLocacao[], count: number }',
};

export const garantiaLocacaoFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'garantiaLocacao_list',
  description: dictionary.garantiaLocacao.mcpDescription.list,
  requiredPermissions: { garantiaLocacao: ['read'] },
  schema: toMcpJsonSchema(garantiaLocacaoFindManyInputSchema),
  handler: async (params, context) => {
    return await garantiaLocacaoFindManyController(params, context);
  },
});

export async function garantiaLocacaoFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      garantiaLocacao: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    garantiaLocacaoFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.GarantiaLocacaoWhereInput> = [];

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
      if (filter?.status != null) {
        whereAnd.push({
          status: filter?.status,
        });
      }
      if (filter?.valorGarantiaRange?.length) {
        const start = filter.valorGarantiaRange?.[0];
        const end = filter.valorGarantiaRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorGarantia: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorGarantia: { lte: end },
          });
        }
      }
      if (filter?.garantidorNome != null) {
        whereAnd.push({
          garantidorNome: {
            contains: filter?.garantidorNome,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.garantidorCpfCnpj != null) {
        whereAnd.push({
          garantidorCpfCnpj: {
            contains: filter?.garantidorCpfCnpj,
            mode: 'insensitive',
          },
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

      let garantiasLocacao = await tx.garantiaLocacao.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
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

      const count = await tx.garantiaLocacao.count({
        where: {
          AND: whereAnd,
        },
      });

      garantiasLocacao = await filePopulateDownloadUrlInTree(garantiasLocacao);

      return { garantiasLocacao, count };
    },
  );
}
