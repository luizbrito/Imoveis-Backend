import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  consentimentoLGPDUpdateBodyInputSchema,
  consentimentoLGPDUpdateParamsInputSchema,
} from '../consentimentoLGPDSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const consentimentoLGPDUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/consentimento-l-g-p-d/{id}',
  params: consentimentoLGPDUpdateParamsInputSchema,
  body: consentimentoLGPDUpdateBodyInputSchema,
  response: 'ConsentimentoLGPD',
};

export const consentimentoLGPDUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'consentimentoLGPD_update',
  description: dictionary.consentimentoLGPD.mcpDescription.update,
  requiredPermissions: { consentimentoLGPD: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: consentimentoLGPDUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await consentimentoLGPDUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function consentimentoLGPDUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      consentimentoLGPD: ['update'],
    },
    context,
  );

  const { id } = consentimentoLGPDUpdateParamsInputSchema.parse(params);

  const data = consentimentoLGPDUpdateBodyInputSchema.parse(body);

  let consentimentoLGPD = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentConsentimentoLGPD = await tx.consentimentoLGPD.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentConsentimentoLGPD) {
          const currentUpdatedAt =
            currentConsentimentoLGPD.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldConsentimentoLGPD = await tx.consentimentoLGPD.findUniqueOrThrow(
        {
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          include: {
            cliente: {
              select: {
                id: true,
                nomeRazaoSocial: true,
              },
            },
            proprietario: {
              select: {
                id: true,
                nomeRazaoSocial: true,
              },
            },
            lead: {
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
        },
      );

      await tx.consentimentoLGPD.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          tipo: data.tipo,
          versaoTermo: data.versaoTermo,
          dataConsentimento: data.dataConsentimento,
          status: data.status,
          dataRevogacao: data.dataRevogacao,
          ipOrigem: data.ipOrigem,
          canal: data.canal,
          comprovante: data.comprovante,
          observacoes: data.observacoes,
          cliente: prismaRelationship.connectOrDisconnectOne(data.cliente),
          proprietario: prismaRelationship.connectOrDisconnectOne(
            data.proprietario,
          ),
          lead: prismaRelationship.connectOrDisconnectOne(data.lead),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedConsentimentoLGPD =
        await tx.consentimentoLGPD.findUniqueOrThrow({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          include: {
            cliente: {
              select: {
                id: true,
                nomeRazaoSocial: true,
              },
            },
            proprietario: {
              select: {
                id: true,
                nomeRazaoSocial: true,
              },
            },
            lead: {
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
        entityId: id,
        entityName: 'ConsentimentoLGPD',
        operation: auditLogOperations.update,
        context,
        oldData: oldConsentimentoLGPD,
        newData: updatedConsentimentoLGPD,
        tx,
      });

      return updatedConsentimentoLGPD;
    },
  );

  consentimentoLGPD = await filePopulateDownloadUrlInTree(consentimentoLGPD);

  return consentimentoLGPD;
}
