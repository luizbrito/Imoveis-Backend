import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  reservaImovelUpdateBodyInputSchema,
  reservaImovelUpdateParamsInputSchema,
} from '../reservaImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const reservaImovelUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/reserva-imovel/{id}',
  params: reservaImovelUpdateParamsInputSchema,
  body: reservaImovelUpdateBodyInputSchema,
  response: 'ReservaImovel',
};

export const reservaImovelUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'reservaImovel_update',
  description: dictionary.reservaImovel.mcpDescription.update,
  requiredPermissions: { reservaImovel: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: reservaImovelUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await reservaImovelUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function reservaImovelUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      reservaImovel: ['update'],
    },
    context,
  );

  const { id } = reservaImovelUpdateParamsInputSchema.parse(params);

  const data = reservaImovelUpdateBodyInputSchema.parse(body);

  let reservaImovel = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentReservaImovel = await tx.reservaImovel.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentReservaImovel) {
          const currentUpdatedAt = currentReservaImovel.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }
      const duplicatedCodigo = await tx.reservaImovel.count({
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
            context.dictionary.reservaImovel.fields.codigo,
          ),
        );
      }

      const oldReservaImovel = await tx.reservaImovel.findUniqueOrThrow({
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
          imovel: {
            select: {
              id: true,
              titulo: true,
            },
          },
          cliente: {
            select: {
              id: true,
              nomeRazaoSocial: true,
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

      await tx.reservaImovel.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          codigo: data.codigo,
          dataInicio: data.dataInicio,
          dataFim: data.dataFim,
          status: data.status,
          valorSinal: data.valorSinal,
          formaPagamentoSinal: data.formaPagamentoSinal,
          comprovante: data.comprovante,
          observacoes: data.observacoes,
          proposta: prismaRelationship.connectOrDisconnectOne(data.proposta),
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          cliente: prismaRelationship.connectOrDisconnectOne(data.cliente),
          corretor: prismaRelationship.connectOrDisconnectOne(data.corretor),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedReservaImovel = await tx.reservaImovel.findUniqueOrThrow({
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
          imovel: {
            select: {
              id: true,
              titulo: true,
            },
          },
          cliente: {
            select: {
              id: true,
              nomeRazaoSocial: true,
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
        entityName: 'ReservaImovel',
        operation: auditLogOperations.update,
        context,
        oldData: oldReservaImovel,
        newData: updatedReservaImovel,
        tx,
      });

      return updatedReservaImovel;
    },
  );

  reservaImovel = await filePopulateDownloadUrlInTree(reservaImovel);

  return reservaImovel;
}
