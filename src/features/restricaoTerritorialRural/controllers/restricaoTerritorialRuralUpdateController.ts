import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  restricaoTerritorialRuralUpdateBodyInputSchema,
  restricaoTerritorialRuralUpdateParamsInputSchema,
} from '../restricaoTerritorialRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const restricaoTerritorialRuralUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/restricao-territorial-rural/{id}',
  params: restricaoTerritorialRuralUpdateParamsInputSchema,
  body: restricaoTerritorialRuralUpdateBodyInputSchema,
  response: 'RestricaoTerritorialRural',
};

export const restricaoTerritorialRuralUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'restricaoTerritorialRural_update',
  description: dictionary.restricaoTerritorialRural.mcpDescription.update,
  requiredPermissions: { restricaoTerritorialRural: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: restricaoTerritorialRuralUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await restricaoTerritorialRuralUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function restricaoTerritorialRuralUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      restricaoTerritorialRural: ['update'],
    },
    context,
  );

  const { id } = restricaoTerritorialRuralUpdateParamsInputSchema.parse(params);

  const data = restricaoTerritorialRuralUpdateBodyInputSchema.parse(body);

  let restricaoTerritorialRural = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentRestricaoTerritorialRural =
          await tx.restricaoTerritorialRural.findUnique({
            where: {
              id_organizationId: {
                id,
                organizationId: currentOrganization.id,
              },
            },
            select: { updatedAt: true },
          });

        if (currentRestricaoTerritorialRural) {
          const currentUpdatedAt =
            currentRestricaoTerritorialRural.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldRestricaoTerritorialRural =
        await tx.restricaoTerritorialRural.findUniqueOrThrow({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          include: {
            imovel: {
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

      await tx.restricaoTerritorialRural.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          tipo: data.tipo,
          descricao: data.descricao,
          areaAfetadaHa: data.areaAfetadaHa,
          extensaoKm: data.extensaoKm,
          impacto: data.impacto,
          regularizada: data.regularizada,
          documentos: data.documentos,
          kml: data.kml,
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedRestricaoTerritorialRural =
        await tx.restricaoTerritorialRural.findUniqueOrThrow({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          include: {
            imovel: {
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

      await auditLogCreate({
        entityId: id,
        entityName: 'RestricaoTerritorialRural',
        operation: auditLogOperations.update,
        context,
        oldData: oldRestricaoTerritorialRural,
        newData: updatedRestricaoTerritorialRural,
        tx,
      });

      return updatedRestricaoTerritorialRural;
    },
  );

  restricaoTerritorialRural = await filePopulateDownloadUrlInTree(
    restricaoTerritorialRural,
  );

  return restricaoTerritorialRural;
}
