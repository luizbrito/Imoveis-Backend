import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { lancamentoFinanceiroCreateInputSchema } from '../lancamentoFinanceiroSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const lancamentoFinanceiroCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/lancamento-financeiro',
  body: lancamentoFinanceiroCreateInputSchema,
  response: 'LancamentoFinanceiro',
};

export const lancamentoFinanceiroCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'lancamentoFinanceiro_create',
  description: dictionary.lancamentoFinanceiro.mcpDescription.create,
  requiredPermissions: { lancamentoFinanceiro: ['create'] },
  schema: toMcpJsonSchema(lancamentoFinanceiroCreateInputSchema),
  handler: async (params, context) => {
    return await lancamentoFinanceiroCreateController(params, context);
  },
});

export async function lancamentoFinanceiroCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      lancamentoFinanceiro: ['create'],
    },
    context,
  );
  return await lancamentoFinanceiroCreate(body, context);
}

export async function lancamentoFinanceiroCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = lancamentoFinanceiroCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newLancamentoFinanceiro = await tx.lancamentoFinanceiro.create({
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
          filial: prismaRelationship.connectOneOrThrow(data.filial),
          contaFinanceira: prismaRelationship.connectOneOrThrow(
            data.contaFinanceira,
          ),
          categoriaFinanceira: prismaRelationship.connectOneOrThrow(
            data.categoriaFinanceira,
          ),
          imovel: prismaRelationship.connectOne(data.imovel),
          venda: prismaRelationship.connectOne(data.venda),
          locacao: prismaRelationship.connectOne(data.locacao),
          cobrancaLocacao: prismaRelationship.connectOne(data.cobrancaLocacao),
          repasseProprietario: prismaRelationship.connectOne(
            data.repasseProprietario,
          ),
          comissao: prismaRelationship.connectOne(data.comissao),
          despesaImovel: prismaRelationship.connectOne(data.despesaImovel),
          importHash: data.importHash,
          organization: prismaRelationship.connectOneOrThrow(
            context.currentOrganization!.id,
          ),
          createdByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
          createdByUserId: context.currentUser?.id,
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
        entityId: newLancamentoFinanceiro.id,
        entityName: 'LancamentoFinanceiro',
        operation: auditLogOperations.create,
        context,
        newData: newLancamentoFinanceiro,
        tx,
      });

      const lancamentoFinanceiro = await filePopulateDownloadUrlInTree(
        newLancamentoFinanceiro,
      );

      return lancamentoFinanceiro;
    },
  );
}
