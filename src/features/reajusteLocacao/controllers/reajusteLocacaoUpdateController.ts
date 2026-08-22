import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  reajusteLocacaoUpdateBodyInputSchema,
  reajusteLocacaoUpdateParamsInputSchema,
} from '../reajusteLocacaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const reajusteLocacaoUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/reajuste-locacao/{id}',
  params: reajusteLocacaoUpdateParamsInputSchema,
  body: reajusteLocacaoUpdateBodyInputSchema,
  response: 'ReajusteLocacao',
};

export const reajusteLocacaoUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'reajusteLocacao_update',
  description: dictionary.reajusteLocacao.mcpDescription.update,
  requiredPermissions: { reajusteLocacao: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: reajusteLocacaoUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await reajusteLocacaoUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function reajusteLocacaoUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      reajusteLocacao: ['update'],
    },
    context,
  );

  const { id } = reajusteLocacaoUpdateParamsInputSchema.parse(params);

  const data = reajusteLocacaoUpdateBodyInputSchema.parse(body);

  let reajusteLocacao = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentReajusteLocacao = await tx.reajusteLocacao.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentReajusteLocacao) {
          const currentUpdatedAt =
            currentReajusteLocacao.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldReajusteLocacao = await tx.reajusteLocacao.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
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

      await tx.reajusteLocacao.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          dataBase: data.dataBase,
          indice: data.indice,
          percentual: data.percentual,
          valorAnterior: data.valorAnterior,
          valorNovo: data.valorNovo,
          status: data.status,
          documentos: data.documentos,
          observacoes: data.observacoes,
          locacao: prismaRelationship.connectOrDisconnectOne(data.locacao),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedReajusteLocacao = await tx.reajusteLocacao.findUniqueOrThrow(
        {
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          include: {
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
        },
      );

      await auditLogCreate({
        entityId: id,
        entityName: 'ReajusteLocacao',
        operation: auditLogOperations.update,
        context,
        oldData: oldReajusteLocacao,
        newData: updatedReajusteLocacao,
        tx,
      });

      return updatedReajusteLocacao;
    },
  );

  reajusteLocacao = await filePopulateDownloadUrlInTree(reajusteLocacao);

  return reajusteLocacao;
}
