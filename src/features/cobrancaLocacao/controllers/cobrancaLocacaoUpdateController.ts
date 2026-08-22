import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  cobrancaLocacaoUpdateBodyInputSchema,
  cobrancaLocacaoUpdateParamsInputSchema,
} from '../cobrancaLocacaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const cobrancaLocacaoUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/cobranca-locacao/{id}',
  params: cobrancaLocacaoUpdateParamsInputSchema,
  body: cobrancaLocacaoUpdateBodyInputSchema,
  response: 'CobrancaLocacao',
};

export const cobrancaLocacaoUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'cobrancaLocacao_update',
  description: dictionary.cobrancaLocacao.mcpDescription.update,
  requiredPermissions: { cobrancaLocacao: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: cobrancaLocacaoUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await cobrancaLocacaoUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function cobrancaLocacaoUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      cobrancaLocacao: ['update'],
    },
    context,
  );

  const { id } = cobrancaLocacaoUpdateParamsInputSchema.parse(params);

  const data = cobrancaLocacaoUpdateBodyInputSchema.parse(body);

  let cobrancaLocacao = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentCobrancaLocacao = await tx.cobrancaLocacao.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentCobrancaLocacao) {
          const currentUpdatedAt =
            currentCobrancaLocacao.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldCobrancaLocacao = await tx.cobrancaLocacao.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          pagamentos: {
            select: {
              id: true,
              identificadorTransacao: true,
            },
          },
          lancamentosFinanceiros: {
            select: {
              id: true,
              descricao: true,
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

      await tx.cobrancaLocacao.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          competencia: data.competencia,
          dataVencimento: data.dataVencimento,
          status: data.status,
          valorAluguel: data.valorAluguel,
          valorCondominio: data.valorCondominio,
          valorIptu: data.valorIptu,
          valorSeguro: data.valorSeguro,
          valorMulta: data.valorMulta,
          valorJuros: data.valorJuros,
          valorDescontos: data.valorDescontos,
          valorTotal: data.valorTotal,
          linhaDigitavel: data.linhaDigitavel,
          urlBoleto: data.urlBoleto,
          observacoes: data.observacoes,
          locacao: prismaRelationship.connectOrDisconnectOne(data.locacao),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedCobrancaLocacao = await tx.cobrancaLocacao.findUniqueOrThrow(
        {
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          include: {
            pagamentos: {
              select: {
                id: true,
                identificadorTransacao: true,
              },
            },
            lancamentosFinanceiros: {
              select: {
                id: true,
                descricao: true,
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
        },
      );

      await auditLogCreate({
        entityId: id,
        entityName: 'CobrancaLocacao',
        operation: auditLogOperations.update,
        context,
        oldData: oldCobrancaLocacao,
        newData: updatedCobrancaLocacao,
        tx,
      });

      return updatedCobrancaLocacao;
    },
  );

  cobrancaLocacao = await filePopulateDownloadUrlInTree(cobrancaLocacao);

  return cobrancaLocacao;
}
