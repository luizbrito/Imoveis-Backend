import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { interacaoLeadFindManyInputSchema } from '../interacaoLeadSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const interacaoLeadFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/interacao-lead',
  query: interacaoLeadFindManyInputSchema,
  response: '{ interacoesLead: InteracaoLead[], count: number }',
};

export const interacaoLeadFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'interacaoLead_list',
  description: dictionary.interacaoLead.mcpDescription.list,
  requiredPermissions: { interacaoLead: ['read'] },
  schema: toMcpJsonSchema(interacaoLeadFindManyInputSchema),
  handler: async (params, context) => {
    return await interacaoLeadFindManyController(params, context);
  },
});

export async function interacaoLeadFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      interacaoLead: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    interacaoLeadFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.InteracaoLeadWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.archived !== 'true') {
        whereAnd.push({ archivedAt: null });
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
      if (filter?.tipo != null) {
        whereAnd.push({
          tipo: filter?.tipo,
        });
      }
      if (filter?.resultado != null) {
        whereAnd.push({
          resultado: filter?.resultado,
        });
      }
      if (filter?.assunto != null) {
        whereAnd.push({
          assunto: { contains: filter?.assunto, mode: 'insensitive' },
        });
      }
      if (filter?.proximaAcao != null) {
        whereAnd.push({
          proximaAcao: { contains: filter?.proximaAcao, mode: 'insensitive' },
        });
      }
      if (filter?.dataProximaAcaoRange?.length) {
        const start = filter.dataProximaAcaoRange?.[0];
        const end = filter.dataProximaAcaoRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataProximaAcao: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataProximaAcao: {
              lte: end,
            },
          });
        }
      }
      if (filter?.lead != null) {
        whereAnd.push({
          lead: {
            id: filter.lead,
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

      let interacoesLead = await tx.interacaoLead.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          lead: true,
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

      const count = await tx.interacaoLead.count({
        where: {
          AND: whereAnd,
        },
      });

      interacoesLead = await filePopulateDownloadUrlInTree(interacoesLead);

      return { interacoesLead, count };
    },
  );
}
