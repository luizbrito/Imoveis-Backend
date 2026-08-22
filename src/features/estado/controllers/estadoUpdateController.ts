import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  estadoUpdateBodyInputSchema,
  estadoUpdateParamsInputSchema,
} from '../estadoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const estadoUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/estado/{id}',
  params: estadoUpdateParamsInputSchema,
  body: estadoUpdateBodyInputSchema,
  response: 'Estado',
};

export const estadoUpdateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'estado_update',
  description: dictionary.estado.mcpDescription.update,
  requiredPermissions: { estado: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: estadoUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await estadoUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function estadoUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      estado: ['update'],
    },
    context,
  );

  const { id } = estadoUpdateParamsInputSchema.parse(params);

  const data = estadoUpdateBodyInputSchema.parse(body);

  let estado = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentEstado = await tx.estado.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentEstado) {
          const currentUpdatedAt = currentEstado.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldEstado = await tx.estado.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          cidades: {
            select: {
              id: true,
              nome: true,
            },
          },
          imoveisEstado: {
            select: {
              id: true,
              titulo: true,
            },
          },
          pais: {
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

      await tx.estado.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          nome: data.nome,
          sigla: data.sigla,
          codigoOficial: data.codigoOficial,
          tipoDivisao: data.tipoDivisao,
          ativo: data.ativo,
          observacoes: data.observacoes,
          pais: prismaRelationship.connectOrDisconnectOne(data.pais),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedEstado = await tx.estado.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          cidades: {
            select: {
              id: true,
              nome: true,
            },
          },
          imoveisEstado: {
            select: {
              id: true,
              titulo: true,
            },
          },
          pais: {
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
        entityName: 'Estado',
        operation: auditLogOperations.update,
        context,
        oldData: oldEstado,
        newData: updatedEstado,
        tx,
      });

      return updatedEstado;
    },
  );

  estado = await filePopulateDownloadUrlInTree(estado);

  return estado;
}
