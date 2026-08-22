import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { infraestruturaEnergiaConectividadeFindManyInputSchema } from '../infraestruturaEnergiaConectividadeSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const infraestruturaEnergiaConectividadeFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/infraestrutura-energia-conectividade',
  query: infraestruturaEnergiaConectividadeFindManyInputSchema,
  response:
    '{ infraestruturasEnergiaConectividade: InfraestruturaEnergiaConectividade[], count: number }',
};

export const infraestruturaEnergiaConectividadeFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'infraestruturaEnergiaConectividade_list',
  description:
    dictionary.infraestruturaEnergiaConectividade.mcpDescription.list,
  requiredPermissions: { infraestruturaEnergiaConectividade: ['read'] },
  schema: toMcpJsonSchema(
    infraestruturaEnergiaConectividadeFindManyInputSchema,
  ),
  handler: async (params, context) => {
    return await infraestruturaEnergiaConectividadeFindManyController(
      params,
      context,
    );
  },
});

export async function infraestruturaEnergiaConectividadeFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      infraestruturaEnergiaConectividade: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    infraestruturaEnergiaConectividadeFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.InfraestruturaEnergiaConectividadeWhereInput> =
        [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.archived !== 'true') {
        whereAnd.push({ archivedAt: null });
      }
      if (filter?.descricao != null) {
        whereAnd.push({
          descricao: { contains: filter?.descricao, mode: 'insensitive' },
        });
      }
      if (filter?.energiaDisponivel != null) {
        whereAnd.push({
          energiaDisponivel: filter.energiaDisponivel === 'true',
        });
      }
      if (filter?.tipoRede != null) {
        whereAnd.push({
          tipoRede: filter?.tipoRede,
        });
      }
      if (filter?.potenciaInstaladaKvaRange?.length) {
        const start = filter.potenciaInstaladaKvaRange?.[0];
        const end = filter.potenciaInstaladaKvaRange?.[1];

        if (start != null) {
          whereAnd.push({
            potenciaInstaladaKva: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            potenciaInstaladaKva: { lte: end },
          });
        }
      }
      if (filter?.quantidadeTransformadoresRange?.length) {
        const start = filter.quantidadeTransformadoresRange?.[0];
        const end = filter.quantidadeTransformadoresRange?.[1];

        if (start != null) {
          whereAnd.push({
            quantidadeTransformadores: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            quantidadeTransformadores: { lte: end },
          });
        }
      }
      if (filter?.gerador != null) {
        whereAnd.push({
          gerador: filter.gerador === 'true',
        });
      }
      if (filter?.energiaSolar != null) {
        whereAnd.push({
          energiaSolar: filter.energiaSolar === 'true',
        });
      }
      if (filter?.potenciaSolarKwRange?.length) {
        const start = filter.potenciaSolarKwRange?.[0];
        const end = filter.potenciaSolarKwRange?.[1];

        if (start != null) {
          whereAnd.push({
            potenciaSolarKw: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            potenciaSolarKw: { lte: end },
          });
        }
      }
      if (filter?.distanciaRedeEnergiaKmRange?.length) {
        const start = filter.distanciaRedeEnergiaKmRange?.[0];
        const end = filter.distanciaRedeEnergiaKmRange?.[1];

        if (start != null) {
          whereAnd.push({
            distanciaRedeEnergiaKm: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            distanciaRedeEnergiaKm: { lte: end },
          });
        }
      }
      if (filter?.internetFibra != null) {
        whereAnd.push({
          internetFibra: filter.internetFibra === 'true',
        });
      }
      if (filter?.internetRadio != null) {
        whereAnd.push({
          internetRadio: filter.internetRadio === 'true',
        });
      }
      if (filter?.starlink != null) {
        whereAnd.push({
          starlink: filter.starlink === 'true',
        });
      }
      if (filter?.sinalCelular != null) {
        whereAnd.push({
          sinalCelular: filter?.sinalCelular,
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

      let infraestruturasEnergiaConectividade =
        await tx.infraestruturaEnergiaConectividade.findMany({
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

      const count = await tx.infraestruturaEnergiaConectividade.count({
        where: {
          AND: whereAnd,
        },
      });

      infraestruturasEnergiaConectividade = await filePopulateDownloadUrlInTree(
        infraestruturasEnergiaConectividade,
      );

      return { infraestruturasEnergiaConectividade, count };
    },
  );
}
