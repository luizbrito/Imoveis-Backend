import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { documentacaoRuralBrasilFindManyInputSchema } from '../documentacaoRuralBrasilSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const documentacaoRuralBrasilFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/documentacao-rural-brasil',
  query: documentacaoRuralBrasilFindManyInputSchema,
  response:
    '{ documentacoesRuraisBrasil: DocumentacaoRuralBrasil[], count: number }',
};

export const documentacaoRuralBrasilFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'documentacaoRuralBrasil_list',
  description: dictionary.documentacaoRuralBrasil.mcpDescription.list,
  requiredPermissions: { documentacaoRuralBrasil: ['read'] },
  schema: toMcpJsonSchema(documentacaoRuralBrasilFindManyInputSchema),
  handler: async (params, context) => {
    return await documentacaoRuralBrasilFindManyController(params, context);
  },
});

export async function documentacaoRuralBrasilFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      documentacaoRuralBrasil: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    documentacaoRuralBrasilFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.DocumentacaoRuralBrasilWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.archived !== 'true') {
        whereAnd.push({ archivedAt: null });
      }
      if (filter?.situacaoDocumental != null) {
        whereAnd.push({
          situacaoDocumental: filter?.situacaoDocumental,
        });
      }
      if (filter?.matriculaNumero != null) {
        whereAnd.push({
          matriculaNumero: {
            contains: filter?.matriculaNumero,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.matriculaCartorio != null) {
        whereAnd.push({
          matriculaCartorio: {
            contains: filter?.matriculaCartorio,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.matriculaComarca != null) {
        whereAnd.push({
          matriculaComarca: {
            contains: filter?.matriculaComarca,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.matriculaUf != null) {
        whereAnd.push({
          matriculaUf: { contains: filter?.matriculaUf, mode: 'insensitive' },
        });
      }
      if (filter?.matriculaDataAtualizacaoRange?.length) {
        const start = filter.matriculaDataAtualizacaoRange?.[0];
        const end = filter.matriculaDataAtualizacaoRange?.[1];

        if (start != null) {
          whereAnd.push({
            matriculaDataAtualizacao: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            matriculaDataAtualizacao: {
              lte: end,
            },
          });
        }
      }
      if (filter?.codigoSncrIncra != null) {
        whereAnd.push({
          codigoSncrIncra: {
            contains: filter?.codigoSncrIncra,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.ccirExercicioRange?.length) {
        const start = filter.ccirExercicioRange?.[0];
        const end = filter.ccirExercicioRange?.[1];

        if (start != null) {
          whereAnd.push({
            ccirExercicio: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            ccirExercicio: { lte: end },
          });
        }
      }
      if (filter?.ccirNumero != null) {
        whereAnd.push({
          ccirNumero: { contains: filter?.ccirNumero, mode: 'insensitive' },
        });
      }
      if (filter?.ccirSituacao != null) {
        whereAnd.push({
          ccirSituacao: filter?.ccirSituacao,
        });
      }
      if (filter?.ccirDataEmissaoRange?.length) {
        const start = filter.ccirDataEmissaoRange?.[0];
        const end = filter.ccirDataEmissaoRange?.[1];

        if (start != null) {
          whereAnd.push({
            ccirDataEmissao: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            ccirDataEmissao: {
              lte: end,
            },
          });
        }
      }
      if (filter?.ccirTaxaQuitada != null) {
        whereAnd.push({
          ccirTaxaQuitada: filter.ccirTaxaQuitada === 'true',
        });
      }
      if (filter?.cib != null) {
        whereAnd.push({
          cib: { contains: filter?.cib, mode: 'insensitive' },
        });
      }
      if (filter?.cafirSituacao != null) {
        whereAnd.push({
          cafirSituacao: filter?.cafirSituacao,
        });
      }
      if (filter?.cnirVinculado != null) {
        whereAnd.push({
          cnirVinculado: filter.cnirVinculado === 'true',
        });
      }
      if (filter?.itrUltimoExercicioRange?.length) {
        const start = filter.itrUltimoExercicioRange?.[0];
        const end = filter.itrUltimoExercicioRange?.[1];

        if (start != null) {
          whereAnd.push({
            itrUltimoExercicio: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            itrUltimoExercicio: { lte: end },
          });
        }
      }
      if (filter?.ditrEntregue != null) {
        whereAnd.push({
          ditrEntregue: filter.ditrEntregue === 'true',
        });
      }
      if (filter?.numeroReciboDitr != null) {
        whereAnd.push({
          numeroReciboDitr: {
            contains: filter?.numeroReciboDitr,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.itrQuitado != null) {
        whereAnd.push({
          itrQuitado: filter.itrQuitado === 'true',
        });
      }
      if (filter?.cndImovelRuralSituacao != null) {
        whereAnd.push({
          cndImovelRuralSituacao: filter?.cndImovelRuralSituacao,
        });
      }
      if (filter?.cndImovelRuralDataEmissaoRange?.length) {
        const start = filter.cndImovelRuralDataEmissaoRange?.[0];
        const end = filter.cndImovelRuralDataEmissaoRange?.[1];

        if (start != null) {
          whereAnd.push({
            cndImovelRuralDataEmissao: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            cndImovelRuralDataEmissao: {
              lte: end,
            },
          });
        }
      }
      if (filter?.cndImovelRuralDataValidadeRange?.length) {
        const start = filter.cndImovelRuralDataValidadeRange?.[0];
        const end = filter.cndImovelRuralDataValidadeRange?.[1];

        if (start != null) {
          whereAnd.push({
            cndImovelRuralDataValidade: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            cndImovelRuralDataValidade: {
              lte: end,
            },
          });
        }
      }
      if (filter?.carNumeroRegistro != null) {
        whereAnd.push({
          carNumeroRegistro: {
            contains: filter?.carNumeroRegistro,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.carSituacao != null) {
        whereAnd.push({
          carSituacao: filter?.carSituacao,
        });
      }
      if (filter?.praSituacao != null) {
        whereAnd.push({
          praSituacao: filter?.praSituacao,
        });
      }
      if (filter?.sigefCertificado != null) {
        whereAnd.push({
          sigefCertificado: filter.sigefCertificado === 'true',
        });
      }
      if (filter?.sigefParcelaCodigo != null) {
        whereAnd.push({
          sigefParcelaCodigo: {
            contains: filter?.sigefParcelaCodigo,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.sigefDataCertificacaoRange?.length) {
        const start = filter.sigefDataCertificacaoRange?.[0];
        const end = filter.sigefDataCertificacaoRange?.[1];

        if (start != null) {
          whereAnd.push({
            sigefDataCertificacao: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            sigefDataCertificacao: {
              lte: end,
            },
          });
        }
      }
      if (filter?.sigefSituacao != null) {
        whereAnd.push({
          sigefSituacao: filter?.sigefSituacao,
        });
      }
      if (filter?.responsavelTecnicoNome != null) {
        whereAnd.push({
          responsavelTecnicoNome: {
            contains: filter?.responsavelTecnicoNome,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.responsavelTecnicoRegistro != null) {
        whereAnd.push({
          responsavelTecnicoRegistro: {
            contains: filter?.responsavelTecnicoRegistro,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.possuiOnusReais != null) {
        whereAnd.push({
          possuiOnusReais: filter.possuiOnusReais === 'true',
        });
      }
      if (filter?.possuiAcaoRealReipersecutoria != null) {
        whereAnd.push({
          possuiAcaoRealReipersecutoria:
            filter.possuiAcaoRealReipersecutoria === 'true',
        });
      }
      if (filter?.cadeiaDominialVerificada != null) {
        whereAnd.push({
          cadeiaDominialVerificada: filter.cadeiaDominialVerificada === 'true',
        });
      }
      if (filter?.possuiArrendamento != null) {
        whereAnd.push({
          possuiArrendamento: filter.possuiArrendamento === 'true',
        });
      }
      if (filter?.possuiParceriaRural != null) {
        whereAnd.push({
          possuiParceriaRural: filter.possuiParceriaRural === 'true',
        });
      }
      if (filter?.licenciamentoAmbientalSituacao != null) {
        whereAnd.push({
          licenciamentoAmbientalSituacao:
            filter?.licenciamentoAmbientalSituacao,
        });
      }
      if (filter?.outorgaAguaSituacao != null) {
        whereAnd.push({
          outorgaAguaSituacao: filter?.outorgaAguaSituacao,
        });
      }
      if (filter?.embargoAmbiental != null) {
        whereAnd.push({
          embargoAmbiental: filter.embargoAmbiental === 'true',
        });
      }
      if (filter?.documentacaoConferidaEmRange?.length) {
        const start = filter.documentacaoConferidaEmRange?.[0];
        const end = filter.documentacaoConferidaEmRange?.[1];

        if (start != null) {
          whereAnd.push({
            documentacaoConferidaEm: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            documentacaoConferidaEm: {
              lte: end,
            },
          });
        }
      }
      if (filter?.proximaRevisaoDocumentalRange?.length) {
        const start = filter.proximaRevisaoDocumentalRange?.[0];
        const end = filter.proximaRevisaoDocumentalRange?.[1];

        if (start != null) {
          whereAnd.push({
            proximaRevisaoDocumental: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            proximaRevisaoDocumental: {
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

      let documentacoesRuraisBrasil = await tx.documentacaoRuralBrasil.findMany(
        {
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
        },
      );

      const count = await tx.documentacaoRuralBrasil.count({
        where: {
          AND: whereAnd,
        },
      });

      documentacoesRuraisBrasil = await filePopulateDownloadUrlInTree(
        documentacoesRuraisBrasil,
      );

      return { documentacoesRuraisBrasil, count };
    },
  );
}
