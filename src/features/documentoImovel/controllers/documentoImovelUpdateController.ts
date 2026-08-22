import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  documentoImovelUpdateBodyInputSchema,
  documentoImovelUpdateParamsInputSchema,
} from '../documentoImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const documentoImovelUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/documento-imovel/{id}',
  params: documentoImovelUpdateParamsInputSchema,
  body: documentoImovelUpdateBodyInputSchema,
  response: 'DocumentoImovel',
};

export const documentoImovelUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'documentoImovel_update',
  description: dictionary.documentoImovel.mcpDescription.update,
  requiredPermissions: { documentoImovel: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: documentoImovelUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await documentoImovelUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function documentoImovelUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      documentoImovel: ['update'],
    },
    context,
  );

  const { id } = documentoImovelUpdateParamsInputSchema.parse(params);

  const data = documentoImovelUpdateBodyInputSchema.parse(body);

  let documentoImovel = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentDocumentoImovel = await tx.documentoImovel.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentDocumentoImovel) {
          const currentUpdatedAt =
            currentDocumentoImovel.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldDocumentoImovel = await tx.documentoImovel.findUniqueOrThrow({
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

      await tx.documentoImovel.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          titulo: data.titulo,
          tipo: data.tipo,
          numeroDocumento: data.numeroDocumento,
          dataEmissao: data.dataEmissao,
          dataValidade: data.dataValidade,
          arquivos: data.arquivos,
          visibilidade: data.visibilidade,
          observacoes: data.observacoes,
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedDocumentoImovel = await tx.documentoImovel.findUniqueOrThrow(
        {
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
        },
      );

      await auditLogCreate({
        entityId: id,
        entityName: 'DocumentoImovel',
        operation: auditLogOperations.update,
        context,
        oldData: oldDocumentoImovel,
        newData: updatedDocumentoImovel,
        tx,
      });

      return updatedDocumentoImovel;
    },
  );

  documentoImovel = await filePopulateDownloadUrlInTree(documentoImovel);

  return documentoImovel;
}
