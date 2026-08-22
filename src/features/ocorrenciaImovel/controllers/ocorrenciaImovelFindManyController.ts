import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { ocorrenciaImovelFindManyInputSchema } from '../ocorrenciaImovelSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const ocorrenciaImovelFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/ocorrencia-imovel',
  query: ocorrenciaImovelFindManyInputSchema,
  response: '{ ocorrenciasImovel: OcorrenciaImovel[], count: number }',
};

export const ocorrenciaImovelFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'ocorrenciaImovel_list',
  description: dictionary.ocorrenciaImovel.mcpDescription.list,
  requiredPermissions: { ocorrenciaImovel: ['read'] },
  schema: toMcpJsonSchema(ocorrenciaImovelFindManyInputSchema),
  handler: async (params, context) => {
    return await ocorrenciaImovelFindManyController(params, context);
  },
});

export async function ocorrenciaImovelFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      ocorrenciaImovel: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    ocorrenciaImovelFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.OcorrenciaImovelWhereInput> = [];

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
      if (filter?.gravidade != null) {
        whereAnd.push({
          gravidade: filter?.gravidade,
        });
      }
      if (filter?.status != null) {
        whereAnd.push({
          status: filter?.status,
        });
      }
      if (filter?.titulo != null) {
        whereAnd.push({
          titulo: { contains: filter?.titulo, mode: 'insensitive' },
        });
      }
      if (filter?.dataResolucaoRange?.length) {
        const start = filter.dataResolucaoRange?.[0];
        const end = filter.dataResolucaoRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataResolucao: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataResolucao: {
              lte: end,
            },
          });
        }
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
      if (filter?.clienteRelator != null) {
        whereAnd.push({
          clienteRelator: {
            id: filter.clienteRelator,
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

      let ocorrenciasImovel = await tx.ocorrenciaImovel.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          imovel: true,
          locacao: true,
          clienteRelator: true,
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

      const count = await tx.ocorrenciaImovel.count({
        where: {
          AND: whereAnd,
        },
      });

      ocorrenciasImovel =
        await filePopulateDownloadUrlInTree(ocorrenciasImovel);

      return { ocorrenciasImovel, count };
    },
  );
}
