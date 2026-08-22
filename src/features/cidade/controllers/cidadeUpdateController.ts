import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  cidadeUpdateBodyInputSchema,
  cidadeUpdateParamsInputSchema,
} from '../cidadeSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const cidadeUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/cidade/{id}',
  params: cidadeUpdateParamsInputSchema,
  body: cidadeUpdateBodyInputSchema,
  response: 'Cidade',
};

export const cidadeUpdateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'cidade_update',
  description: dictionary.cidade.mcpDescription.update,
  requiredPermissions: { cidade: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: cidadeUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await cidadeUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function cidadeUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      cidade: ['update'],
    },
    context,
  );

  const { id } = cidadeUpdateParamsInputSchema.parse(params);

  const data = cidadeUpdateBodyInputSchema.parse(body);

  let cidade = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentCidade = await tx.cidade.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentCidade) {
          const currentUpdatedAt = currentCidade.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldCidade = await tx.cidade.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          imoveisCidade: {
            select: {
              id: true,
              titulo: true,
            },
          },
          estado: {
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

      await tx.cidade.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          nome: data.nome,
          codigoOficial: data.codigoOficial,
          codigoPostal: data.codigoPostal,
          latitude: data.latitude,
          longitude: data.longitude,
          ativo: data.ativo,
          observacoes: data.observacoes,
          estado: prismaRelationship.connectOrDisconnectOne(data.estado),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedCidade = await tx.cidade.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          imoveisCidade: {
            select: {
              id: true,
              titulo: true,
            },
          },
          estado: {
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
        entityName: 'Cidade',
        operation: auditLogOperations.update,
        context,
        oldData: oldCidade,
        newData: updatedCidade,
        tx,
      });

      return updatedCidade;
    },
  );

  cidade = await filePopulateDownloadUrlInTree(cidade);

  return cidade;
}
