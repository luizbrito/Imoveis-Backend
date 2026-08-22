import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  documentoPessoaUpdateBodyInputSchema,
  documentoPessoaUpdateParamsInputSchema,
} from '../documentoPessoaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const documentoPessoaUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/documento-pessoa/{id}',
  params: documentoPessoaUpdateParamsInputSchema,
  body: documentoPessoaUpdateBodyInputSchema,
  response: 'DocumentoPessoa',
};

export const documentoPessoaUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'documentoPessoa_update',
  description: dictionary.documentoPessoa.mcpDescription.update,
  requiredPermissions: { documentoPessoa: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: documentoPessoaUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await documentoPessoaUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function documentoPessoaUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      documentoPessoa: ['update'],
    },
    context,
  );

  const { id } = documentoPessoaUpdateParamsInputSchema.parse(params);

  const data = documentoPessoaUpdateBodyInputSchema.parse(body);

  let documentoPessoa = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentDocumentoPessoa = await tx.documentoPessoa.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentDocumentoPessoa) {
          const currentUpdatedAt =
            currentDocumentoPessoa.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldDocumentoPessoa = await tx.documentoPessoa.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          proprietario: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          cliente: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          corretor: {
            select: {
              id: true,
              nomeCompleto: true,
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

      await tx.documentoPessoa.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          titulo: data.titulo,
          tipo: data.tipo,
          numero: data.numero,
          dataEmissao: data.dataEmissao,
          dataValidade: data.dataValidade,
          arquivos: data.arquivos,
          statusValidacao: data.statusValidacao,
          observacoes: data.observacoes,
          proprietario: prismaRelationship.connectOrDisconnectOne(
            data.proprietario,
          ),
          cliente: prismaRelationship.connectOrDisconnectOne(data.cliente),
          corretor: prismaRelationship.connectOrDisconnectOne(data.corretor),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedDocumentoPessoa = await tx.documentoPessoa.findUniqueOrThrow(
        {
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          include: {
            proprietario: {
              select: {
                id: true,
                nomeRazaoSocial: true,
              },
            },
            cliente: {
              select: {
                id: true,
                nomeRazaoSocial: true,
              },
            },
            corretor: {
              select: {
                id: true,
                nomeCompleto: true,
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
        entityName: 'DocumentoPessoa',
        operation: auditLogOperations.update,
        context,
        oldData: oldDocumentoPessoa,
        newData: updatedDocumentoPessoa,
        tx,
      });

      return updatedDocumentoPessoa;
    },
  );

  documentoPessoa = await filePopulateDownloadUrlInTree(documentoPessoa);

  return documentoPessoa;
}
