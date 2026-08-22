import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { referenciaClimaticaRuralCreateInputSchema } from '../referenciaClimaticaRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const referenciaClimaticaRuralCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/referencia-climatica-rural',
  body: referenciaClimaticaRuralCreateInputSchema,
  response: 'ReferenciaClimaticaRural',
};

export const referenciaClimaticaRuralCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'referenciaClimaticaRural_create',
  description: dictionary.referenciaClimaticaRural.mcpDescription.create,
  requiredPermissions: { referenciaClimaticaRural: ['create'] },
  schema: toMcpJsonSchema(referenciaClimaticaRuralCreateInputSchema),
  handler: async (params, context) => {
    return await referenciaClimaticaRuralCreateController(params, context);
  },
});

export async function referenciaClimaticaRuralCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      referenciaClimaticaRural: ['create'],
    },
    context,
  );
  return await referenciaClimaticaRuralCreate(body, context);
}

export async function referenciaClimaticaRuralCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = referenciaClimaticaRuralCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newReferenciaClimaticaRural =
        await tx.referenciaClimaticaRural.create({
          data: {
            tipoReferencia: data.tipoReferencia,
            titulo: data.titulo,
            descricao: data.descricao,
            pais: data.pais,
            estadoDepartamentoProvincia: data.estadoDepartamentoProvincia,
            municipioDistrito: data.municipioDistrito,
            regiaoClimatica: data.regiaoClimatica,
            precipitacaoMediaAnualMm: data.precipitacaoMediaAnualMm,
            precipitacaoMinimaReferenciaMm: data.precipitacaoMinimaReferenciaMm,
            precipitacaoMaximaReferenciaMm: data.precipitacaoMaximaReferenciaMm,
            faixaPluviometrica: data.faixaPluviometrica,
            mesMaisChuvoso: data.mesMaisChuvoso,
            mesMaisSeco: data.mesMaisSeco,
            inicioPeriodoChuvoso: data.inicioPeriodoChuvoso,
            fimPeriodoChuvoso: data.fimPeriodoChuvoso,
            diasChuvaAno: data.diasChuvaAno,
            temperaturaMediaAnualC: data.temperaturaMediaAnualC,
            temperaturaMinimaMediaC: data.temperaturaMinimaMediaC,
            temperaturaMaximaMediaC: data.temperaturaMaximaMediaC,
            riscoSeca: data.riscoSeca,
            riscoEncharcamento: data.riscoEncharcamento,
            riscoGeada: data.riscoGeada,
            indiceAridez: data.indiceAridez,
            periodoClimatologicoInicio: data.periodoClimatologicoInicio,
            periodoClimatologicoFim: data.periodoClimatologicoFim,
            estacaoMeteorologica: data.estacaoMeteorologica,
            distanciaEstacaoKm: data.distanciaEstacaoKm,
            fonteDados: data.fonteDados,
            urlFonte: data.urlFonte,
            dataConsulta: data.dataConsulta,
            mapaClimatico: data.mapaClimatico,
            arquivoDados: data.arquivoDados,
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
        entityId: newReferenciaClimaticaRural.id,
        entityName: 'ReferenciaClimaticaRural',
        operation: auditLogOperations.create,
        context,
        newData: newReferenciaClimaticaRural,
        tx,
      });

      const referenciaClimaticaRural = await filePopulateDownloadUrlInTree(
        newReferenciaClimaticaRural,
      );

      return referenciaClimaticaRural;
    },
  );
}
