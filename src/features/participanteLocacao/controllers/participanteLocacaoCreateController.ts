import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { participanteLocacaoCreateInputSchema } from '../participanteLocacaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const participanteLocacaoCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/participante-locacao',
  body: participanteLocacaoCreateInputSchema,
  response: 'ParticipanteLocacao',
};

export const participanteLocacaoCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'participanteLocacao_create',
  description: dictionary.participanteLocacao.mcpDescription.create,
  requiredPermissions: { participanteLocacao: ['create'] },
  schema: toMcpJsonSchema(participanteLocacaoCreateInputSchema),
  handler: async (params, context) => {
    return await participanteLocacaoCreateController(params, context);
  },
});

export async function participanteLocacaoCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      participanteLocacao: ['create'],
    },
    context,
  );
  return await participanteLocacaoCreate(body, context);
}

export async function participanteLocacaoCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = participanteLocacaoCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newParticipanteLocacao = await tx.participanteLocacao.create({
        data: {
          papel: data.papel,
          percentualResponsabilidade: data.percentualResponsabilidade,
          aprovadoCadastro: data.aprovadoCadastro,
          dataAprovacao: data.dataAprovacao,
          observacoes: data.observacoes,
          locacao: prismaRelationship.connectOneOrThrow(data.locacao),
          cliente: prismaRelationship.connectOneOrThrow(data.cliente),
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
          cliente: {
            select: {
              id: true,
              nomeRazaoSocial: true,
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
        entityId: newParticipanteLocacao.id,
        entityName: 'ParticipanteLocacao',
        operation: auditLogOperations.create,
        context,
        newData: newParticipanteLocacao,
        tx,
      });

      const participanteLocacao = await filePopulateDownloadUrlInTree(
        newParticipanteLocacao,
      );

      return participanteLocacao;
    },
  );
}
