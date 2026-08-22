import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  interacaoLeadUpdateBodyInputSchema,
  interacaoLeadUpdateParamsInputSchema,
} from '../interacaoLeadSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const interacaoLeadUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/interacao-lead/{id}',
  params: interacaoLeadUpdateParamsInputSchema,
  body: interacaoLeadUpdateBodyInputSchema,
  response: 'InteracaoLead',
};

export const interacaoLeadUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'interacaoLead_update',
  description: dictionary.interacaoLead.mcpDescription.update,
  requiredPermissions: { interacaoLead: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: interacaoLeadUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await interacaoLeadUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function interacaoLeadUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      interacaoLead: ['update'],
    },
    context,
  );

  const { id } = interacaoLeadUpdateParamsInputSchema.parse(params);

  const data = interacaoLeadUpdateBodyInputSchema.parse(body);

  let interacaoLead = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentInteracaoLead = await tx.interacaoLead.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentInteracaoLead) {
          const currentUpdatedAt = currentInteracaoLead.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldInteracaoLead = await tx.interacaoLead.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          lead: {
            select: {
              id: true,
              nome: true,
            },
          },
          corretor: {
            select: {
              id: true,
              nomeCompleto: true,
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

      await tx.interacaoLead.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          dataHora: data.dataHora,
          tipo: data.tipo,
          resultado: data.resultado,
          assunto: data.assunto,
          descricao: data.descricao,
          proximaAcao: data.proximaAcao,
          dataProximaAcao: data.dataProximaAcao,
          lead: prismaRelationship.connectOrDisconnectOne(data.lead),
          corretor: prismaRelationship.connectOrDisconnectOne(data.corretor),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedInteracaoLead = await tx.interacaoLead.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          lead: {
            select: {
              id: true,
              nome: true,
            },
          },
          corretor: {
            select: {
              id: true,
              nomeCompleto: true,
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
        entityName: 'InteracaoLead',
        operation: auditLogOperations.update,
        context,
        oldData: oldInteracaoLead,
        newData: updatedInteracaoLead,
        tx,
      });

      return updatedInteracaoLead;
    },
  );

  interacaoLead = await filePopulateDownloadUrlInTree(interacaoLead);

  return interacaoLead;
}
