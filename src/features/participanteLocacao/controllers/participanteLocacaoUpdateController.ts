import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  participanteLocacaoUpdateBodyInputSchema,
  participanteLocacaoUpdateParamsInputSchema,
} from '../participanteLocacaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const participanteLocacaoUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/participante-locacao/{id}',
  params: participanteLocacaoUpdateParamsInputSchema,
  body: participanteLocacaoUpdateBodyInputSchema,
  response: 'ParticipanteLocacao',
};

export const participanteLocacaoUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'participanteLocacao_update',
  description: dictionary.participanteLocacao.mcpDescription.update,
  requiredPermissions: { participanteLocacao: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: participanteLocacaoUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await participanteLocacaoUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function participanteLocacaoUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      participanteLocacao: ['update'],
    },
    context,
  );

  const { id } = participanteLocacaoUpdateParamsInputSchema.parse(params);

  const data = participanteLocacaoUpdateBodyInputSchema.parse(body);

  let participanteLocacao = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentParticipanteLocacao =
          await tx.participanteLocacao.findUnique({
            where: {
              id_organizationId: {
                id,
                organizationId: currentOrganization.id,
              },
            },
            select: { updatedAt: true },
          });

        if (currentParticipanteLocacao) {
          const currentUpdatedAt =
            currentParticipanteLocacao.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldParticipanteLocacao =
        await tx.participanteLocacao.findUniqueOrThrow({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
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

      await tx.participanteLocacao.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          papel: data.papel,
          percentualResponsabilidade: data.percentualResponsabilidade,
          aprovadoCadastro: data.aprovadoCadastro,
          dataAprovacao: data.dataAprovacao,
          observacoes: data.observacoes,
          locacao: prismaRelationship.connectOrDisconnectOne(data.locacao),
          cliente: prismaRelationship.connectOrDisconnectOne(data.cliente),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedParticipanteLocacao =
        await tx.participanteLocacao.findUniqueOrThrow({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
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
        entityId: id,
        entityName: 'ParticipanteLocacao',
        operation: auditLogOperations.update,
        context,
        oldData: oldParticipanteLocacao,
        newData: updatedParticipanteLocacao,
        tx,
      });

      return updatedParticipanteLocacao;
    },
  );

  participanteLocacao =
    await filePopulateDownloadUrlInTree(participanteLocacao);

  return participanteLocacao;
}
