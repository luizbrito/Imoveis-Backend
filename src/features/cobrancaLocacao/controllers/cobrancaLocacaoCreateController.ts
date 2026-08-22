import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { cobrancaLocacaoCreateInputSchema } from '../cobrancaLocacaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const cobrancaLocacaoCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/cobranca-locacao',
  body: cobrancaLocacaoCreateInputSchema,
  response: 'CobrancaLocacao',
};

export const cobrancaLocacaoCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'cobrancaLocacao_create',
  description: dictionary.cobrancaLocacao.mcpDescription.create,
  requiredPermissions: { cobrancaLocacao: ['create'] },
  schema: toMcpJsonSchema(cobrancaLocacaoCreateInputSchema),
  handler: async (params, context) => {
    return await cobrancaLocacaoCreateController(params, context);
  },
});

export async function cobrancaLocacaoCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      cobrancaLocacao: ['create'],
    },
    context,
  );
  return await cobrancaLocacaoCreate(body, context);
}

export async function cobrancaLocacaoCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = cobrancaLocacaoCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newCobrancaLocacao = await tx.cobrancaLocacao.create({
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
          locacao: prismaRelationship.connectOneOrThrow(data.locacao),
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

      await auditLogCreate({
        entityId: newCobrancaLocacao.id,
        entityName: 'CobrancaLocacao',
        operation: auditLogOperations.create,
        context,
        newData: newCobrancaLocacao,
        tx,
      });

      const cobrancaLocacao =
        await filePopulateDownloadUrlInTree(newCobrancaLocacao);

      return cobrancaLocacao;
    },
  );
}
