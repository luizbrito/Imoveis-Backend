import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { despesaImovelCreateInputSchema } from '../despesaImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const despesaImovelCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/despesa-imovel',
  body: despesaImovelCreateInputSchema,
  response: 'DespesaImovel',
};

export const despesaImovelCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'despesaImovel_create',
  description: dictionary.despesaImovel.mcpDescription.create,
  requiredPermissions: { despesaImovel: ['create'] },
  schema: toMcpJsonSchema(despesaImovelCreateInputSchema),
  handler: async (params, context) => {
    return await despesaImovelCreateController(params, context);
  },
});

export async function despesaImovelCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      despesaImovel: ['create'],
    },
    context,
  );
  return await despesaImovelCreate(body, context);
}

export async function despesaImovelCreate(body: unknown, context: AppContext) {
  const currentOrganization = context.currentOrganization!;

  const data = despesaImovelCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newDespesaImovel = await tx.despesaImovel.create({
        data: {
          descricao: data.descricao,
          categoria: data.categoria,
          dataCompetencia: data.dataCompetencia,
          dataVencimento: data.dataVencimento,
          dataPagamento: data.dataPagamento,
          valor: data.valor,
          status: data.status,
          responsavelPagamento: data.responsavelPagamento,
          documentos: data.documentos,
          observacoes: data.observacoes,
          imovel: prismaRelationship.connectOneOrThrow(data.imovel),
          fornecedor: prismaRelationship.connectOne(data.fornecedor),
          locacao: prismaRelationship.connectOne(data.locacao),
          ordemServico: prismaRelationship.connectOne(data.ordemServico),
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
          lancamentosFinanceiros: {
            select: {
              id: true,
              descricao: true,
            },
          },
          imovel: {
            select: {
              id: true,
              titulo: true,
            },
          },
          fornecedor: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          locacao: {
            select: {
              id: true,
              codigo: true,
            },
          },
          ordemServico: {
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
        entityId: newDespesaImovel.id,
        entityName: 'DespesaImovel',
        operation: auditLogOperations.create,
        context,
        newData: newDespesaImovel,
        tx,
      });

      const despesaImovel =
        await filePopulateDownloadUrlInTree(newDespesaImovel);

      return despesaImovel;
    },
  );
}
