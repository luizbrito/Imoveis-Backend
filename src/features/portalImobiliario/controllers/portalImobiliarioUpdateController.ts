import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  portalImobiliarioUpdateBodyInputSchema,
  portalImobiliarioUpdateParamsInputSchema,
} from '../portalImobiliarioSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const portalImobiliarioUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/portal-imobiliario/{id}',
  params: portalImobiliarioUpdateParamsInputSchema,
  body: portalImobiliarioUpdateBodyInputSchema,
  response: 'PortalImobiliario',
};

export const portalImobiliarioUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'portalImobiliario_update',
  description: dictionary.portalImobiliario.mcpDescription.update,
  requiredPermissions: { portalImobiliario: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: portalImobiliarioUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await portalImobiliarioUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function portalImobiliarioUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      portalImobiliario: ['update'],
    },
    context,
  );

  const { id } = portalImobiliarioUpdateParamsInputSchema.parse(params);

  const data = portalImobiliarioUpdateBodyInputSchema.parse(body);

  let portalImobiliario = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentPortalImobiliario = await tx.portalImobiliario.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentPortalImobiliario) {
          const currentUpdatedAt =
            currentPortalImobiliario.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }
      const duplicatedNome = await tx.portalImobiliario.count({
        where: {
          nome: {
            equals: data.nome,
            mode: 'insensitive',
          },
          id: { not: id },
          organizationId: currentOrganization.id,
        },
      });

      if (duplicatedNome) {
        throw new Error400(
          dictionaryFormat(
            context.dictionary.shared.errors.unique,
            context.dictionary.portalImobiliario.fields.nome,
          ),
        );
      }

      const oldPortalImobiliario = await tx.portalImobiliario.findUniqueOrThrow(
        {
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          include: {
            publicacoes: {
              select: {
                id: true,
                codigoExterno: true,
              },
            },
            leadsGerados: {
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
        },
      );

      await tx.portalImobiliario.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          nome: data.nome,
          urlBase: data.urlBase,
          tipoIntegracao: data.tipoIntegracao,
          identificadorConta: data.identificadorConta,
          ativo: data.ativo,
          observacoes: data.observacoes,
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedPortalImobiliario =
        await tx.portalImobiliario.findUniqueOrThrow({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          include: {
            publicacoes: {
              select: {
                id: true,
                codigoExterno: true,
              },
            },
            leadsGerados: {
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
        entityName: 'PortalImobiliario',
        operation: auditLogOperations.update,
        context,
        oldData: oldPortalImobiliario,
        newData: updatedPortalImobiliario,
        tx,
      });

      return updatedPortalImobiliario;
    },
  );

  portalImobiliario = await filePopulateDownloadUrlInTree(portalImobiliario);

  return portalImobiliario;
}
