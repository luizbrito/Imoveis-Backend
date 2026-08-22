import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  producaoHistoricaRuralUpdateBodyInputSchema,
  producaoHistoricaRuralUpdateParamsInputSchema,
} from '../producaoHistoricaRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const producaoHistoricaRuralUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/producao-historica-rural/{id}',
  params: producaoHistoricaRuralUpdateParamsInputSchema,
  body: producaoHistoricaRuralUpdateBodyInputSchema,
  response: 'ProducaoHistoricaRural',
};

export const producaoHistoricaRuralUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'producaoHistoricaRural_update',
  description: dictionary.producaoHistoricaRural.mcpDescription.update,
  requiredPermissions: { producaoHistoricaRural: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: producaoHistoricaRuralUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await producaoHistoricaRuralUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function producaoHistoricaRuralUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      producaoHistoricaRural: ['update'],
    },
    context,
  );

  const { id } = producaoHistoricaRuralUpdateParamsInputSchema.parse(params);

  const data = producaoHistoricaRuralUpdateBodyInputSchema.parse(body);

  let producaoHistoricaRural = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentProducaoHistoricaRural =
          await tx.producaoHistoricaRural.findUnique({
            where: {
              id_organizationId: {
                id,
                organizationId: currentOrganization.id,
              },
            },
            select: { updatedAt: true },
          });

        if (currentProducaoHistoricaRural) {
          const currentUpdatedAt =
            currentProducaoHistoricaRural.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldProducaoHistoricaRural =
        await tx.producaoHistoricaRural.findUniqueOrThrow({
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

      await tx.producaoHistoricaRural.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          safraAno: data.safraAno,
          atividade: data.atividade,
          areaHa: data.areaHa,
          producaoTotal: data.producaoTotal,
          unidadeProducao: data.unidadeProducao,
          produtividadePorHa: data.produtividadePorHa,
          cabecasMediaAno: data.cabecasMediaAno,
          uaHa: data.uaHa,
          observacoes: data.observacoes,
          documentos: data.documentos,
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedProducaoHistoricaRural =
        await tx.producaoHistoricaRural.findUniqueOrThrow({
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
        entityName: 'ProducaoHistoricaRural',
        operation: auditLogOperations.update,
        context,
        oldData: oldProducaoHistoricaRural,
        newData: updatedProducaoHistoricaRural,
        tx,
      });

      return updatedProducaoHistoricaRural;
    },
  );

  producaoHistoricaRural = await filePopulateDownloadUrlInTree(
    producaoHistoricaRural,
  );

  return producaoHistoricaRural;
}
