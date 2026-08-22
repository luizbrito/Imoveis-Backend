import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { categoriaFinanceiraCreateInputSchema } from '../categoriaFinanceiraSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const categoriaFinanceiraCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/categoria-financeira',
  body: categoriaFinanceiraCreateInputSchema,
  response: 'CategoriaFinanceira',
};

export const categoriaFinanceiraCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'categoriaFinanceira_create',
  description: dictionary.categoriaFinanceira.mcpDescription.create,
  requiredPermissions: { categoriaFinanceira: ['create'] },
  schema: toMcpJsonSchema(categoriaFinanceiraCreateInputSchema),
  handler: async (params, context) => {
    return await categoriaFinanceiraCreateController(params, context);
  },
});

export async function categoriaFinanceiraCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      categoriaFinanceira: ['create'],
    },
    context,
  );
  return await categoriaFinanceiraCreate(body, context);
}

export async function categoriaFinanceiraCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = categoriaFinanceiraCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const duplicatedNome = await tx.categoriaFinanceira.count({
        where: {
          nome: {
            equals: data.nome,
            mode: 'insensitive',
          },
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

      const newCategoriaFinanceira = await tx.categoriaFinanceira.create({
        data: {
          nome: data.nome,
          tipo: data.tipo,
          grupo: data.grupo,
          codigoContabil: data.codigoContabil,
          ativa: data.ativa,
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
        entityId: newCategoriaFinanceira.id,
        entityName: 'CategoriaFinanceira',
        operation: auditLogOperations.create,
        context,
        newData: newCategoriaFinanceira,
        tx,
      });

      const categoriaFinanceira = await filePopulateDownloadUrlInTree(
        newCategoriaFinanceira,
      );

      return categoriaFinanceira;
    },
  );
}
