import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { contratoAdministracaoCreateInputSchema } from '../contratoAdministracaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const contratoAdministracaoCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/contrato-administracao',
  body: contratoAdministracaoCreateInputSchema,
  response: 'ContratoAdministracao',
};

export const contratoAdministracaoCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'contratoAdministracao_create',
  description: dictionary.contratoAdministracao.mcpDescription.create,
  requiredPermissions: { contratoAdministracao: ['create'] },
  schema: toMcpJsonSchema(contratoAdministracaoCreateInputSchema),
  handler: async (params, context) => {
    return await contratoAdministracaoCreateController(params, context);
  },
});

export async function contratoAdministracaoCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      contratoAdministracao: ['create'],
    },
    context,
  );
  return await contratoAdministracaoCreate(body, context);
}

export async function contratoAdministracaoCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = contratoAdministracaoCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const duplicatedNumero = await tx.contratoAdministracao.count({
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
            context.dictionary.contratoAdministracao.fields.numero,
          ),
        );
      }

      const newContratoAdministracao = await tx.contratoAdministracao.create({
        data: {
          numero: data.numero,
          status: data.status,
          dataInicio: data.dataInicio,
          dataFim: data.dataFim,
          taxaAdministracaoPercentual: data.taxaAdministracaoPercentual,
          taxaIntermediacaoPercentual: data.taxaIntermediacaoPercentual,
          prazoRepasseDias: data.prazoRepasseDias,
          autorizaManutencaoAte: data.autorizaManutencaoAte,
          arquivos: data.arquivos,
          observacoes: data.observacoes,
          imovel: prismaRelationship.connectOneOrThrow(data.imovel),
          proprietario: prismaRelationship.connectOneOrThrow(data.proprietario),
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
          imovel: {
            select: {
              id: true,
              titulo: true,
            },
          },
          proprietario: {
            select: {
              id: true,
              nomeRazaoSocial: true,
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
        entityId: newContratoAdministracao.id,
        entityName: 'ContratoAdministracao',
        operation: auditLogOperations.create,
        context,
        newData: newContratoAdministracao,
        tx,
      });

      const contratoAdministracao = await filePopulateDownloadUrlInTree(
        newContratoAdministracao,
      );

      return contratoAdministracao;
    },
  );
}
