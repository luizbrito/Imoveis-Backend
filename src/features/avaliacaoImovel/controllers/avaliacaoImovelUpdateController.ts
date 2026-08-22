import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  avaliacaoImovelUpdateBodyInputSchema,
  avaliacaoImovelUpdateParamsInputSchema,
} from '../avaliacaoImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const avaliacaoImovelUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/avaliacao-imovel/{id}',
  params: avaliacaoImovelUpdateParamsInputSchema,
  body: avaliacaoImovelUpdateBodyInputSchema,
  response: 'AvaliacaoImovel',
};

export const avaliacaoImovelUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'avaliacaoImovel_update',
  description: dictionary.avaliacaoImovel.mcpDescription.update,
  requiredPermissions: { avaliacaoImovel: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: avaliacaoImovelUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await avaliacaoImovelUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function avaliacaoImovelUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      avaliacaoImovel: ['update'],
    },
    context,
  );

  const { id } = avaliacaoImovelUpdateParamsInputSchema.parse(params);

  const data = avaliacaoImovelUpdateBodyInputSchema.parse(body);

  let avaliacaoImovel = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentAvaliacaoImovel = await tx.avaliacaoImovel.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentAvaliacaoImovel) {
          const currentUpdatedAt =
            currentAvaliacaoImovel.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }
      const duplicatedCodigo = await tx.avaliacaoImovel.count({
        where: {
          codigo: {
            equals: data.codigo,
            mode: 'insensitive',
          },
          id: { not: id },
          organizationId: currentOrganization.id,
        },
      });

      if (duplicatedCodigo) {
        throw new Error400(
          dictionaryFormat(
            context.dictionary.shared.errors.unique,
            context.dictionary.avaliacaoImovel.fields.codigo,
          ),
        );
      }

      const oldAvaliacaoImovel = await tx.avaliacaoImovel.findUniqueOrThrow({
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
          avaliador: {
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

      await tx.avaliacaoImovel.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          codigo: data.codigo,
          dataAvaliacao: data.dataAvaliacao,
          metodo: data.metodo,
          valorMercado: data.valorMercado,
          valorVendaRapida: data.valorVendaRapida,
          valorLocacaoEstimado: data.valorLocacaoEstimado,
          moeda: data.moeda,
          validadeAte: data.validadeAte,
          laudo: data.laudo,
          criterios: data.criterios,
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          avaliador: prismaRelationship.connectOrDisconnectOne(data.avaliador),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedAvaliacaoImovel = await tx.avaliacaoImovel.findUniqueOrThrow(
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
            avaliador: {
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
        },
      );

      await auditLogCreate({
        entityId: id,
        entityName: 'AvaliacaoImovel',
        operation: auditLogOperations.update,
        context,
        oldData: oldAvaliacaoImovel,
        newData: updatedAvaliacaoImovel,
        tx,
      });

      return updatedAvaliacaoImovel;
    },
  );

  avaliacaoImovel = await filePopulateDownloadUrlInTree(avaliacaoImovel);

  return avaliacaoImovel;
}
