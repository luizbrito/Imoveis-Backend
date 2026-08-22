import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { contaFinanceiraCreateInputSchema } from '../contaFinanceiraSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const contaFinanceiraCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/conta-financeira',
  body: contaFinanceiraCreateInputSchema,
  response: 'ContaFinanceira',
};

export const contaFinanceiraCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'contaFinanceira_create',
  description: dictionary.contaFinanceira.mcpDescription.create,
  requiredPermissions: { contaFinanceira: ['create'] },
  schema: toMcpJsonSchema(contaFinanceiraCreateInputSchema),
  handler: async (params, context) => {
    return await contaFinanceiraCreateController(params, context);
  },
});

export async function contaFinanceiraCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      contaFinanceira: ['create'],
    },
    context,
  );
  return await contaFinanceiraCreate(body, context);
}

export async function contaFinanceiraCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = contaFinanceiraCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const duplicatedNome = await tx.contaFinanceira.count({
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
            context.dictionary.contaFinanceira.fields.nome,
          ),
        );
      }

      const newContaFinanceira = await tx.contaFinanceira.create({
        data: {
          nome: data.nome,
          tipo: data.tipo,
          banco: data.banco,
          agencia: data.agencia,
          numeroConta: data.numeroConta,
          moeda: data.moeda,
          saldoInicial: data.saldoInicial,
          ativa: data.ativa,
          filial: prismaRelationship.connectOneOrThrow(data.filial),
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

      await auditLogCreate({
        entityId: newContaFinanceira.id,
        entityName: 'ContaFinanceira',
        operation: auditLogOperations.create,
        context,
        newData: newContaFinanceira,
        tx,
      });

      const contaFinanceira =
        await filePopulateDownloadUrlInTree(newContaFinanceira);

      return contaFinanceira;
    },
  );
}
