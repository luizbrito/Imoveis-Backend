import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  soloImovelRuralUpdateBodyInputSchema,
  soloImovelRuralUpdateParamsInputSchema,
} from '../soloImovelRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const soloImovelRuralUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/solo-imovel-rural/{id}',
  params: soloImovelRuralUpdateParamsInputSchema,
  body: soloImovelRuralUpdateBodyInputSchema,
  response: 'SoloImovelRural',
};

export const soloImovelRuralUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'soloImovelRural_update',
  description: dictionary.soloImovelRural.mcpDescription.update,
  requiredPermissions: { soloImovelRural: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: soloImovelRuralUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await soloImovelRuralUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function soloImovelRuralUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      soloImovelRural: ['update'],
    },
    context,
  );

  const { id } = soloImovelRuralUpdateParamsInputSchema.parse(params);

  const data = soloImovelRuralUpdateBodyInputSchema.parse(body);

  let soloImovelRural = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentSoloImovelRural = await tx.soloImovelRural.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentSoloImovelRural) {
          const currentUpdatedAt =
            currentSoloImovelRural.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldSoloImovelRural = await tx.soloImovelRural.findUniqueOrThrow({
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
          tipoSolo: {
            select: {
              id: true,
              nome: true,
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

      await tx.soloImovelRural.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          nomeArea: data.nomeArea,
          areaHa: data.areaHa,
          percentualImovel: data.percentualImovel,
          profundidadeMediaCm: data.profundidadeMediaCm,
          declividadeMediaPercentual: data.declividadeMediaPercentual,
          phMedio: data.phMedio,
          materiaOrganicaPercentual: data.materiaOrganicaPercentual,
          teorArgilaPercentual: data.teorArgilaPercentual,
          teorAreiaPercentual: data.teorAreiaPercentual,
          teorSiltePercentual: data.teorSiltePercentual,
          capacidadeUso: data.capacidadeUso,
          usoAtual: data.usoAtual,
          usoRecomendado: data.usoRecomendado,
          necessitaCorrecao: data.necessitaCorrecao,
          correcaoRecomendada: data.correcaoRecomendada,
          analiseSoloData: data.analiseSoloData,
          analiseSoloArquivo: data.analiseSoloArquivo,
          mapaSoloArquivo: data.mapaSoloArquivo,
          arquivoKmlSolo: data.arquivoKmlSolo,
          observacoes: data.observacoes,
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          tipoSolo: prismaRelationship.connectOrDisconnectOne(data.tipoSolo),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedSoloImovelRural = await tx.soloImovelRural.findUniqueOrThrow(
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
            tipoSolo: {
              select: {
                id: true,
                nome: true,
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

      await auditLogCreate({
        entityId: id,
        entityName: 'SoloImovelRural',
        operation: auditLogOperations.update,
        context,
        oldData: oldSoloImovelRural,
        newData: updatedSoloImovelRural,
        tx,
      });

      return updatedSoloImovelRural;
    },
  );

  soloImovelRural = await filePopulateDownloadUrlInTree(soloImovelRural);

  return soloImovelRural;
}
