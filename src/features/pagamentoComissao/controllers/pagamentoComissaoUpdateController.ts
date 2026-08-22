import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  pagamentoComissaoUpdateBodyInputSchema,
  pagamentoComissaoUpdateParamsInputSchema,
} from '../pagamentoComissaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const pagamentoComissaoUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/pagamento-comissao/{id}',
  params: pagamentoComissaoUpdateParamsInputSchema,
  body: pagamentoComissaoUpdateBodyInputSchema,
  response: 'PagamentoComissao',
};

export const pagamentoComissaoUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'pagamentoComissao_update',
  description: dictionary.pagamentoComissao.mcpDescription.update,
  requiredPermissions: { pagamentoComissao: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: pagamentoComissaoUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await pagamentoComissaoUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function pagamentoComissaoUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      pagamentoComissao: ['update'],
    },
    context,
  );

  const { id } = pagamentoComissaoUpdateParamsInputSchema.parse(params);

  const data = pagamentoComissaoUpdateBodyInputSchema.parse(body);

  let pagamentoComissao = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentPagamentoComissao = await tx.pagamentoComissao.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentPagamentoComissao) {
          const currentUpdatedAt =
            currentPagamentoComissao.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldPagamentoComissao = await tx.pagamentoComissao.findUniqueOrThrow(
        {
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          include: {
            comissao: {
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

      await tx.pagamentoComissao.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          dataPagamento: data.dataPagamento,
          valor: data.valor,
          formaPagamento: data.formaPagamento,
          status: data.status,
          comprovante: data.comprovante,
          observacoes: data.observacoes,
          comissao: prismaRelationship.connectOrDisconnectOne(data.comissao),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedPagamentoComissao =
        await tx.pagamentoComissao.findUniqueOrThrow({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          include: {
            comissao: {
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
        entityName: 'PagamentoComissao',
        operation: auditLogOperations.update,
        context,
        oldData: oldPagamentoComissao,
        newData: updatedPagamentoComissao,
        tx,
      });

      return updatedPagamentoComissao;
    },
  );

  pagamentoComissao = await filePopulateDownloadUrlInTree(pagamentoComissao);

  return pagamentoComissao;
}
