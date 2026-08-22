import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  chaveImovelUpdateBodyInputSchema,
  chaveImovelUpdateParamsInputSchema,
} from '../chaveImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const chaveImovelUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/chave-imovel/{id}',
  params: chaveImovelUpdateParamsInputSchema,
  body: chaveImovelUpdateBodyInputSchema,
  response: 'ChaveImovel',
};

export const chaveImovelUpdateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'chaveImovel_update',
  description: dictionary.chaveImovel.mcpDescription.update,
  requiredPermissions: { chaveImovel: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: chaveImovelUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await chaveImovelUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function chaveImovelUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      chaveImovel: ['update'],
    },
    context,
  );

  const { id } = chaveImovelUpdateParamsInputSchema.parse(params);

  const data = chaveImovelUpdateBodyInputSchema.parse(body);

  let chaveImovel = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentChaveImovel = await tx.chaveImovel.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentChaveImovel) {
          const currentUpdatedAt = currentChaveImovel.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }
      const duplicatedCodigo = await tx.chaveImovel.count({
        where: {
          codigo: {
            equals: data.codigo,
            mode: 'insensitive',
          },
          id: { not: id },
          organizationId: currentOrganization.id,
        },
      });

      if (duplicatedCodigo) {
        throw new Error400(
          dictionaryFormat(
            context.dictionary.shared.errors.unique,
            context.dictionary.chaveImovel.fields.codigo,
          ),
        );
      }

      const oldChaveImovel = await tx.chaveImovel.findUniqueOrThrow({
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

      await tx.chaveImovel.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          codigo: data.codigo,
          tipo: data.tipo,
          status: data.status,
          localArmazenamento: data.localArmazenamento,
          dataRetirada: data.dataRetirada,
          dataPrevistaDevolucao: data.dataPrevistaDevolucao,
          dataDevolucao: data.dataDevolucao,
          retiradaPor: data.retiradaPor,
          telefoneRetirada: data.telefoneRetirada,
          observacoes: data.observacoes,
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedChaveImovel = await tx.chaveImovel.findUniqueOrThrow({
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
        entityName: 'ChaveImovel',
        operation: auditLogOperations.update,
        context,
        oldData: oldChaveImovel,
        newData: updatedChaveImovel,
        tx,
      });

      return updatedChaveImovel;
    },
  );

  chaveImovel = await filePopulateDownloadUrlInTree(chaveImovel);

  return chaveImovel;
}
