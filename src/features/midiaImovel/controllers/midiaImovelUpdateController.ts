import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  midiaImovelUpdateBodyInputSchema,
  midiaImovelUpdateParamsInputSchema,
} from '../midiaImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const midiaImovelUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/midia-imovel/{id}',
  params: midiaImovelUpdateParamsInputSchema,
  body: midiaImovelUpdateBodyInputSchema,
  response: 'MidiaImovel',
};

export const midiaImovelUpdateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'midiaImovel_update',
  description: dictionary.midiaImovel.mcpDescription.update,
  requiredPermissions: { midiaImovel: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: midiaImovelUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await midiaImovelUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function midiaImovelUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      midiaImovel: ['update'],
    },
    context,
  );

  const { id } = midiaImovelUpdateParamsInputSchema.parse(params);

  const data = midiaImovelUpdateBodyInputSchema.parse(body);

  let midiaImovel = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentMidiaImovel = await tx.midiaImovel.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentMidiaImovel) {
          const currentUpdatedAt = currentMidiaImovel.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldMidiaImovel = await tx.midiaImovel.findUniqueOrThrow({
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

      await tx.midiaImovel.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          titulo: data.titulo,
          tipo: data.tipo,
          imagens: data.imagens,
          urlExterna: data.urlExterna,
          ordem: data.ordem,
          principal: data.principal,
          publica: data.publica,
          legenda: data.legenda,
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedMidiaImovel = await tx.midiaImovel.findUniqueOrThrow({
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
        entityName: 'MidiaImovel',
        operation: auditLogOperations.update,
        context,
        oldData: oldMidiaImovel,
        newData: updatedMidiaImovel,
        tx,
      });

      return updatedMidiaImovel;
    },
  );

  midiaImovel = await filePopulateDownloadUrlInTree(midiaImovel);

  return midiaImovel;
}
