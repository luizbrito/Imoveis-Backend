import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  recursoHidricoRuralUpdateBodyInputSchema,
  recursoHidricoRuralUpdateParamsInputSchema,
} from '../recursoHidricoRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const recursoHidricoRuralUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/recurso-hidrico-rural/{id}',
  params: recursoHidricoRuralUpdateParamsInputSchema,
  body: recursoHidricoRuralUpdateBodyInputSchema,
  response: 'RecursoHidricoRural',
};

export const recursoHidricoRuralUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'recursoHidricoRural_update',
  description: dictionary.recursoHidricoRural.mcpDescription.update,
  requiredPermissions: { recursoHidricoRural: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: recursoHidricoRuralUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await recursoHidricoRuralUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function recursoHidricoRuralUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      recursoHidricoRural: ['update'],
    },
    context,
  );

  const { id } = recursoHidricoRuralUpdateParamsInputSchema.parse(params);

  const data = recursoHidricoRuralUpdateBodyInputSchema.parse(body);

  let recursoHidricoRural = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentRecursoHidricoRural =
          await tx.recursoHidricoRural.findUnique({
            where: {
              id_organizationId: {
                id,
                organizationId: currentOrganization.id,
              },
            },
            select: { updatedAt: true },
          });

        if (currentRecursoHidricoRural) {
          const currentUpdatedAt =
            currentRecursoHidricoRural.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldRecursoHidricoRural =
        await tx.recursoHidricoRural.findUniqueOrThrow({
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

      await tx.recursoHidricoRural.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          nome: data.nome,
          tipo: data.tipo,
          perene: data.perene,
          navegavel: data.navegavel,
          extensaoNaPropriedadeKm: data.extensaoNaPropriedadeKm,
          frentePropriedadeKm: data.frentePropriedadeKm,
          vazaoEstimada: data.vazaoEstimada,
          unidadeVazao: data.unidadeVazao,
          qualidadeAgua: data.qualidadeAgua,
          sazonalidade: data.sazonalidade,
          usoGado: data.usoGado,
          usoIrrigacao: data.usoIrrigacao,
          usoHumano: data.usoHumano,
          capacidadeAbastecimentoCabecas: data.capacidadeAbastecimentoCabecas,
          areaIrrigavelHa: data.areaIrrigavelHa,
          outorgaNecessaria: data.outorgaNecessaria,
          outorgaSituacao: data.outorgaSituacao,
          documentoOutorga: data.documentoOutorga,
          kml: data.kml,
          observacoes: data.observacoes,
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedRecursoHidricoRural =
        await tx.recursoHidricoRural.findUniqueOrThrow({
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
        entityName: 'RecursoHidricoRural',
        operation: auditLogOperations.update,
        context,
        oldData: oldRecursoHidricoRural,
        newData: updatedRecursoHidricoRural,
        tx,
      });

      return updatedRecursoHidricoRural;
    },
  );

  recursoHidricoRural =
    await filePopulateDownloadUrlInTree(recursoHidricoRural);

  return recursoHidricoRural;
}
