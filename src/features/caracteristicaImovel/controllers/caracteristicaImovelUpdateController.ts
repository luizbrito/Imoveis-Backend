import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  caracteristicaImovelUpdateBodyInputSchema,
  caracteristicaImovelUpdateParamsInputSchema,
} from '../caracteristicaImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const caracteristicaImovelUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/caracteristica-imovel/{id}',
  params: caracteristicaImovelUpdateParamsInputSchema,
  body: caracteristicaImovelUpdateBodyInputSchema,
  response: 'CaracteristicaImovel',
};

export const caracteristicaImovelUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'caracteristicaImovel_update',
  description: dictionary.caracteristicaImovel.mcpDescription.update,
  requiredPermissions: { caracteristicaImovel: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: caracteristicaImovelUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await caracteristicaImovelUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function caracteristicaImovelUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      caracteristicaImovel: ['update'],
    },
    context,
  );

  const { id } = caracteristicaImovelUpdateParamsInputSchema.parse(params);

  const data = caracteristicaImovelUpdateBodyInputSchema.parse(body);

  let caracteristicaImovel = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentCaracteristicaImovel =
          await tx.caracteristicaImovel.findUnique({
            where: {
              id_organizationId: {
                id,
                organizationId: currentOrganization.id,
              },
            },
            select: { updatedAt: true },
          });

        if (currentCaracteristicaImovel) {
          const currentUpdatedAt =
            currentCaracteristicaImovel.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }
      const duplicatedNome = await tx.caracteristicaImovel.count({
        where: {
          nome: {
            equals: data.nome,
            mode: 'insensitive',
          },
          id: { not: id },
          organizationId: currentOrganization.id,
        },
      });

      if (duplicatedNome) {
        throw new Error400(
          dictionaryFormat(
            context.dictionary.shared.errors.unique,
            context.dictionary.caracteristicaImovel.fields.nome,
          ),
        );
      }

      const oldCaracteristicaImovel =
        await tx.caracteristicaImovel.findUniqueOrThrow({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          include: {
            imoveisVinculados: {
              select: {
                id: true,
                valorTexto: true,
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

      await tx.caracteristicaImovel.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          nome: data.nome,
          grupo: data.grupo,
          icone: data.icone,
          ativa: data.ativa,
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedCaracteristicaImovel =
        await tx.caracteristicaImovel.findUniqueOrThrow({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          include: {
            imoveisVinculados: {
              select: {
                id: true,
                valorTexto: true,
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
        entityName: 'CaracteristicaImovel',
        operation: auditLogOperations.update,
        context,
        oldData: oldCaracteristicaImovel,
        newData: updatedCaracteristicaImovel,
        tx,
      });

      return updatedCaracteristicaImovel;
    },
  );

  caracteristicaImovel =
    await filePopulateDownloadUrlInTree(caracteristicaImovel);

  return caracteristicaImovel;
}
