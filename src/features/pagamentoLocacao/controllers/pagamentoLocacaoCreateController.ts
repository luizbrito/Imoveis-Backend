import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { pagamentoLocacaoCreateInputSchema } from '../pagamentoLocacaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const pagamentoLocacaoCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/pagamento-locacao',
  body: pagamentoLocacaoCreateInputSchema,
  response: 'PagamentoLocacao',
};

export const pagamentoLocacaoCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'pagamentoLocacao_create',
  description: dictionary.pagamentoLocacao.mcpDescription.create,
  requiredPermissions: { pagamentoLocacao: ['create'] },
  schema: toMcpJsonSchema(pagamentoLocacaoCreateInputSchema),
  handler: async (params, context) => {
    return await pagamentoLocacaoCreateController(params, context);
  },
});

export async function pagamentoLocacaoCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      pagamentoLocacao: ['create'],
    },
    context,
  );
  return await pagamentoLocacaoCreate(body, context);
}

export async function pagamentoLocacaoCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = pagamentoLocacaoCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newPagamentoLocacao = await tx.pagamentoLocacao.create({
        data: {
          dataPagamento: data.dataPagamento,
          valorPago: data.valorPago,
          formaPagamento: data.formaPagamento,
          identificadorTransacao: data.identificadorTransacao,
          status: data.status,
          comprovantes: data.comprovantes,
          observacoes: data.observacoes,
          cobranca: prismaRelationship.connectOneOrThrow(data.cobranca),
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
        entityId: newPagamentoLocacao.id,
        entityName: 'PagamentoLocacao',
        operation: auditLogOperations.create,
        context,
        newData: newPagamentoLocacao,
        tx,
      });

      const pagamentoLocacao =
        await filePopulateDownloadUrlInTree(newPagamentoLocacao);

      return pagamentoLocacao;
    },
  );
}
