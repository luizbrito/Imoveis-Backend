import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  visitaUpdateBodyInputSchema,
  visitaUpdateParamsInputSchema,
} from '../visitaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const visitaUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/visita/{id}',
  params: visitaUpdateParamsInputSchema,
  body: visitaUpdateBodyInputSchema,
  response: 'Visita',
};

export const visitaUpdateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'visita_update',
  description: dictionary.visita.mcpDescription.update,
  requiredPermissions: { visita: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: visitaUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await visitaUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function visitaUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      visita: ['update'],
    },
    context,
  );

  const { id } = visitaUpdateParamsInputSchema.parse(params);

  const data = visitaUpdateBodyInputSchema.parse(body);

  let visita = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentVisita = await tx.visita.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentVisita) {
          const currentUpdatedAt = currentVisita.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }
      const duplicatedCodigo = await tx.visita.count({
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
            context.dictionary.visita.fields.codigo,
          ),
        );
      }

      const oldVisita = await tx.visita.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          propostas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          lead: {
            select: {
              id: true,
              nome: true,
            },
          },
          cliente: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          imovel: {
            select: {
              id: true,
              titulo: true,
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

      await tx.visita.update({
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
          tipo: data.tipo,
          pontoEncontro: data.pontoEncontro,
          feedbackCliente: data.feedbackCliente,
          interessePosVisita: data.interessePosVisita,
          observacoesInternas: data.observacoesInternas,
          lead: prismaRelationship.connectOrDisconnectOne(data.lead),
          cliente: prismaRelationship.connectOrDisconnectOne(data.cliente),
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          corretor: prismaRelationship.connectOrDisconnectOne(data.corretor),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedVisita = await tx.visita.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          propostas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          lead: {
            select: {
              id: true,
              nome: true,
            },
          },
          cliente: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          imovel: {
            select: {
              id: true,
              titulo: true,
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
        entityName: 'Visita',
        operation: auditLogOperations.update,
        context,
        oldData: oldVisita,
        newData: updatedVisita,
        tx,
      });

      return updatedVisita;
    },
  );

  visita = await filePopulateDownloadUrlInTree(visita);

  return visita;
}
