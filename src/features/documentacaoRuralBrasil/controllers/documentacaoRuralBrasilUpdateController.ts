import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  documentacaoRuralBrasilUpdateBodyInputSchema,
  documentacaoRuralBrasilUpdateParamsInputSchema,
} from '../documentacaoRuralBrasilSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const documentacaoRuralBrasilUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/documentacao-rural-brasil/{id}',
  params: documentacaoRuralBrasilUpdateParamsInputSchema,
  body: documentacaoRuralBrasilUpdateBodyInputSchema,
  response: 'DocumentacaoRuralBrasil',
};

export const documentacaoRuralBrasilUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'documentacaoRuralBrasil_update',
  description: dictionary.documentacaoRuralBrasil.mcpDescription.update,
  requiredPermissions: { documentacaoRuralBrasil: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: documentacaoRuralBrasilUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await documentacaoRuralBrasilUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function documentacaoRuralBrasilUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      documentacaoRuralBrasil: ['update'],
    },
    context,
  );

  const { id } = documentacaoRuralBrasilUpdateParamsInputSchema.parse(params);

  const data = documentacaoRuralBrasilUpdateBodyInputSchema.parse(body);

  let documentacaoRuralBrasil = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentDocumentacaoRuralBrasil =
          await tx.documentacaoRuralBrasil.findUnique({
            where: {
              id_organizationId: {
                id,
                organizationId: currentOrganization.id,
              },
            },
            select: { updatedAt: true },
          });

        if (currentDocumentacaoRuralBrasil) {
          const currentUpdatedAt =
            currentDocumentacaoRuralBrasil.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldDocumentacaoRuralBrasil =
        await tx.documentacaoRuralBrasil.findUniqueOrThrow({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          include: {
            arquivosKml: {
              select: {
                id: true,
                nome: true,
              },
            },
            imovel: {
              select: {
                id: true,
                titulo: true,
              },
            },
            createdByMember: {
              select: {
                id: true,
                fullName: true,
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
            updatedByMember: {
              select: {
                id: true,
                fullName: true,
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
            archivedByMember: {
              select: {
                id: true,
                fullName: true,
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
          },
        });

      await tx.documentacaoRuralBrasil.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          situacaoDocumental: data.situacaoDocumental,
          matriculaNumero: data.matriculaNumero,
          matriculaLivro: data.matriculaLivro,
          matriculaCartorio: data.matriculaCartorio,
          matriculaComarca: data.matriculaComarca,
          matriculaUf: data.matriculaUf,
          matriculaDataAtualizacao: data.matriculaDataAtualizacao,
          matriculaArquivo: data.matriculaArquivo,
          codigoSncrIncra: data.codigoSncrIncra,
          ccirExercicio: data.ccirExercicio,
          ccirNumero: data.ccirNumero,
          ccirSituacao: data.ccirSituacao,
          ccirDataEmissao: data.ccirDataEmissao,
          ccirTaxaQuitada: data.ccirTaxaQuitada,
          ccirArquivo: data.ccirArquivo,
          cib: data.cib,
          cafirSituacao: data.cafirSituacao,
          cnirVinculado: data.cnirVinculado,
          comprovanteCafir: data.comprovanteCafir,
          itrUltimoExercicio: data.itrUltimoExercicio,
          ditrEntregue: data.ditrEntregue,
          numeroReciboDitr: data.numeroReciboDitr,
          valorItr: data.valorItr,
          itrQuitado: data.itrQuitado,
          ditrArquivo: data.ditrArquivo,
          cndImovelRuralSituacao: data.cndImovelRuralSituacao,
          cndImovelRuralDataEmissao: data.cndImovelRuralDataEmissao,
          cndImovelRuralDataValidade: data.cndImovelRuralDataValidade,
          cndImovelRuralArquivo: data.cndImovelRuralArquivo,
          carNumeroRegistro: data.carNumeroRegistro,
          carSituacao: data.carSituacao,
          carReciboArquivo: data.carReciboArquivo,
          carDemonstrativoArquivo: data.carDemonstrativoArquivo,
          areaAppHa: data.areaAppHa,
          areaReservaLegalHa: data.areaReservaLegalHa,
          areaVegetacaoNativaHa: data.areaVegetacaoNativaHa,
          areaUsoRestritoHa: data.areaUsoRestritoHa,
          areaConsolidadaHa: data.areaConsolidadaHa,
          praSituacao: data.praSituacao,
          termoPraArquivo: data.termoPraArquivo,
          sigefCertificado: data.sigefCertificado,
          sigefParcelaCodigo: data.sigefParcelaCodigo,
          sigefDataCertificacao: data.sigefDataCertificacao,
          sigefSituacao: data.sigefSituacao,
          sigefArquivo: data.sigefArquivo,
          memorialDescritivoArquivo: data.memorialDescritivoArquivo,
          plantaGeorreferenciadaArquivo: data.plantaGeorreferenciadaArquivo,
          artRrtTrtArquivo: data.artRrtTrtArquivo,
          responsavelTecnicoNome: data.responsavelTecnicoNome,
          responsavelTecnicoRegistro: data.responsavelTecnicoRegistro,
          possuiOnusReais: data.possuiOnusReais,
          descricaoOnusReais: data.descricaoOnusReais,
          certidaoOnusArquivo: data.certidaoOnusArquivo,
          possuiAcaoRealReipersecutoria: data.possuiAcaoRealReipersecutoria,
          certidaoAcoesArquivo: data.certidaoAcoesArquivo,
          tituloAquisicaoArquivo: data.tituloAquisicaoArquivo,
          cadeiaDominialVerificada: data.cadeiaDominialVerificada,
          cadeiaDominialObservacoes: data.cadeiaDominialObservacoes,
          possuiArrendamento: data.possuiArrendamento,
          arrendamentoArquivo: data.arrendamentoArquivo,
          possuiParceriaRural: data.possuiParceriaRural,
          parceriaRuralArquivo: data.parceriaRuralArquivo,
          licenciamentoAmbientalSituacao: data.licenciamentoAmbientalSituacao,
          licencasAmbientaisArquivo: data.licencasAmbientaisArquivo,
          outorgaAguaSituacao: data.outorgaAguaSituacao,
          outorgaAguaArquivo: data.outorgaAguaArquivo,
          embargoAmbiental: data.embargoAmbiental,
          embargoAmbientalObservacoes: data.embargoAmbientalObservacoes,
          documentacaoConferidaEm: data.documentacaoConferidaEm,
          proximaRevisaoDocumental: data.proximaRevisaoDocumental,
          pendenciasDocumentais: data.pendenciasDocumentais,
          observacoes: data.observacoes,
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedDocumentacaoRuralBrasil =
        await tx.documentacaoRuralBrasil.findUniqueOrThrow({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          include: {
            arquivosKml: {
              select: {
                id: true,
                nome: true,
              },
            },
            imovel: {
              select: {
                id: true,
                titulo: true,
              },
            },
            createdByMember: {
              select: {
                id: true,
                fullName: true,
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
            updatedByMember: {
              select: {
                id: true,
                fullName: true,
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
            archivedByMember: {
              select: {
                id: true,
                fullName: true,
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
          },
        });

      await auditLogCreate({
        entityId: id,
        entityName: 'DocumentacaoRuralBrasil',
        operation: auditLogOperations.update,
        context,
        oldData: oldDocumentacaoRuralBrasil,
        newData: updatedDocumentacaoRuralBrasil,
        tx,
      });

      return updatedDocumentacaoRuralBrasil;
    },
  );

  documentacaoRuralBrasil = await filePopulateDownloadUrlInTree(
    documentacaoRuralBrasil,
  );

  return documentacaoRuralBrasil;
}
