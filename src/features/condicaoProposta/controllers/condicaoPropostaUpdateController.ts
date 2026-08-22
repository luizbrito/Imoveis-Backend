import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  condicaoPropostaUpdateBodyInputSchema,
  condicaoPropostaUpdateParamsInputSchema,
} from '../condicaoPropostaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const condicaoPropostaUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/condicao-proposta/{id}',
  params: condicaoPropostaUpdateParamsInputSchema,
  body: condicaoPropostaUpdateBodyInputSchema,
  response: 'CondicaoProposta',
};

export const condicaoPropostaUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'condicaoProposta_update',
  description: dictionary.condicaoProposta.mcpDescription.update,
  requiredPermissions: { condicaoProposta: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: condicaoPropostaUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await condicaoPropostaUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function condicaoPropostaUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      condicaoProposta: ['update'],
    },
    context,
  );

  const { id } = condicaoPropostaUpdateParamsInputSchema.parse(params);

  const data = condicaoPropostaUpdateBodyInputSchema.parse(body);

  let condicaoProposta = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentCondicaoProposta = await tx.condicaoProposta.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentCondicaoProposta) {
          const currentUpdatedAt =
            currentCondicaoProposta.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldCondicaoProposta = await tx.condicaoProposta.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          proposta: {
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

      await tx.condicaoProposta.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          ordem: data.ordem,
          tipo: data.tipo,
          descricao: data.descricao,
          obrigatoria: data.obrigatoria,
          atendida: data.atendida,
          proposta: prismaRelationship.connectOrDisconnectOne(data.proposta),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedCondicaoProposta =
        await tx.condicaoProposta.findUniqueOrThrow({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          include: {
            proposta: {
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
        entityName: 'CondicaoProposta',
        operation: auditLogOperations.update,
        context,
        oldData: oldCondicaoProposta,
        newData: updatedCondicaoProposta,
        tx,
      });

      return updatedCondicaoProposta;
    },
  );

  condicaoProposta = await filePopulateDownloadUrlInTree(condicaoProposta);

  return condicaoProposta;
}
