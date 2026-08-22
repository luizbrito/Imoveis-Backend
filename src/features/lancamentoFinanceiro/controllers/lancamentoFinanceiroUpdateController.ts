import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  lancamentoFinanceiroUpdateBodyInputSchema,
  lancamentoFinanceiroUpdateParamsInputSchema,
} from '../lancamentoFinanceiroSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const lancamentoFinanceiroUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/lancamento-financeiro/{id}',
  params: lancamentoFinanceiroUpdateParamsInputSchema,
  body: lancamentoFinanceiroUpdateBodyInputSchema,
  response: 'LancamentoFinanceiro',
};

export const lancamentoFinanceiroUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'lancamentoFinanceiro_update',
  description: dictionary.lancamentoFinanceiro.mcpDescription.update,
  requiredPermissions: { lancamentoFinanceiro: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: lancamentoFinanceiroUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await lancamentoFinanceiroUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function lancamentoFinanceiroUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      lancamentoFinanceiro: ['update'],
    },
    context,
  );

  const { id } = lancamentoFinanceiroUpdateParamsInputSchema.parse(params);

  const data = lancamentoFinanceiroUpdateBodyInputSchema.parse(body);

  let lancamentoFinanceiro = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentLancamentoFinanceiro =
          await tx.lancamentoFinanceiro.findUnique({
            where: {
              id_organizationId: {
                id,
                organizationId: currentOrganization.id,
              },
            },
            select: { updatedAt: true },
          });

        if (currentLancamentoFinanceiro) {
          const currentUpdatedAt =
            currentLancamentoFinanceiro.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldLancamentoFinanceiro =
        await tx.lancamentoFinanceiro.findUniqueOrThrow({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          include: {
            filial: {
              select: {
                id: true,
                nome: true,
              },
            },
            contaFinanceira: {
              select: {
                id: true,
                nome: true,
              },
            },
            categoriaFinanceira: {
              select: {
                id: true,
                nome: true,
              },
            },
            imovel: {
              select: {
                id: true,
                titulo: true,
              },
            },
            venda: {
              select: {
                id: true,
                codigo: true,
              },
            },
            locacao: {
              select: {
                id: true,
                codigo: true,
              },
            },
            cobrancaLocacao: {
              select: {
                id: true,
                competencia: true,
              },
            },
            repasseProprietario: {
              select: {
                id: true,
                competencia: true,
              },
            },
            comissao: {
              select: {
                id: true,
                codigo: true,
              },
            },
            despesaImovel: {
              select: {
                id: true,
                descricao: true,
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

      await tx.lancamentoFinanceiro.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          descricao: data.descricao,
          tipo: data.tipo,
          status: data.status,
          dataCompetencia: data.dataCompetencia,
          dataVencimento: data.dataVencimento,
          dataRealizacao: data.dataRealizacao,
          valor: data.valor,
          moeda: data.moeda,
          formaPagamento: data.formaPagamento,
          documentos: data.documentos,
          observacoes: data.observacoes,
          filial: prismaRelationship.connectOrDisconnectOne(data.filial),
          contaFinanceira: prismaRelationship.connectOrDisconnectOne(
            data.contaFinanceira,
          ),
          categoriaFinanceira: prismaRelationship.connectOrDisconnectOne(
            data.categoriaFinanceira,
          ),
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          venda: prismaRelationship.connectOrDisconnectOne(data.venda),
          locacao: prismaRelationship.connectOrDisconnectOne(data.locacao),
          cobrancaLocacao: prismaRelationship.connectOrDisconnectOne(
            data.cobrancaLocacao,
          ),
          repasseProprietario: prismaRelationship.connectOrDisconnectOne(
            data.repasseProprietario,
          ),
          comissao: prismaRelationship.connectOrDisconnectOne(data.comissao),
          despesaImovel: prismaRelationship.connectOrDisconnectOne(
            data.despesaImovel,
          ),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedLancamentoFinanceiro =
        await tx.lancamentoFinanceiro.findUniqueOrThrow({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          include: {
            filial: {
              select: {
                id: true,
                nome: true,
              },
            },
            contaFinanceira: {
              select: {
                id: true,
                nome: true,
              },
            },
            categoriaFinanceira: {
              select: {
                id: true,
                nome: true,
              },
            },
            imovel: {
              select: {
                id: true,
                titulo: true,
              },
            },
            venda: {
              select: {
                id: true,
                codigo: true,
              },
            },
            locacao: {
              select: {
                id: true,
                codigo: true,
              },
            },
            cobrancaLocacao: {
              select: {
                id: true,
                competencia: true,
              },
            },
            repasseProprietario: {
              select: {
                id: true,
                competencia: true,
              },
            },
            comissao: {
              select: {
                id: true,
                codigo: true,
              },
            },
            despesaImovel: {
              select: {
                id: true,
                descricao: true,
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
        entityName: 'LancamentoFinanceiro',
        operation: auditLogOperations.update,
        context,
        oldData: oldLancamentoFinanceiro,
        newData: updatedLancamentoFinanceiro,
        tx,
      });

      return updatedLancamentoFinanceiro;
    },
  );

  lancamentoFinanceiro =
    await filePopulateDownloadUrlInTree(lancamentoFinanceiro);

  return lancamentoFinanceiro;
}
