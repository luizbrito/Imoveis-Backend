import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  favoritoClienteUpdateBodyInputSchema,
  favoritoClienteUpdateParamsInputSchema,
} from '../favoritoClienteSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const favoritoClienteUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/favorito-cliente/{id}',
  params: favoritoClienteUpdateParamsInputSchema,
  body: favoritoClienteUpdateBodyInputSchema,
  response: 'FavoritoCliente',
};

export const favoritoClienteUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'favoritoCliente_update',
  description: dictionary.favoritoCliente.mcpDescription.update,
  requiredPermissions: { favoritoCliente: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: favoritoClienteUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await favoritoClienteUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function favoritoClienteUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      favoritoCliente: ['update'],
    },
    context,
  );

  const { id } = favoritoClienteUpdateParamsInputSchema.parse(params);

  const data = favoritoClienteUpdateBodyInputSchema.parse(body);

  let favoritoCliente = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentFavoritoCliente = await tx.favoritoCliente.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentFavoritoCliente) {
          const currentUpdatedAt =
            currentFavoritoCliente.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldFavoritoCliente = await tx.favoritoCliente.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          cliente: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
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

      await tx.favoritoCliente.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          dataInclusao: data.dataInclusao,
          observacoes: data.observacoes,
          ativo: data.ativo,
          cliente: prismaRelationship.connectOrDisconnectOne(data.cliente),
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedFavoritoCliente = await tx.favoritoCliente.findUniqueOrThrow(
        {
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          include: {
            cliente: {
              select: {
                id: true,
                nomeRazaoSocial: true,
              },
            },
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
        },
      );

      await auditLogCreate({
        entityId: id,
        entityName: 'FavoritoCliente',
        operation: auditLogOperations.update,
        context,
        oldData: oldFavoritoCliente,
        newData: updatedFavoritoCliente,
        tx,
      });

      return updatedFavoritoCliente;
    },
  );

  favoritoCliente = await filePopulateDownloadUrlInTree(favoritoCliente);

  return favoritoCliente;
}
