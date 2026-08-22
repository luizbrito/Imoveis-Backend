import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  seguroImovelUpdateBodyInputSchema,
  seguroImovelUpdateParamsInputSchema,
} from '../seguroImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const seguroImovelUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/seguro-imovel/{id}',
  params: seguroImovelUpdateParamsInputSchema,
  body: seguroImovelUpdateBodyInputSchema,
  response: 'SeguroImovel',
};

export const seguroImovelUpdateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'seguroImovel_update',
  description: dictionary.seguroImovel.mcpDescription.update,
  requiredPermissions: { seguroImovel: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: seguroImovelUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await seguroImovelUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function seguroImovelUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      seguroImovel: ['update'],
    },
    context,
  );

  const { id } = seguroImovelUpdateParamsInputSchema.parse(params);

  const data = seguroImovelUpdateBodyInputSchema.parse(body);

  let seguroImovel = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentSeguroImovel = await tx.seguroImovel.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentSeguroImovel) {
          const currentUpdatedAt = currentSeguroImovel.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }
      const duplicatedNumeroApolice = await tx.seguroImovel.count({
        where: {
          numeroApolice: {
            equals: data.numeroApolice,
            mode: 'insensitive',
          },
          id: { not: id },
          organizationId: currentOrganization.id,
        },
      });

      if (duplicatedNumeroApolice) {
        throw new Error400(
          dictionaryFormat(
            context.dictionary.shared.errors.unique,
            context.dictionary.seguroImovel.fields.numeroApolice,
          ),
        );
      }

      const oldSeguroImovel = await tx.seguroImovel.findUniqueOrThrow({
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
          locacao: {
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

      await tx.seguroImovel.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          tipo: data.tipo,
          seguradora: data.seguradora,
          numeroApolice: data.numeroApolice,
          dataInicio: data.dataInicio,
          dataFim: data.dataFim,
          valorPremio: data.valorPremio,
          valorCobertura: data.valorCobertura,
          status: data.status,
          documentos: data.documentos,
          observacoes: data.observacoes,
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          locacao: prismaRelationship.connectOrDisconnectOne(data.locacao),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedSeguroImovel = await tx.seguroImovel.findUniqueOrThrow({
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
          locacao: {
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
        entityName: 'SeguroImovel',
        operation: auditLogOperations.update,
        context,
        oldData: oldSeguroImovel,
        newData: updatedSeguroImovel,
        tx,
      });

      return updatedSeguroImovel;
    },
  );

  seguroImovel = await filePopulateDownloadUrlInTree(seguroImovel);

  return seguroImovel;
}
