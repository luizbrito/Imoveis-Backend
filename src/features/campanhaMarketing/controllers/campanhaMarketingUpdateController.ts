import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  campanhaMarketingUpdateBodyInputSchema,
  campanhaMarketingUpdateParamsInputSchema,
} from '../campanhaMarketingSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const campanhaMarketingUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/campanha-marketing/{id}',
  params: campanhaMarketingUpdateParamsInputSchema,
  body: campanhaMarketingUpdateBodyInputSchema,
  response: 'CampanhaMarketing',
};

export const campanhaMarketingUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'campanhaMarketing_update',
  description: dictionary.campanhaMarketing.mcpDescription.update,
  requiredPermissions: { campanhaMarketing: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: campanhaMarketingUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await campanhaMarketingUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function campanhaMarketingUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      campanhaMarketing: ['update'],
    },
    context,
  );

  const { id } = campanhaMarketingUpdateParamsInputSchema.parse(params);

  const data = campanhaMarketingUpdateBodyInputSchema.parse(body);

  let campanhaMarketing = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentCampanhaMarketing = await tx.campanhaMarketing.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentCampanhaMarketing) {
          const currentUpdatedAt =
            currentCampanhaMarketing.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldCampanhaMarketing = await tx.campanhaMarketing.findUniqueOrThrow(
        {
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          include: {
            anunciosVinculados: {
              select: {
                id: true,
                dataInclusao: true,
              },
            },
            leadsGerados: {
              select: {
                id: true,
                nome: true,
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
        },
      );

      await tx.campanhaMarketing.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          nome: data.nome,
          tipo: data.tipo,
          status: data.status,
          dataInicio: data.dataInicio,
          dataFim: data.dataFim,
          orcamento: data.orcamento,
          custoReal: data.custoReal,
          quantidadeLeads: data.quantidadeLeads,
          quantidadeConversoes: data.quantidadeConversoes,
          observacoes: data.observacoes,
          filial: prismaRelationship.connectOrDisconnectOne(data.filial),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedCampanhaMarketing =
        await tx.campanhaMarketing.findUniqueOrThrow({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          include: {
            anunciosVinculados: {
              select: {
                id: true,
                dataInclusao: true,
              },
            },
            leadsGerados: {
              select: {
                id: true,
                nome: true,
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
        entityId: id,
        entityName: 'CampanhaMarketing',
        operation: auditLogOperations.update,
        context,
        oldData: oldCampanhaMarketing,
        newData: updatedCampanhaMarketing,
        tx,
      });

      return updatedCampanhaMarketing;
    },
  );

  campanhaMarketing = await filePopulateDownloadUrlInTree(campanhaMarketing);

  return campanhaMarketing;
}
