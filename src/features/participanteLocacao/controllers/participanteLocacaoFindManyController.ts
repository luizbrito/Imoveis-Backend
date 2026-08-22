import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { participanteLocacaoFindManyInputSchema } from '../participanteLocacaoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const participanteLocacaoFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/participante-locacao',
  query: participanteLocacaoFindManyInputSchema,
  response: '{ participantesLocacao: ParticipanteLocacao[], count: number }',
};

export const participanteLocacaoFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'participanteLocacao_list',
  description: dictionary.participanteLocacao.mcpDescription.list,
  requiredPermissions: { participanteLocacao: ['read'] },
  schema: toMcpJsonSchema(participanteLocacaoFindManyInputSchema),
  handler: async (params, context) => {
    return await participanteLocacaoFindManyController(params, context);
  },
});

export async function participanteLocacaoFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      participanteLocacao: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    participanteLocacaoFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.ParticipanteLocacaoWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.archived !== 'true') {
        whereAnd.push({ archivedAt: null });
      }
      if (filter?.papel != null) {
        whereAnd.push({
          papel: filter?.papel,
        });
      }
      if (filter?.percentualResponsabilidadeRange?.length) {
        const start = filter.percentualResponsabilidadeRange?.[0];
        const end = filter.percentualResponsabilidadeRange?.[1];

        if (start != null) {
          whereAnd.push({
            percentualResponsabilidade: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            percentualResponsabilidade: { lte: end },
          });
        }
      }
      if (filter?.aprovadoCadastro != null) {
        whereAnd.push({
          aprovadoCadastro: filter.aprovadoCadastro === 'true',
        });
      }
      if (filter?.dataAprovacaoRange?.length) {
        const start = filter.dataAprovacaoRange?.[0];
        const end = filter.dataAprovacaoRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataAprovacao: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataAprovacao: {
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
      if (filter?.cliente != null) {
        whereAnd.push({
          cliente: {
            id: filter.cliente,
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

      let participantesLocacao = await tx.participanteLocacao.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          locacao: true,
          cliente: true,
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

      const count = await tx.participanteLocacao.count({
        where: {
          AND: whereAnd,
        },
      });

      participantesLocacao =
        await filePopulateDownloadUrlInTree(participantesLocacao);

      return { participantesLocacao, count };
    },
  );
}
