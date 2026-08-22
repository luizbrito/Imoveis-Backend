import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  contaFinanceiraUpdateBodyInputSchema,
  contaFinanceiraUpdateParamsInputSchema,
} from '../contaFinanceiraSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const contaFinanceiraUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/conta-financeira/{id}',
  params: contaFinanceiraUpdateParamsInputSchema,
  body: contaFinanceiraUpdateBodyInputSchema,
  response: 'ContaFinanceira',
};

export const contaFinanceiraUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'contaFinanceira_update',
  description: dictionary.contaFinanceira.mcpDescription.update,
  requiredPermissions: { contaFinanceira: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: contaFinanceiraUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await contaFinanceiraUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function contaFinanceiraUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      contaFinanceira: ['update'],
    },
    context,
  );

  const { id } = contaFinanceiraUpdateParamsInputSchema.parse(params);

  const data = contaFinanceiraUpdateBodyInputSchema.parse(body);

  let contaFinanceira = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentContaFinanceira = await tx.contaFinanceira.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentContaFinanceira) {
          const currentUpdatedAt =
            currentContaFinanceira.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }
      const duplicatedNome = await tx.contaFinanceira.count({
        where: {
          nome: {
            equals: data.nome,
            mode: 'insensitive',
          },
          id: { not: id },
          organizationId: currentOrganization.id,
        },
      });

      if (duplicatedNome) {
        throw new Error400(
          dictionaryFormat(
            context.dictionary.shared.errors.unique,
            context.dictionary.contaFinanceira.fields.nome,
          ),
        );
      }

      const oldContaFinanceira = await tx.contaFinanceira.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          lancamentos: {
            select: {
              id: true,
              descricao: true,
            },
          },
          filial: {
            select: {
              id: true,
              nome: true,
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

      await tx.contaFinanceira.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          nome: data.nome,
          tipo: data.tipo,
          banco: data.banco,
          agencia: data.agencia,
          numeroConta: data.numeroConta,
          moeda: data.moeda,
          saldoInicial: data.saldoInicial,
          ativa: data.ativa,
          filial: prismaRelationship.connectOrDisconnectOne(data.filial),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedContaFinanceira = await tx.contaFinanceira.findUniqueOrThrow(
        {
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          include: {
            lancamentos: {
              select: {
                id: true,
                descricao: true,
              },
            },
            filial: {
              select: {
                id: true,
                nome: true,
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
        entityName: 'ContaFinanceira',
        operation: auditLogOperations.update,
        context,
        oldData: oldContaFinanceira,
        newData: updatedContaFinanceira,
        tx,
      });

      return updatedContaFinanceira;
    },
  );

  contaFinanceira = await filePopulateDownloadUrlInTree(contaFinanceira);

  return contaFinanceira;
}
