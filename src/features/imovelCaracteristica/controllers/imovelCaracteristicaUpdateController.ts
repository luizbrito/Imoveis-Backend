import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  imovelCaracteristicaUpdateBodyInputSchema,
  imovelCaracteristicaUpdateParamsInputSchema,
} from '../imovelCaracteristicaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const imovelCaracteristicaUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/imovel-caracteristica/{id}',
  params: imovelCaracteristicaUpdateParamsInputSchema,
  body: imovelCaracteristicaUpdateBodyInputSchema,
  response: 'ImovelCaracteristica',
};

export const imovelCaracteristicaUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'imovelCaracteristica_update',
  description: dictionary.imovelCaracteristica.mcpDescription.update,
  requiredPermissions: { imovelCaracteristica: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: imovelCaracteristicaUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await imovelCaracteristicaUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function imovelCaracteristicaUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      imovelCaracteristica: ['update'],
    },
    context,
  );

  const { id } = imovelCaracteristicaUpdateParamsInputSchema.parse(params);

  const data = imovelCaracteristicaUpdateBodyInputSchema.parse(body);

  let imovelCaracteristica = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentImovelCaracteristica =
          await tx.imovelCaracteristica.findUnique({
            where: {
              id_organizationId: {
                id,
                organizationId: currentOrganization.id,
              },
            },
            select: { updatedAt: true },
          });

        if (currentImovelCaracteristica) {
          const currentUpdatedAt =
            currentImovelCaracteristica.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldImovelCaracteristica =
        await tx.imovelCaracteristica.findUniqueOrThrow({
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
            caracteristica: {
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

      await tx.imovelCaracteristica.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          valorTexto: data.valorTexto,
          destaque: data.destaque,
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          caracteristica: prismaRelationship.connectOrDisconnectOne(
            data.caracteristica,
          ),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedImovelCaracteristica =
        await tx.imovelCaracteristica.findUniqueOrThrow({
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
            caracteristica: {
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

      await auditLogCreate({
        entityId: id,
        entityName: 'ImovelCaracteristica',
        operation: auditLogOperations.update,
        context,
        oldData: oldImovelCaracteristica,
        newData: updatedImovelCaracteristica,
        tx,
      });

      return updatedImovelCaracteristica;
    },
  );

  imovelCaracteristica =
    await filePopulateDownloadUrlInTree(imovelCaracteristica);

  return imovelCaracteristica;
}
