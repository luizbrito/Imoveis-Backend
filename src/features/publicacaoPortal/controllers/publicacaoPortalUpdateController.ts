import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  publicacaoPortalUpdateBodyInputSchema,
  publicacaoPortalUpdateParamsInputSchema,
} from '../publicacaoPortalSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const publicacaoPortalUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/publicacao-portal/{id}',
  params: publicacaoPortalUpdateParamsInputSchema,
  body: publicacaoPortalUpdateBodyInputSchema,
  response: 'PublicacaoPortal',
};

export const publicacaoPortalUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'publicacaoPortal_update',
  description: dictionary.publicacaoPortal.mcpDescription.update,
  requiredPermissions: { publicacaoPortal: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: publicacaoPortalUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await publicacaoPortalUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function publicacaoPortalUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      publicacaoPortal: ['update'],
    },
    context,
  );

  const { id } = publicacaoPortalUpdateParamsInputSchema.parse(params);

  const data = publicacaoPortalUpdateBodyInputSchema.parse(body);

  let publicacaoPortal = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentPublicacaoPortal = await tx.publicacaoPortal.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentPublicacaoPortal) {
          const currentUpdatedAt =
            currentPublicacaoPortal.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldPublicacaoPortal = await tx.publicacaoPortal.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          anuncio: {
            select: {
              id: true,
              titulo: true,
            },
          },
          portal: {
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

      await tx.publicacaoPortal.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          codigoExterno: data.codigoExterno,
          status: data.status,
          dataEnvio: data.dataEnvio,
          dataAtualizacao: data.dataAtualizacao,
          urlPublicada: data.urlPublicada,
          mensagemRetorno: data.mensagemRetorno,
          tentativas: data.tentativas,
          anuncio: prismaRelationship.connectOrDisconnectOne(data.anuncio),
          portal: prismaRelationship.connectOrDisconnectOne(data.portal),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedPublicacaoPortal =
        await tx.publicacaoPortal.findUniqueOrThrow({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          include: {
            anuncio: {
              select: {
                id: true,
                titulo: true,
              },
            },
            portal: {
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
        entityName: 'PublicacaoPortal',
        operation: auditLogOperations.update,
        context,
        oldData: oldPublicacaoPortal,
        newData: updatedPublicacaoPortal,
        tx,
      });

      return updatedPublicacaoPortal;
    },
  );

  publicacaoPortal = await filePopulateDownloadUrlInTree(publicacaoPortal);

  return publicacaoPortal;
}
