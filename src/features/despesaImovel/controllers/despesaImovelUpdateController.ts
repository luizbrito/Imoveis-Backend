import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  despesaImovelUpdateBodyInputSchema,
  despesaImovelUpdateParamsInputSchema,
} from '../despesaImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const despesaImovelUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/despesa-imovel/{id}',
  params: despesaImovelUpdateParamsInputSchema,
  body: despesaImovelUpdateBodyInputSchema,
  response: 'DespesaImovel',
};

export const despesaImovelUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'despesaImovel_update',
  description: dictionary.despesaImovel.mcpDescription.update,
  requiredPermissions: { despesaImovel: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: despesaImovelUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await despesaImovelUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function despesaImovelUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      despesaImovel: ['update'],
    },
    context,
  );

  const { id } = despesaImovelUpdateParamsInputSchema.parse(params);

  const data = despesaImovelUpdateBodyInputSchema.parse(body);

  let despesaImovel = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentDespesaImovel = await tx.despesaImovel.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentDespesaImovel) {
          const currentUpdatedAt = currentDespesaImovel.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldDespesaImovel = await tx.despesaImovel.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
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

      await tx.despesaImovel.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
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
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          fornecedor: prismaRelationship.connectOrDisconnectOne(
            data.fornecedor,
          ),
          locacao: prismaRelationship.connectOrDisconnectOne(data.locacao),
          ordemServico: prismaRelationship.connectOrDisconnectOne(
            data.ordemServico,
          ),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedDespesaImovel = await tx.despesaImovel.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
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
        entityId: id,
        entityName: 'DespesaImovel',
        operation: auditLogOperations.update,
        context,
        oldData: oldDespesaImovel,
        newData: updatedDespesaImovel,
        tx,
      });

      return updatedDespesaImovel;
    },
  );

  despesaImovel = await filePopulateDownloadUrlInTree(despesaImovel);

  return despesaImovel;
}
