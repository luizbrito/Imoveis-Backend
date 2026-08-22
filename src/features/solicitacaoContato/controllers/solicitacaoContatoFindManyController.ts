import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { solicitacaoContatoFindManyInputSchema } from '../solicitacaoContatoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const solicitacaoContatoFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/solicitacao-contato',
  query: solicitacaoContatoFindManyInputSchema,
  response: '{ solicitacoesContato: SolicitacaoContato[], count: number }',
};

export const solicitacaoContatoFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'solicitacaoContato_list',
  description: dictionary.solicitacaoContato.mcpDescription.list,
  requiredPermissions: { solicitacaoContato: ['read'] },
  schema: toMcpJsonSchema(solicitacaoContatoFindManyInputSchema),
  handler: async (params, context) => {
    return await solicitacaoContatoFindManyController(params, context);
  },
});

export async function solicitacaoContatoFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      solicitacaoContato: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    solicitacaoContatoFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.SolicitacaoContatoWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.archived !== 'true') {
        whereAnd.push({ archivedAt: null });
      }
      if (filter?.nome != null) {
        whereAnd.push({
          nome: { contains: filter?.nome, mode: 'insensitive' },
        });
      }
      if (filter?.telefone != null) {
        whereAnd.push({
          telefone: { contains: filter?.telefone, mode: 'insensitive' },
        });
      }
      if (filter?.email != null) {
        whereAnd.push({
          email: { contains: filter?.email, mode: 'insensitive' },
        });
      }
      if (filter?.canalOrigem != null) {
        whereAnd.push({
          canalOrigem: filter?.canalOrigem,
        });
      }
      if (filter?.dataHoraRange?.length) {
        const start = filter.dataHoraRange?.[0];
        const end = filter.dataHoraRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataHora: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataHora: {
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
      if (filter?.consentiuContato != null) {
        whereAnd.push({
          consentiuContato: filter.consentiuContato === 'true',
        });
      }
      if (filter?.imovel != null) {
        whereAnd.push({
          imovel: {
            id: filter.imovel,
          },
        });
      }
      if (filter?.anuncio != null) {
        whereAnd.push({
          anuncio: {
            id: filter.anuncio,
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

      let solicitacoesContato = await tx.solicitacaoContato.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          imovel: true,
          anuncio: true,
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

      const count = await tx.solicitacaoContato.count({
        where: {
          AND: whereAnd,
        },
      });

      solicitacoesContato =
        await filePopulateDownloadUrlInTree(solicitacoesContato);

      return { solicitacoesContato, count };
    },
  );
}
