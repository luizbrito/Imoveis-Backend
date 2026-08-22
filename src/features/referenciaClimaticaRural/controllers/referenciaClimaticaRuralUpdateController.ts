import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  referenciaClimaticaRuralUpdateBodyInputSchema,
  referenciaClimaticaRuralUpdateParamsInputSchema,
} from '../referenciaClimaticaRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const referenciaClimaticaRuralUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/referencia-climatica-rural/{id}',
  params: referenciaClimaticaRuralUpdateParamsInputSchema,
  body: referenciaClimaticaRuralUpdateBodyInputSchema,
  response: 'ReferenciaClimaticaRural',
};

export const referenciaClimaticaRuralUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'referenciaClimaticaRural_update',
  description: dictionary.referenciaClimaticaRural.mcpDescription.update,
  requiredPermissions: { referenciaClimaticaRural: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: referenciaClimaticaRuralUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await referenciaClimaticaRuralUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function referenciaClimaticaRuralUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      referenciaClimaticaRural: ['update'],
    },
    context,
  );

  const { id } = referenciaClimaticaRuralUpdateParamsInputSchema.parse(params);

  const data = referenciaClimaticaRuralUpdateBodyInputSchema.parse(body);

  let referenciaClimaticaRural = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentReferenciaClimaticaRural =
          await tx.referenciaClimaticaRural.findUnique({
            where: {
              id_organizationId: {
                id,
                organizationId: currentOrganization.id,
              },
            },
            select: { updatedAt: true },
          });

        if (currentReferenciaClimaticaRural) {
          const currentUpdatedAt =
            currentReferenciaClimaticaRural.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldReferenciaClimaticaRural =
        await tx.referenciaClimaticaRural.findUniqueOrThrow({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
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

      await tx.referenciaClimaticaRural.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
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
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedReferenciaClimaticaRural =
        await tx.referenciaClimaticaRural.findUniqueOrThrow({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
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
        entityId: id,
        entityName: 'ReferenciaClimaticaRural',
        operation: auditLogOperations.update,
        context,
        oldData: oldReferenciaClimaticaRural,
        newData: updatedReferenciaClimaticaRural,
        tx,
      });

      return updatedReferenciaClimaticaRural;
    },
  );

  referenciaClimaticaRural = await filePopulateDownloadUrlInTree(
    referenciaClimaticaRural,
  );

  return referenciaClimaticaRural;
}
