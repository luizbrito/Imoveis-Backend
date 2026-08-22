import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  benfeitoriaRuralUpdateBodyInputSchema,
  benfeitoriaRuralUpdateParamsInputSchema,
} from '../benfeitoriaRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const benfeitoriaRuralUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/benfeitoria-rural/{id}',
  params: benfeitoriaRuralUpdateParamsInputSchema,
  body: benfeitoriaRuralUpdateBodyInputSchema,
  response: 'BenfeitoriaRural',
};

export const benfeitoriaRuralUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'benfeitoriaRural_update',
  description: dictionary.benfeitoriaRural.mcpDescription.update,
  requiredPermissions: { benfeitoriaRural: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: benfeitoriaRuralUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await benfeitoriaRuralUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function benfeitoriaRuralUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      benfeitoriaRural: ['update'],
    },
    context,
  );

  const { id } = benfeitoriaRuralUpdateParamsInputSchema.parse(params);

  const data = benfeitoriaRuralUpdateBodyInputSchema.parse(body);

  let benfeitoriaRural = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentBenfeitoriaRural = await tx.benfeitoriaRural.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentBenfeitoriaRural) {
          const currentUpdatedAt =
            currentBenfeitoriaRural.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldBenfeitoriaRural = await tx.benfeitoriaRural.findUniqueOrThrow({
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

      await tx.benfeitoriaRural.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          nome: data.nome,
          tipo: data.tipo,
          quantidade: data.quantidade,
          areaConstruidaM2: data.areaConstruidaM2,
          anoConstrucao: data.anoConstrucao,
          estadoConservacao: data.estadoConservacao,
          valorEstimado: data.valorEstimado,
          moeda: data.moeda,
          incluidaVenda: data.incluidaVenda,
          fotos: data.fotos,
          documentos: data.documentos,
          observacoes: data.observacoes,
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedBenfeitoriaRural =
        await tx.benfeitoriaRural.findUniqueOrThrow({
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
        entityName: 'BenfeitoriaRural',
        operation: auditLogOperations.update,
        context,
        oldData: oldBenfeitoriaRural,
        newData: updatedBenfeitoriaRural,
        tx,
      });

      return updatedBenfeitoriaRural;
    },
  );

  benfeitoriaRural = await filePopulateDownloadUrlInTree(benfeitoriaRural);

  return benfeitoriaRural;
}
