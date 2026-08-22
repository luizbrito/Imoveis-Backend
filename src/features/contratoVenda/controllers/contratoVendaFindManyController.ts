import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { contratoVendaFindManyInputSchema } from '../contratoVendaSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const contratoVendaFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/contrato-venda',
  query: contratoVendaFindManyInputSchema,
  response: '{ contratosVenda: ContratoVenda[], count: number }',
};

export const contratoVendaFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'contratoVenda_list',
  description: dictionary.contratoVenda.mcpDescription.list,
  requiredPermissions: { contratoVenda: ['read'] },
  schema: toMcpJsonSchema(contratoVendaFindManyInputSchema),
  handler: async (params, context) => {
    return await contratoVendaFindManyController(params, context);
  },
});

export async function contratoVendaFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      contratoVenda: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    contratoVendaFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.ContratoVendaWhereInput> = [];

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
      if (filter?.dataAssinaturaRange?.length) {
        const start = filter.dataAssinaturaRange?.[0];
        const end = filter.dataAssinaturaRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataAssinatura: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataAssinatura: {
              lte: end,
            },
          });
        }
      }
      if (filter?.dataRegistroRange?.length) {
        const start = filter.dataRegistroRange?.[0];
        const end = filter.dataRegistroRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataRegistro: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataRegistro: {
              lte: end,
            },
          });
        }
      }
      if (filter?.assinaturaEletronicaId != null) {
        whereAnd.push({
          assinaturaEletronicaId: {
            contains: filter?.assinaturaEletronicaId,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.venda != null) {
        whereAnd.push({
          venda: {
            id: filter.venda,
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

      let contratosVenda = await tx.contratoVenda.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          venda: true,
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

      const count = await tx.contratoVenda.count({
        where: {
          AND: whereAnd,
        },
      });

      contratosVenda = await filePopulateDownloadUrlInTree(contratosVenda);

      return { contratosVenda, count };
    },
  );
}
