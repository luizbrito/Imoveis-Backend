import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { pagamentoComissaoCreateInputSchema } from '../pagamentoComissaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const pagamentoComissaoCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/pagamento-comissao',
  body: pagamentoComissaoCreateInputSchema,
  response: 'PagamentoComissao',
};

export const pagamentoComissaoCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'pagamentoComissao_create',
  description: dictionary.pagamentoComissao.mcpDescription.create,
  requiredPermissions: { pagamentoComissao: ['create'] },
  schema: toMcpJsonSchema(pagamentoComissaoCreateInputSchema),
  handler: async (params, context) => {
    return await pagamentoComissaoCreateController(params, context);
  },
});

export async function pagamentoComissaoCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      pagamentoComissao: ['create'],
    },
    context,
  );
  return await pagamentoComissaoCreate(body, context);
}

export async function pagamentoComissaoCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = pagamentoComissaoCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newPagamentoComissao = await tx.pagamentoComissao.create({
        data: {
          dataPagamento: data.dataPagamento,
          valor: data.valor,
          formaPagamento: data.formaPagamento,
          status: data.status,
          comprovante: data.comprovante,
          observacoes: data.observacoes,
          comissao: prismaRelationship.connectOneOrThrow(data.comissao),
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
        entityId: newPagamentoComissao.id,
        entityName: 'PagamentoComissao',
        operation: auditLogOperations.create,
        context,
        newData: newPagamentoComissao,
        tx,
      });

      const pagamentoComissao =
        await filePopulateDownloadUrlInTree(newPagamentoComissao);

      return pagamentoComissao;
    },
  );
}
