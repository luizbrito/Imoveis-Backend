import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  campanhaAnuncioUpdateBodyInputSchema,
  campanhaAnuncioUpdateParamsInputSchema,
} from '../campanhaAnuncioSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const campanhaAnuncioUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/campanha-anuncio/{id}',
  params: campanhaAnuncioUpdateParamsInputSchema,
  body: campanhaAnuncioUpdateBodyInputSchema,
  response: 'CampanhaAnuncio',
};

export const campanhaAnuncioUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'campanhaAnuncio_update',
  description: dictionary.campanhaAnuncio.mcpDescription.update,
  requiredPermissions: { campanhaAnuncio: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: campanhaAnuncioUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await campanhaAnuncioUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function campanhaAnuncioUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      campanhaAnuncio: ['update'],
    },
    context,
  );

  const { id } = campanhaAnuncioUpdateParamsInputSchema.parse(params);

  const data = campanhaAnuncioUpdateBodyInputSchema.parse(body);

  let campanhaAnuncio = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentCampanhaAnuncio = await tx.campanhaAnuncio.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentCampanhaAnuncio) {
          const currentUpdatedAt =
            currentCampanhaAnuncio.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldCampanhaAnuncio = await tx.campanhaAnuncio.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          campanha: {
            select: {
              id: true,
              nome: true,
            },
          },
          anuncio: {
            select: {
              id: true,
              titulo: true,
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

      await tx.campanhaAnuncio.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          dataInclusao: data.dataInclusao,
          investimentoAlocado: data.investimentoAlocado,
          impressoes: data.impressoes,
          cliques: data.cliques,
          leadsGerados: data.leadsGerados,
          campanha: prismaRelationship.connectOrDisconnectOne(data.campanha),
          anuncio: prismaRelationship.connectOrDisconnectOne(data.anuncio),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedCampanhaAnuncio = await tx.campanhaAnuncio.findUniqueOrThrow(
        {
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          include: {
            campanha: {
              select: {
                id: true,
                nome: true,
              },
            },
            anuncio: {
              select: {
                id: true,
                titulo: true,
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

      await auditLogCreate({
        entityId: id,
        entityName: 'CampanhaAnuncio',
        operation: auditLogOperations.update,
        context,
        oldData: oldCampanhaAnuncio,
        newData: updatedCampanhaAnuncio,
        tx,
      });

      return updatedCampanhaAnuncio;
    },
  );

  campanhaAnuncio = await filePopulateDownloadUrlInTree(campanhaAnuncio);

  return campanhaAnuncio;
}
