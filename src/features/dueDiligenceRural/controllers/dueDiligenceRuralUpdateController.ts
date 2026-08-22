import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  dueDiligenceRuralUpdateBodyInputSchema,
  dueDiligenceRuralUpdateParamsInputSchema,
} from '../dueDiligenceRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const dueDiligenceRuralUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/due-diligence-rural/{id}',
  params: dueDiligenceRuralUpdateParamsInputSchema,
  body: dueDiligenceRuralUpdateBodyInputSchema,
  response: 'DueDiligenceRural',
};

export const dueDiligenceRuralUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'dueDiligenceRural_update',
  description: dictionary.dueDiligenceRural.mcpDescription.update,
  requiredPermissions: { dueDiligenceRural: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: dueDiligenceRuralUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await dueDiligenceRuralUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function dueDiligenceRuralUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      dueDiligenceRural: ['update'],
    },
    context,
  );

  const { id } = dueDiligenceRuralUpdateParamsInputSchema.parse(params);

  const data = dueDiligenceRuralUpdateBodyInputSchema.parse(body);

  let dueDiligenceRural = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentDueDiligenceRural = await tx.dueDiligenceRural.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentDueDiligenceRural) {
          const currentUpdatedAt =
            currentDueDiligenceRural.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldDueDiligenceRural = await tx.dueDiligenceRural.findUniqueOrThrow(
        {
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
        },
      );

      await tx.dueDiligenceRural.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          titulo: data.titulo,
          dataAnalise: data.dataAnalise,
          status: data.status,
          riscoFundiario: data.riscoFundiario,
          riscoAmbiental: data.riscoAmbiental,
          riscoFiscal: data.riscoFiscal,
          riscoTrabalhista: data.riscoTrabalhista,
          riscoDocumental: data.riscoDocumental,
          notaDocumentacao: data.notaDocumentacao,
          notaInfraestrutura: data.notaInfraestrutura,
          notaLogistica: data.notaLogistica,
          notaRecursosHidricos: data.notaRecursosHidricos,
          notaClima: data.notaClima,
          notaSolo: data.notaSolo,
          notaAptidaoAgricola: data.notaAptidaoAgricola,
          notaAptidaoPecuaria: data.notaAptidaoPecuaria,
          notaAmbiental: data.notaAmbiental,
          scoreGeral: data.scoreGeral,
          classificacaoFinal: data.classificacaoFinal,
          pendencias: data.pendencias,
          recomendacoes: data.recomendacoes,
          relatorio: data.relatorio,
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedDueDiligenceRural =
        await tx.dueDiligenceRural.findUniqueOrThrow({
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
        entityName: 'DueDiligenceRural',
        operation: auditLogOperations.update,
        context,
        oldData: oldDueDiligenceRural,
        newData: updatedDueDiligenceRural,
        tx,
      });

      return updatedDueDiligenceRural;
    },
  );

  dueDiligenceRural = await filePopulateDownloadUrlInTree(dueDiligenceRural);

  return dueDiligenceRural;
}
