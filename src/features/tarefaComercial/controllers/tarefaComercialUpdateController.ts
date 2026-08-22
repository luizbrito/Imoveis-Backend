import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  tarefaComercialUpdateBodyInputSchema,
  tarefaComercialUpdateParamsInputSchema,
} from '../tarefaComercialSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const tarefaComercialUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/tarefa-comercial/{id}',
  params: tarefaComercialUpdateParamsInputSchema,
  body: tarefaComercialUpdateBodyInputSchema,
  response: 'TarefaComercial',
};

export const tarefaComercialUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'tarefaComercial_update',
  description: dictionary.tarefaComercial.mcpDescription.update,
  requiredPermissions: { tarefaComercial: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: tarefaComercialUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await tarefaComercialUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function tarefaComercialUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      tarefaComercial: ['update'],
    },
    context,
  );

  const { id } = tarefaComercialUpdateParamsInputSchema.parse(params);

  const data = tarefaComercialUpdateBodyInputSchema.parse(body);

  let tarefaComercial = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentTarefaComercial = await tx.tarefaComercial.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentTarefaComercial) {
          const currentUpdatedAt =
            currentTarefaComercial.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldTarefaComercial = await tx.tarefaComercial.findUniqueOrThrow({
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
          cliente: {
            select: {
              id: true,
              nomeRazaoSocial: true,
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

      await tx.tarefaComercial.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          titulo: data.titulo,
          tipo: data.tipo,
          prioridade: data.prioridade,
          status: data.status,
          dataLimite: data.dataLimite,
          dataConclusao: data.dataConclusao,
          descricao: data.descricao,
          lead: prismaRelationship.connectOrDisconnectOne(data.lead),
          corretor: prismaRelationship.connectOrDisconnectOne(data.corretor),
          cliente: prismaRelationship.connectOrDisconnectOne(data.cliente),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedTarefaComercial = await tx.tarefaComercial.findUniqueOrThrow(
        {
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
            cliente: {
              select: {
                id: true,
                nomeRazaoSocial: true,
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
        entityName: 'TarefaComercial',
        operation: auditLogOperations.update,
        context,
        oldData: oldTarefaComercial,
        newData: updatedTarefaComercial,
        tx,
      });

      return updatedTarefaComercial;
    },
  );

  tarefaComercial = await filePopulateDownloadUrlInTree(tarefaComercial);

  return tarefaComercial;
}
