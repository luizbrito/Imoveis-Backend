import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  condicaoComercialRuralUpdateBodyInputSchema,
  condicaoComercialRuralUpdateParamsInputSchema,
} from '../condicaoComercialRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const condicaoComercialRuralUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/condicao-comercial-rural/{id}',
  params: condicaoComercialRuralUpdateParamsInputSchema,
  body: condicaoComercialRuralUpdateBodyInputSchema,
  response: 'CondicaoComercialRural',
};

export const condicaoComercialRuralUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'condicaoComercialRural_update',
  description: dictionary.condicaoComercialRural.mcpDescription.update,
  requiredPermissions: { condicaoComercialRural: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: condicaoComercialRuralUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await condicaoComercialRuralUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function condicaoComercialRuralUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      condicaoComercialRural: ['update'],
    },
    context,
  );

  const { id } = condicaoComercialRuralUpdateParamsInputSchema.parse(params);

  const data = condicaoComercialRuralUpdateBodyInputSchema.parse(body);

  let condicaoComercialRural = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentCondicaoComercialRural =
          await tx.condicaoComercialRural.findUnique({
            where: {
              id_organizationId: {
                id,
                organizationId: currentOrganization.id,
              },
            },
            select: { updatedAt: true },
          });

        if (currentCondicaoComercialRural) {
          const currentUpdatedAt =
            currentCondicaoComercialRural.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldCondicaoComercialRural =
        await tx.condicaoComercialRural.findUniqueOrThrow({
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

      await tx.condicaoComercialRural.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          precoPorHa: data.precoPorHa,
          moeda: data.moeda,
          valorTotal: data.valorTotal,
          aceitaParcelamento: data.aceitaParcelamento,
          percentualEntrada: data.percentualEntrada,
          numeroParcelas: data.numeroParcelas,
          aceitaPermuta: data.aceitaPermuta,
          aceitaFinanciamento: data.aceitaFinanciamento,
          comissaoImobiliariaPercentual: data.comissaoImobiliariaPercentual,
          comissaoCorretorPercentual: data.comissaoCorretorPercentual,
          exclusividade: data.exclusividade,
          dataInicioExclusividade: data.dataInicioExclusividade,
          dataFimExclusividade: data.dataFimExclusividade,
          motivoVenda: data.motivoVenda,
          observacoes: data.observacoes,
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedCondicaoComercialRural =
        await tx.condicaoComercialRural.findUniqueOrThrow({
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
        entityName: 'CondicaoComercialRural',
        operation: auditLogOperations.update,
        context,
        oldData: oldCondicaoComercialRural,
        newData: updatedCondicaoComercialRural,
        tx,
      });

      return updatedCondicaoComercialRural;
    },
  );

  condicaoComercialRural = await filePopulateDownloadUrlInTree(
    condicaoComercialRural,
  );

  return condicaoComercialRural;
}
