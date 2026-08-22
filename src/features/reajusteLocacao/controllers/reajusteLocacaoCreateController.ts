import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { reajusteLocacaoCreateInputSchema } from '../reajusteLocacaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const reajusteLocacaoCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/reajuste-locacao',
  body: reajusteLocacaoCreateInputSchema,
  response: 'ReajusteLocacao',
};

export const reajusteLocacaoCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'reajusteLocacao_create',
  description: dictionary.reajusteLocacao.mcpDescription.create,
  requiredPermissions: { reajusteLocacao: ['create'] },
  schema: toMcpJsonSchema(reajusteLocacaoCreateInputSchema),
  handler: async (params, context) => {
    return await reajusteLocacaoCreateController(params, context);
  },
});

export async function reajusteLocacaoCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      reajusteLocacao: ['create'],
    },
    context,
  );
  return await reajusteLocacaoCreate(body, context);
}

export async function reajusteLocacaoCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = reajusteLocacaoCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newReajusteLocacao = await tx.reajusteLocacao.create({
        data: {
          dataBase: data.dataBase,
          indice: data.indice,
          percentual: data.percentual,
          valorAnterior: data.valorAnterior,
          valorNovo: data.valorNovo,
          status: data.status,
          documentos: data.documentos,
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
        entityId: newReajusteLocacao.id,
        entityName: 'ReajusteLocacao',
        operation: auditLogOperations.create,
        context,
        newData: newReajusteLocacao,
        tx,
      });

      const reajusteLocacao =
        await filePopulateDownloadUrlInTree(newReajusteLocacao);

      return reajusteLocacao;
    },
  );
}
