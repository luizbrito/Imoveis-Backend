import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  vistoriaUpdateBodyInputSchema,
  vistoriaUpdateParamsInputSchema,
} from '../vistoriaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const vistoriaUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/vistoria/{id}',
  params: vistoriaUpdateParamsInputSchema,
  body: vistoriaUpdateBodyInputSchema,
  response: 'Vistoria',
};

export const vistoriaUpdateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'vistoria_update',
  description: dictionary.vistoria.mcpDescription.update,
  requiredPermissions: { vistoria: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: vistoriaUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await vistoriaUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function vistoriaUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      vistoria: ['update'],
    },
    context,
  );

  const { id } = vistoriaUpdateParamsInputSchema.parse(params);

  const data = vistoriaUpdateBodyInputSchema.parse(body);

  let vistoria = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentVistoria = await tx.vistoria.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentVistoria) {
          const currentUpdatedAt = currentVistoria.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }
      const duplicatedCodigo = await tx.vistoria.count({
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
            context.dictionary.vistoria.fields.codigo,
          ),
        );
      }

      const oldVistoria = await tx.vistoria.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          itens: {
            select: {
              id: true,
              item: true,
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

      await tx.vistoria.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          codigo: data.codigo,
          tipo: data.tipo,
          dataAgendada: data.dataAgendada,
          dataRealizada: data.dataRealizada,
          status: data.status,
          responsavelNome: data.responsavelNome,
          assinaturaResponsavel: data.assinaturaResponsavel,
          parecerGeral: data.parecerGeral,
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          corretor: prismaRelationship.connectOrDisconnectOne(data.corretor),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedVistoria = await tx.vistoria.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          itens: {
            select: {
              id: true,
              item: true,
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
        entityName: 'Vistoria',
        operation: auditLogOperations.update,
        context,
        oldData: oldVistoria,
        newData: updatedVistoria,
        tx,
      });

      return updatedVistoria;
    },
  );

  vistoria = await filePopulateDownloadUrlInTree(vistoria);

  return vistoria;
}
