import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { sistemaProdutivoRuralFindManyInputSchema } from '../sistemaProdutivoRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const sistemaProdutivoRuralFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/sistema-produtivo-rural',
  query: sistemaProdutivoRuralFindManyInputSchema,
  response:
    '{ sistemasProdutivosRurais: SistemaProdutivoRural[], count: number }',
};

export const sistemaProdutivoRuralFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'sistemaProdutivoRural_list',
  description: dictionary.sistemaProdutivoRural.mcpDescription.list,
  requiredPermissions: { sistemaProdutivoRural: ['read'] },
  schema: toMcpJsonSchema(sistemaProdutivoRuralFindManyInputSchema),
  handler: async (params, context) => {
    return await sistemaProdutivoRuralFindManyController(params, context);
  },
});

export async function sistemaProdutivoRuralFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      sistemaProdutivoRural: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    sistemaProdutivoRuralFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.SistemaProdutivoRuralWhereInput> = [];

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
      if (filter?.tipo != null) {
        whereAnd.push({
          tipo: filter?.tipo,
        });
      }
      if (filter?.areaHaRange?.length) {
        const start = filter.areaHaRange?.[0];
        const end = filter.areaHaRange?.[1];

        if (start != null) {
          whereAnd.push({
            areaHa: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            areaHa: { lte: end },
          });
        }
      }
      if (filter?.irrigado != null) {
        whereAnd.push({
          irrigado: filter.irrigado === 'true',
        });
      }
      if (filter?.tipoIrrigacao != null) {
        whereAnd.push({
          tipoIrrigacao: filter?.tipoIrrigacao,
        });
      }
      if (filter?.quantidadePivosRange?.length) {
        const start = filter.quantidadePivosRange?.[0];
        const end = filter.quantidadePivosRange?.[1];

        if (start != null) {
          whereAnd.push({
            quantidadePivos: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            quantidadePivos: { lte: end },
          });
        }
      }
      if (filter?.areaIrrigadaHaRange?.length) {
        const start = filter.areaIrrigadaHaRange?.[0];
        const end = filter.areaIrrigadaHaRange?.[1];

        if (start != null) {
          whereAnd.push({
            areaIrrigadaHa: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            areaIrrigadaHa: { lte: end },
          });
        }
      }
      if (filter?.fonteAgua != null) {
        whereAnd.push({
          fonteAgua: { contains: filter?.fonteAgua, mode: 'insensitive' },
        });
      }
      if (filter?.capacidadeIrrigacaoHaRange?.length) {
        const start = filter.capacidadeIrrigacaoHaRange?.[0];
        const end = filter.capacidadeIrrigacaoHaRange?.[1];

        if (start != null) {
          whereAnd.push({
            capacidadeIrrigacaoHa: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            capacidadeIrrigacaoHa: { lte: end },
          });
        }
      }
      if (filter?.certificadoOrganico != null) {
        whereAnd.push({
          certificadoOrganico: filter.certificadoOrganico === 'true',
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

      let sistemasProdutivosRurais = await tx.sistemaProdutivoRural.findMany({
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

      const count = await tx.sistemaProdutivoRural.count({
        where: {
          AND: whereAnd,
        },
      });

      sistemasProdutivosRurais = await filePopulateDownloadUrlInTree(
        sistemasProdutivosRurais,
      );

      return { sistemasProdutivosRurais, count };
    },
  );
}
