import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  logisticaRuralUpdateBodyInputSchema,
  logisticaRuralUpdateParamsInputSchema,
} from '../logisticaRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const logisticaRuralUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/logistica-rural/{id}',
  params: logisticaRuralUpdateParamsInputSchema,
  body: logisticaRuralUpdateBodyInputSchema,
  response: 'LogisticaRural',
};

export const logisticaRuralUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'logisticaRural_update',
  description: dictionary.logisticaRural.mcpDescription.update,
  requiredPermissions: { logisticaRural: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: logisticaRuralUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await logisticaRuralUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function logisticaRuralUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      logisticaRural: ['update'],
    },
    context,
  );

  const { id } = logisticaRuralUpdateParamsInputSchema.parse(params);

  const data = logisticaRuralUpdateBodyInputSchema.parse(body);

  let logisticaRural = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentLogisticaRural = await tx.logisticaRural.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentLogisticaRural) {
          const currentUpdatedAt =
            currentLogisticaRural.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldLogisticaRural = await tx.logisticaRural.findUniqueOrThrow({
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

      await tx.logisticaRural.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          descricao: data.descricao,
          tipoAcessoPrincipal: data.tipoAcessoPrincipal,
          distanciaAsfaltoKm: data.distanciaAsfaltoKm,
          transitavelAnoTodo: data.transitavelAnoTodo,
          restricaoEpocaChuva: data.restricaoEpocaChuva,
          acessoCaminhaoBitrem: data.acessoCaminhaoBitrem,
          acessoRodotrem: data.acessoRodotrem,
          distanciaCidadeKm: data.distanciaCidadeKm,
          distanciaSiloKm: data.distanciaSiloKm,
          distanciaFrigorificoKm: data.distanciaFrigorificoKm,
          distanciaCooperativaKm: data.distanciaCooperativaKm,
          distanciaPortoKm: data.distanciaPortoKm,
          distanciaFerroviaKm: data.distanciaFerroviaKm,
          distanciaAeroportoKm: data.distanciaAeroportoKm,
          distanciaRodoviaPrincipalKm: data.distanciaRodoviaPrincipalKm,
          pontesInternas: data.pontesInternas,
          estradasInternasKm: data.estradasInternasKm,
          observacoes: data.observacoes,
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedLogisticaRural = await tx.logisticaRural.findUniqueOrThrow({
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
        entityName: 'LogisticaRural',
        operation: auditLogOperations.update,
        context,
        oldData: oldLogisticaRural,
        newData: updatedLogisticaRural,
        tx,
      });

      return updatedLogisticaRural;
    },
  );

  logisticaRural = await filePopulateDownloadUrlInTree(logisticaRural);

  return logisticaRural;
}
