import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { arquivoKmlFindManyInputSchema } from '../arquivoKmlSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const arquivoKmlFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/arquivo-kml',
  query: arquivoKmlFindManyInputSchema,
  response: '{ arquivosKml: ArquivoKml[], count: number }',
};

export const arquivoKmlFindManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'arquivoKml_list',
  description: dictionary.arquivoKml.mcpDescription.list,
  requiredPermissions: { arquivoKml: ['read'] },
  schema: toMcpJsonSchema(arquivoKmlFindManyInputSchema),
  handler: async (params, context) => {
    return await arquivoKmlFindManyController(params, context);
  },
});

export async function arquivoKmlFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      arquivoKml: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    arquivoKmlFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.ArquivoKmlWhereInput> = [];

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
      if (filter?.tipoArquivo != null) {
        whereAnd.push({
          tipoArquivo: filter?.tipoArquivo,
        });
      }
      if (filter?.versao != null) {
        whereAnd.push({
          versao: { contains: filter?.versao, mode: 'insensitive' },
        });
      }
      if (filter?.statusProcessamento != null) {
        whereAnd.push({
          statusProcessamento: filter?.statusProcessamento,
        });
      }
      if (filter?.sistemaReferencia != null) {
        whereAnd.push({
          sistemaReferencia: {
            contains: filter?.sistemaReferencia,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.camada != null) {
        whereAnd.push({
          camada: { contains: filter?.camada, mode: 'insensitive' },
        });
      }
      if (filter?.visivel != null) {
        whereAnd.push({
          visivel: filter.visivel === 'true',
        });
      }
      if (filter?.ordemExibicaoRange?.length) {
        const start = filter.ordemExibicaoRange?.[0];
        const end = filter.ordemExibicaoRange?.[1];

        if (start != null) {
          whereAnd.push({
            ordemExibicao: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            ordemExibicao: { lte: end },
          });
        }
      }
      if (filter?.quantidadePontosRange?.length) {
        const start = filter.quantidadePontosRange?.[0];
        const end = filter.quantidadePontosRange?.[1];

        if (start != null) {
          whereAnd.push({
            quantidadePontos: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            quantidadePontos: { lte: end },
          });
        }
      }
      if (filter?.quantidadeLinhasRange?.length) {
        const start = filter.quantidadeLinhasRange?.[0];
        const end = filter.quantidadeLinhasRange?.[1];

        if (start != null) {
          whereAnd.push({
            quantidadeLinhas: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            quantidadeLinhas: { lte: end },
          });
        }
      }
      if (filter?.quantidadePoligonosRange?.length) {
        const start = filter.quantidadePoligonosRange?.[0];
        const end = filter.quantidadePoligonosRange?.[1];

        if (start != null) {
          whereAnd.push({
            quantidadePoligonos: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            quantidadePoligonos: { lte: end },
          });
        }
      }
      if (filter?.areaCalculadaM2Range?.length) {
        const start = filter.areaCalculadaM2Range?.[0];
        const end = filter.areaCalculadaM2Range?.[1];

        if (start != null) {
          whereAnd.push({
            areaCalculadaM2: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            areaCalculadaM2: { lte: end },
          });
        }
      }
      if (filter?.dataProcessamentoRange?.length) {
        const start = filter.dataProcessamentoRange?.[0];
        const end = filter.dataProcessamentoRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataProcessamento: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataProcessamento: {
              lte: end,
            },
          });
        }
      }
      if (filter?.checksumSha256 != null) {
        whereAnd.push({
          checksumSha256: {
            contains: filter?.checksumSha256,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.origem != null) {
        whereAnd.push({
          origem: { contains: filter?.origem, mode: 'insensitive' },
        });
      }
      if (filter?.documentacaoRuralBrasil != null) {
        whereAnd.push({
          documentacaoRuralBrasil: {
            id: filter.documentacaoRuralBrasil,
          },
        });
      }
      if (filter?.imovel != null) {
        whereAnd.push({
          imovel: {
            id: filter.imovel,
          },
        });
      }
      if (filter?.empreendimento != null) {
        whereAnd.push({
          empreendimento: {
            id: filter.empreendimento,
          },
        });
      }
      if (filter?.condominio != null) {
        whereAnd.push({
          condominio: {
            id: filter.condominio,
          },
        });
      }
      if (filter?.cadastradoPor != null) {
        whereAnd.push({
          cadastradoPor: {
            id: filter.cadastradoPor,
          },
        });
      }
      if (filter?.versaoAnterior != null) {
        whereAnd.push({
          versaoAnterior: {
            id: filter.versaoAnterior,
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

      let arquivosKml = await tx.arquivoKml.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          documentacaoRuralBrasil: true,
          imovel: true,
          empreendimento: true,
          condominio: true,
          cadastradoPor: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
          versaoAnterior: true,
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

      const count = await tx.arquivoKml.count({
        where: {
          AND: whereAnd,
        },
      });

      arquivosKml = await filePopulateDownloadUrlInTree(arquivosKml);

      return { arquivosKml, count };
    },
  );
}
