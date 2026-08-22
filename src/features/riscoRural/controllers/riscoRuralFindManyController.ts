import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { riscoRuralFindManyInputSchema } from '../riscoRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const riscoRuralFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/risco-rural',
  query: riscoRuralFindManyInputSchema,
  response: '{ riscosRurais: RiscoRural[], count: number }',
};

export const riscoRuralFindManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'riscoRural_list',
  description: dictionary.riscoRural.mcpDescription.list,
  requiredPermissions: { riscoRural: ['read'] },
  schema: toMcpJsonSchema(riscoRuralFindManyInputSchema),
  handler: async (params, context) => {
    return await riscoRuralFindManyController(params, context);
  },
});

export async function riscoRuralFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      riscoRural: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    riscoRuralFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.RiscoRuralWhereInput> = [];

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
      if (filter?.nivel != null) {
        whereAnd.push({
          nivel: filter?.nivel,
        });
      }
      if (filter?.historicoOcorrencia != null) {
        whereAnd.push({
          historicoOcorrencia: filter.historicoOcorrencia === 'true',
        });
      }
      if (filter?.ultimaOcorrenciaRange?.length) {
        const start = filter.ultimaOcorrenciaRange?.[0];
        const end = filter.ultimaOcorrenciaRange?.[1];

        if (start != null) {
          whereAnd.push({
            ultimaOcorrencia: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            ultimaOcorrencia: {
              lte: end,
            },
          });
        }
      }
      if (filter?.areaAfetadaHaRange?.length) {
        const start = filter.areaAfetadaHaRange?.[0];
        const end = filter.areaAfetadaHaRange?.[1];

        if (start != null) {
          whereAnd.push({
            areaAfetadaHa: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            areaAfetadaHa: { lte: end },
          });
        }
      }
      if (filter?.mitigacaoExistente != null) {
        whereAnd.push({
          mitigacaoExistente: filter.mitigacaoExistente === 'true',
        });
      }
      if (filter?.imovel != null) {
        whereAnd.push({
          imovel: {
            id: filter.imovel,
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

      let riscosRurais = await tx.riscoRural.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          imovel: true,
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

      const count = await tx.riscoRural.count({
        where: {
          AND: whereAnd,
        },
      });

      riscosRurais = await filePopulateDownloadUrlInTree(riscosRurais);

      return { riscosRurais, count };
    },
  );
}
