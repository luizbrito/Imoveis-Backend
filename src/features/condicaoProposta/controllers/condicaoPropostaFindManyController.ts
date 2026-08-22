import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { condicaoPropostaFindManyInputSchema } from '../condicaoPropostaSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const condicaoPropostaFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/condicao-proposta',
  query: condicaoPropostaFindManyInputSchema,
  response: '{ condicoesProposta: CondicaoProposta[], count: number }',
};

export const condicaoPropostaFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'condicaoProposta_list',
  description: dictionary.condicaoProposta.mcpDescription.list,
  requiredPermissions: { condicaoProposta: ['read'] },
  schema: toMcpJsonSchema(condicaoPropostaFindManyInputSchema),
  handler: async (params, context) => {
    return await condicaoPropostaFindManyController(params, context);
  },
});

export async function condicaoPropostaFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      condicaoProposta: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    condicaoPropostaFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.CondicaoPropostaWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.archived !== 'true') {
        whereAnd.push({ archivedAt: null });
      }
      if (filter?.ordemRange?.length) {
        const start = filter.ordemRange?.[0];
        const end = filter.ordemRange?.[1];

        if (start != null) {
          whereAnd.push({
            ordem: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            ordem: { lte: end },
          });
        }
      }
      if (filter?.tipo != null) {
        whereAnd.push({
          tipo: filter?.tipo,
        });
      }
      if (filter?.obrigatoria != null) {
        whereAnd.push({
          obrigatoria: filter.obrigatoria === 'true',
        });
      }
      if (filter?.atendida != null) {
        whereAnd.push({
          atendida: filter.atendida === 'true',
        });
      }
      if (filter?.proposta != null) {
        whereAnd.push({
          proposta: {
            id: filter.proposta,
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

      let condicoesProposta = await tx.condicaoProposta.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          proposta: true,
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

      const count = await tx.condicaoProposta.count({
        where: {
          AND: whereAnd,
        },
      });

      condicoesProposta =
        await filePopulateDownloadUrlInTree(condicoesProposta);

      return { condicoesProposta, count };
    },
  );
}
