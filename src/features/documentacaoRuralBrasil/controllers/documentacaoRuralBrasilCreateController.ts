import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { documentacaoRuralBrasilCreateInputSchema } from '../documentacaoRuralBrasilSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const documentacaoRuralBrasilCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/documentacao-rural-brasil',
  body: documentacaoRuralBrasilCreateInputSchema,
  response: 'DocumentacaoRuralBrasil',
};

export const documentacaoRuralBrasilCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'documentacaoRuralBrasil_create',
  description: dictionary.documentacaoRuralBrasil.mcpDescription.create,
  requiredPermissions: { documentacaoRuralBrasil: ['create'] },
  schema: toMcpJsonSchema(documentacaoRuralBrasilCreateInputSchema),
  handler: async (params, context) => {
    return await documentacaoRuralBrasilCreateController(params, context);
  },
});

export async function documentacaoRuralBrasilCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      documentacaoRuralBrasil: ['create'],
    },
    context,
  );
  return await documentacaoRuralBrasilCreate(body, context);
}

export async function documentacaoRuralBrasilCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = documentacaoRuralBrasilCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newDocumentacaoRuralBrasil =
        await tx.documentacaoRuralBrasil.create({
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
            imovel: prismaRelationship.connectOneOrThrow(data.imovel),
            importHash: data.importHash,
            organization: prismaRelationship.connectOneOrThrow(
              context.currentOrganization!.id,
            ),
            createdByMember: prismaRelationship.connectOne(
              context.currentMember?.id,
            ),
            createdByUserId: context.currentUser?.id,
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
        entityId: newDocumentacaoRuralBrasil.id,
        entityName: 'DocumentacaoRuralBrasil',
        operation: auditLogOperations.create,
        context,
        newData: newDocumentacaoRuralBrasil,
        tx,
      });

      const documentacaoRuralBrasil = await filePopulateDownloadUrlInTree(
        newDocumentacaoRuralBrasil,
      );

      return documentacaoRuralBrasil;
    },
  );
}
