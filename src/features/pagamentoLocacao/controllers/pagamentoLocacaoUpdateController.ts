import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  pagamentoLocacaoUpdateBodyInputSchema,
  pagamentoLocacaoUpdateParamsInputSchema,
} from '../pagamentoLocacaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const pagamentoLocacaoUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/pagamento-locacao/{id}',
  params: pagamentoLocacaoUpdateParamsInputSchema,
  body: pagamentoLocacaoUpdateBodyInputSchema,
  response: 'PagamentoLocacao',
};

export const pagamentoLocacaoUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'pagamentoLocacao_update',
  description: dictionary.pagamentoLocacao.mcpDescription.update,
  requiredPermissions: { pagamentoLocacao: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: pagamentoLocacaoUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await pagamentoLocacaoUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function pagamentoLocacaoUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      pagamentoLocacao: ['update'],
    },
    context,
  );

  const { id } = pagamentoLocacaoUpdateParamsInputSchema.parse(params);

  const data = pagamentoLocacaoUpdateBodyInputSchema.parse(body);

  let pagamentoLocacao = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentPagamentoLocacao = await tx.pagamentoLocacao.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentPagamentoLocacao) {
          const currentUpdatedAt =
            currentPagamentoLocacao.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldPagamentoLocacao = await tx.pagamentoLocacao.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          cobranca: {
            select: {
              id: true,
              competencia: true,
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

      await tx.pagamentoLocacao.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          dataPagamento: data.dataPagamento,
          valorPago: data.valorPago,
          formaPagamento: data.formaPagamento,
          identificadorTransacao: data.identificadorTransacao,
          status: data.status,
          comprovantes: data.comprovantes,
          observacoes: data.observacoes,
          cobranca: prismaRelationship.connectOrDisconnectOne(data.cobranca),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedPagamentoLocacao =
        await tx.pagamentoLocacao.findUniqueOrThrow({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          include: {
            cobranca: {
              select: {
                id: true,
                competencia: true,
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
        entityName: 'PagamentoLocacao',
        operation: auditLogOperations.update,
        context,
        oldData: oldPagamentoLocacao,
        newData: updatedPagamentoLocacao,
        tx,
      });

      return updatedPagamentoLocacao;
    },
  );

  pagamentoLocacao = await filePopulateDownloadUrlInTree(pagamentoLocacao);

  return pagamentoLocacao;
}
