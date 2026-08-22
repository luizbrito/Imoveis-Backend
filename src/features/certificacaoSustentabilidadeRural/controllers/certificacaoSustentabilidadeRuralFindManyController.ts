import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { certificacaoSustentabilidadeRuralFindManyInputSchema } from '../certificacaoSustentabilidadeRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const certificacaoSustentabilidadeRuralFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/certificacao-sustentabilidade-rural',
  query: certificacaoSustentabilidadeRuralFindManyInputSchema,
  response:
    '{ certificacoesSustentabilidadeRural: CertificacaoSustentabilidadeRural[], count: number }',
};

export const certificacaoSustentabilidadeRuralFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'certificacaoSustentabilidadeRural_list',
  description: dictionary.certificacaoSustentabilidadeRural.mcpDescription.list,
  requiredPermissions: { certificacaoSustentabilidadeRural: ['read'] },
  schema: toMcpJsonSchema(certificacaoSustentabilidadeRuralFindManyInputSchema),
  handler: async (params, context) => {
    return await certificacaoSustentabilidadeRuralFindManyController(
      params,
      context,
    );
  },
});

export async function certificacaoSustentabilidadeRuralFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      certificacaoSustentabilidadeRural: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    certificacaoSustentabilidadeRuralFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.CertificacaoSustentabilidadeRuralWhereInput> =
        [];

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
      if (filter?.entidadeCertificadora != null) {
        whereAnd.push({
          entidadeCertificadora: {
            contains: filter?.entidadeCertificadora,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.numeroCertificado != null) {
        whereAnd.push({
          numeroCertificado: {
            contains: filter?.numeroCertificado,
            mode: 'insensitive',
          },
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
      if (filter?.dataValidadeRange?.length) {
        const start = filter.dataValidadeRange?.[0];
        const end = filter.dataValidadeRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataValidade: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataValidade: {
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
      if (filter?.areaCertificadaHaRange?.length) {
        const start = filter.areaCertificadaHaRange?.[0];
        const end = filter.areaCertificadaHaRange?.[1];

        if (start != null) {
          whereAnd.push({
            areaCertificadaHa: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            areaCertificadaHa: { lte: end },
          });
        }
      }
      if (filter?.potencialCreditoCarbono != null) {
        whereAnd.push({
          potencialCreditoCarbono: filter.potencialCreditoCarbono === 'true',
        });
      }
      if (filter?.projetoCarbonoAtivo != null) {
        whereAnd.push({
          projetoCarbonoAtivo: filter.projetoCarbonoAtivo === 'true',
        });
      }
      if (filter?.estimativaCarbonoTco2eRange?.length) {
        const start = filter.estimativaCarbonoTco2eRange?.[0];
        const end = filter.estimativaCarbonoTco2eRange?.[1];

        if (start != null) {
          whereAnd.push({
            estimativaCarbonoTco2e: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            estimativaCarbonoTco2e: { lte: end },
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

      let certificacoesSustentabilidadeRural =
        await tx.certificacaoSustentabilidadeRural.findMany({
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

      const count = await tx.certificacaoSustentabilidadeRural.count({
        where: {
          AND: whereAnd,
        },
      });

      certificacoesSustentabilidadeRural = await filePopulateDownloadUrlInTree(
        certificacoesSustentabilidadeRural,
      );

      return { certificacoesSustentabilidadeRural, count };
    },
  );
}
