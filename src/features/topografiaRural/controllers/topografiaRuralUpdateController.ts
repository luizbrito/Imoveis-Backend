import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  topografiaRuralUpdateBodyInputSchema,
  topografiaRuralUpdateParamsInputSchema,
} from '../topografiaRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const topografiaRuralUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/topografia-rural/{id}',
  params: topografiaRuralUpdateParamsInputSchema,
  body: topografiaRuralUpdateBodyInputSchema,
  response: 'TopografiaRural',
};

export const topografiaRuralUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'topografiaRural_update',
  description: dictionary.topografiaRural.mcpDescription.update,
  requiredPermissions: { topografiaRural: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: topografiaRuralUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await topografiaRuralUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function topografiaRuralUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      topografiaRural: ['update'],
    },
    context,
  );

  const { id } = topografiaRuralUpdateParamsInputSchema.parse(params);

  const data = topografiaRuralUpdateBodyInputSchema.parse(body);

  let topografiaRural = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentTopografiaRural = await tx.topografiaRural.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentTopografiaRural) {
          const currentUpdatedAt =
            currentTopografiaRural.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldTopografiaRural = await tx.topografiaRural.findUniqueOrThrow({
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

      await tx.topografiaRural.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          descricao: data.descricao,
          tipoRelevo: data.tipoRelevo,
          altitudeMinimaM: data.altitudeMinimaM,
          altitudeMaximaM: data.altitudeMaximaM,
          altitudeMediaM: data.altitudeMediaM,
          declividadeMediaPercentual: data.declividadeMediaPercentual,
          declividadeMaximaPercentual: data.declividadeMaximaPercentual,
          areaPlanaPercentual: data.areaPlanaPercentual,
          areaOnduladaPercentual: data.areaOnduladaPercentual,
          riscoErosao: data.riscoErosao,
          mapaTopografico: data.mapaTopografico,
          arquivoDem: data.arquivoDem,
          observacoes: data.observacoes,
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedTopografiaRural = await tx.topografiaRural.findUniqueOrThrow(
        {
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
        },
      );

      await auditLogCreate({
        entityId: id,
        entityName: 'TopografiaRural',
        operation: auditLogOperations.update,
        context,
        oldData: oldTopografiaRural,
        newData: updatedTopografiaRural,
        tx,
      });

      return updatedTopografiaRural;
    },
  );

  topografiaRural = await filePopulateDownloadUrlInTree(topografiaRural);

  return topografiaRural;
}
