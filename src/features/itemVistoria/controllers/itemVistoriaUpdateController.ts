import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  itemVistoriaUpdateBodyInputSchema,
  itemVistoriaUpdateParamsInputSchema,
} from '../itemVistoriaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const itemVistoriaUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/item-vistoria/{id}',
  params: itemVistoriaUpdateParamsInputSchema,
  body: itemVistoriaUpdateBodyInputSchema,
  response: 'ItemVistoria',
};

export const itemVistoriaUpdateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'itemVistoria_update',
  description: dictionary.itemVistoria.mcpDescription.update,
  requiredPermissions: { itemVistoria: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: itemVistoriaUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await itemVistoriaUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function itemVistoriaUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      itemVistoria: ['update'],
    },
    context,
  );

  const { id } = itemVistoriaUpdateParamsInputSchema.parse(params);

  const data = itemVistoriaUpdateBodyInputSchema.parse(body);

  let itemVistoria = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentItemVistoria = await tx.itemVistoria.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentItemVistoria) {
          const currentUpdatedAt = currentItemVistoria.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldItemVistoria = await tx.itemVistoria.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          vistoria: {
            select: {
              id: true,
              codigo: true,
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

      await tx.itemVistoria.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          ambiente: data.ambiente,
          item: data.item,
          estado: data.estado,
          quantidade: data.quantidade,
          descricao: data.descricao,
          fotos: data.fotos,
          requerCorrecao: data.requerCorrecao,
          valorEstimadoCorrecao: data.valorEstimadoCorrecao,
          vistoria: prismaRelationship.connectOrDisconnectOne(data.vistoria),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedItemVistoria = await tx.itemVistoria.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          vistoria: {
            select: {
              id: true,
              codigo: true,
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
        entityName: 'ItemVistoria',
        operation: auditLogOperations.update,
        context,
        oldData: oldItemVistoria,
        newData: updatedItemVistoria,
        tx,
      });

      return updatedItemVistoria;
    },
  );

  itemVistoria = await filePopulateDownloadUrlInTree(itemVistoria);

  return itemVistoria;
}
