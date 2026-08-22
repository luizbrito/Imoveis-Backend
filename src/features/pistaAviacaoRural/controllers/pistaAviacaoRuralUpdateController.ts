import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  pistaAviacaoRuralUpdateBodyInputSchema,
  pistaAviacaoRuralUpdateParamsInputSchema,
} from '../pistaAviacaoRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const pistaAviacaoRuralUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/pista-aviacao-rural/{id}',
  params: pistaAviacaoRuralUpdateParamsInputSchema,
  body: pistaAviacaoRuralUpdateBodyInputSchema,
  response: 'PistaAviacaoRural',
};

export const pistaAviacaoRuralUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'pistaAviacaoRural_update',
  description: dictionary.pistaAviacaoRural.mcpDescription.update,
  requiredPermissions: { pistaAviacaoRural: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: pistaAviacaoRuralUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await pistaAviacaoRuralUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function pistaAviacaoRuralUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      pistaAviacaoRural: ['update'],
    },
    context,
  );

  const { id } = pistaAviacaoRuralUpdateParamsInputSchema.parse(params);

  const data = pistaAviacaoRuralUpdateBodyInputSchema.parse(body);

  let pistaAviacaoRural = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentPistaAviacaoRural = await tx.pistaAviacaoRural.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentPistaAviacaoRural) {
          const currentUpdatedAt =
            currentPistaAviacaoRural.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldPistaAviacaoRural = await tx.pistaAviacaoRural.findUniqueOrThrow(
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

      await tx.pistaAviacaoRural.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          nome: data.nome,
          habilitada: data.habilitada,
          situacaoHabilitacao: data.situacaoHabilitacao,
          comprimentoM: data.comprimentoM,
          larguraM: data.larguraM,
          tipoPiso: data.tipoPiso,
          orientacao: data.orientacao,
          latitude: data.latitude,
          longitude: data.longitude,
          usoNoturno: data.usoNoturno,
          hangar: data.hangar,
          combustivelDisponivel: data.combustivelDisponivel,
          documentoHabilitacao: data.documentoHabilitacao,
          fotos: data.fotos,
          observacoes: data.observacoes,
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedPistaAviacaoRural =
        await tx.pistaAviacaoRural.findUniqueOrThrow({
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
        entityName: 'PistaAviacaoRural',
        operation: auditLogOperations.update,
        context,
        oldData: oldPistaAviacaoRural,
        newData: updatedPistaAviacaoRural,
        tx,
      });

      return updatedPistaAviacaoRural;
    },
  );

  pistaAviacaoRural = await filePopulateDownloadUrlInTree(pistaAviacaoRural);

  return pistaAviacaoRural;
}
