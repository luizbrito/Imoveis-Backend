import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { contratoLocacaoFindManyInputSchema } from '../contratoLocacaoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const contratoLocacaoFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/contrato-locacao',
  query: contratoLocacaoFindManyInputSchema,
  response: '{ contratosLocacao: ContratoLocacao[], count: number }',
};

export const contratoLocacaoFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'contratoLocacao_list',
  description: dictionary.contratoLocacao.mcpDescription.list,
  requiredPermissions: { contratoLocacao: ['read'] },
  schema: toMcpJsonSchema(contratoLocacaoFindManyInputSchema),
  handler: async (params, context) => {
    return await contratoLocacaoFindManyController(params, context);
  },
});

export async function contratoLocacaoFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      contratoLocacao: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    contratoLocacaoFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.ContratoLocacaoWhereInput> = [];

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
      if (filter?.assinaturaEletronicaId != null) {
        whereAnd.push({
          assinaturaEletronicaId: {
            contains: filter?.assinaturaEletronicaId,
            mode: 'insensitive',
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

      let contratosLocacao = await tx.contratoLocacao.findMany({
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

      const count = await tx.contratoLocacao.count({
        where: {
          AND: whereAnd,
        },
      });

      contratosLocacao = await filePopulateDownloadUrlInTree(contratosLocacao);

      return { contratosLocacao, count };
    },
  );
}
