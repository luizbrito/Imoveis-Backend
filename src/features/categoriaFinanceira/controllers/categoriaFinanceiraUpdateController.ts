import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  categoriaFinanceiraUpdateBodyInputSchema,
  categoriaFinanceiraUpdateParamsInputSchema,
} from '../categoriaFinanceiraSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const categoriaFinanceiraUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/categoria-financeira/{id}',
  params: categoriaFinanceiraUpdateParamsInputSchema,
  body: categoriaFinanceiraUpdateBodyInputSchema,
  response: 'CategoriaFinanceira',
};

export const categoriaFinanceiraUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'categoriaFinanceira_update',
  description: dictionary.categoriaFinanceira.mcpDescription.update,
  requiredPermissions: { categoriaFinanceira: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: categoriaFinanceiraUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await categoriaFinanceiraUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function categoriaFinanceiraUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      categoriaFinanceira: ['update'],
    },
    context,
  );

  const { id } = categoriaFinanceiraUpdateParamsInputSchema.parse(params);

  const data = categoriaFinanceiraUpdateBodyInputSchema.parse(body);

  let categoriaFinanceira = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentCategoriaFinanceira =
          await tx.categoriaFinanceira.findUnique({
            where: {
              id_organizationId: {
                id,
                organizationId: currentOrganization.id,
              },
            },
            select: { updatedAt: true },
          });

        if (currentCategoriaFinanceira) {
          const currentUpdatedAt =
            currentCategoriaFinanceira.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }
      const duplicatedNome = await tx.categoriaFinanceira.count({
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
            context.dictionary.categoriaFinanceira.fields.nome,
          ),
        );
      }

      const oldCategoriaFinanceira =
        await tx.categoriaFinanceira.findUniqueOrThrow({
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

      await tx.categoriaFinanceira.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          nome: data.nome,
          tipo: data.tipo,
          grupo: data.grupo,
          codigoContabil: data.codigoContabil,
          ativa: data.ativa,
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedCategoriaFinanceira =
        await tx.categoriaFinanceira.findUniqueOrThrow({
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
        entityName: 'CategoriaFinanceira',
        operation: auditLogOperations.update,
        context,
        oldData: oldCategoriaFinanceira,
        newData: updatedCategoriaFinanceira,
        tx,
      });

      return updatedCategoriaFinanceira;
    },
  );

  categoriaFinanceira =
    await filePopulateDownloadUrlInTree(categoriaFinanceira);

  return categoriaFinanceira;
}
