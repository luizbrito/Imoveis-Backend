import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { contratoLocacaoCreateInputSchema } from '../contratoLocacaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const contratoLocacaoCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/contrato-locacao',
  body: contratoLocacaoCreateInputSchema,
  response: 'ContratoLocacao',
};

export const contratoLocacaoCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'contratoLocacao_create',
  description: dictionary.contratoLocacao.mcpDescription.create,
  requiredPermissions: { contratoLocacao: ['create'] },
  schema: toMcpJsonSchema(contratoLocacaoCreateInputSchema),
  handler: async (params, context) => {
    return await contratoLocacaoCreateController(params, context);
  },
});

export async function contratoLocacaoCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      contratoLocacao: ['create'],
    },
    context,
  );
  return await contratoLocacaoCreate(body, context);
}

export async function contratoLocacaoCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = contratoLocacaoCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const duplicatedNumero = await tx.contratoLocacao.count({
        where: {
          numero: {
            equals: data.numero,
            mode: 'insensitive',
          },
          organizationId: currentOrganization.id,
        },
      });

      if (duplicatedNumero) {
        throw new Error400(
          dictionaryFormat(
            context.dictionary.shared.errors.unique,
            context.dictionary.contratoLocacao.fields.numero,
          ),
        );
      }

      const newContratoLocacao = await tx.contratoLocacao.create({
        data: {
          numero: data.numero,
          tipo: data.tipo,
          status: data.status,
          dataEmissao: data.dataEmissao,
          dataAssinatura: data.dataAssinatura,
          arquivos: data.arquivos,
          assinaturaEletronicaId: data.assinaturaEletronicaId,
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
        entityId: newContratoLocacao.id,
        entityName: 'ContratoLocacao',
        operation: auditLogOperations.create,
        context,
        newData: newContratoLocacao,
        tx,
      });

      const contratoLocacao =
        await filePopulateDownloadUrlInTree(newContratoLocacao);

      return contratoLocacao;
    },
  );
}
