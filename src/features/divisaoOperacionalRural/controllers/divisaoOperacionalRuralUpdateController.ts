import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  divisaoOperacionalRuralUpdateBodyInputSchema,
  divisaoOperacionalRuralUpdateParamsInputSchema,
} from '../divisaoOperacionalRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const divisaoOperacionalRuralUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/divisao-operacional-rural/{id}',
  params: divisaoOperacionalRuralUpdateParamsInputSchema,
  body: divisaoOperacionalRuralUpdateBodyInputSchema,
  response: 'DivisaoOperacionalRural',
};

export const divisaoOperacionalRuralUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'divisaoOperacionalRural_update',
  description: dictionary.divisaoOperacionalRural.mcpDescription.update,
  requiredPermissions: { divisaoOperacionalRural: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: divisaoOperacionalRuralUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await divisaoOperacionalRuralUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function divisaoOperacionalRuralUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      divisaoOperacionalRural: ['update'],
    },
    context,
  );

  const { id } = divisaoOperacionalRuralUpdateParamsInputSchema.parse(params);

  const data = divisaoOperacionalRuralUpdateBodyInputSchema.parse(body);

  let divisaoOperacionalRural = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentDivisaoOperacionalRural =
          await tx.divisaoOperacionalRural.findUnique({
            where: {
              id_organizationId: {
                id,
                organizationId: currentOrganization.id,
              },
            },
            select: { updatedAt: true },
          });

        if (currentDivisaoOperacionalRural) {
          const currentUpdatedAt =
            currentDivisaoOperacionalRural.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldDivisaoOperacionalRural =
        await tx.divisaoOperacionalRural.findUniqueOrThrow({
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

      await tx.divisaoOperacionalRural.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          nome: data.nome,
          tipo: data.tipo,
          areaHa: data.areaHa,
          usoAtual: data.usoAtual,
          capacidadeCabecas: data.capacidadeCabecas,
          cercaTipo: data.cercaTipo,
          cercaEstado: data.cercaEstado,
          bebedouro: data.bebedouro,
          cocho: data.cocho,
          kml: data.kml,
          observacoes: data.observacoes,
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedDivisaoOperacionalRural =
        await tx.divisaoOperacionalRural.findUniqueOrThrow({
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
        entityName: 'DivisaoOperacionalRural',
        operation: auditLogOperations.update,
        context,
        oldData: oldDivisaoOperacionalRural,
        newData: updatedDivisaoOperacionalRural,
        tx,
      });

      return updatedDivisaoOperacionalRural;
    },
  );

  divisaoOperacionalRural = await filePopulateDownloadUrlInTree(
    divisaoOperacionalRural,
  );

  return divisaoOperacionalRural;
}
