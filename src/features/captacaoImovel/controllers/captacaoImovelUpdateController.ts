import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  captacaoImovelUpdateBodyInputSchema,
  captacaoImovelUpdateParamsInputSchema,
} from '../captacaoImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const captacaoImovelUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/captacao-imovel/{id}',
  params: captacaoImovelUpdateParamsInputSchema,
  body: captacaoImovelUpdateBodyInputSchema,
  response: 'CaptacaoImovel',
};

export const captacaoImovelUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'captacaoImovel_update',
  description: dictionary.captacaoImovel.mcpDescription.update,
  requiredPermissions: { captacaoImovel: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: captacaoImovelUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await captacaoImovelUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function captacaoImovelUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      captacaoImovel: ['update'],
    },
    context,
  );

  const { id } = captacaoImovelUpdateParamsInputSchema.parse(params);

  const data = captacaoImovelUpdateBodyInputSchema.parse(body);

  let captacaoImovel = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentCaptacaoImovel = await tx.captacaoImovel.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentCaptacaoImovel) {
          const currentUpdatedAt =
            currentCaptacaoImovel.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }
      const duplicatedCodigo = await tx.captacaoImovel.count({
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
            context.dictionary.captacaoImovel.fields.codigo,
          ),
        );
      }

      const oldCaptacaoImovel = await tx.captacaoImovel.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          filial: {
            select: {
              id: true,
              nome: true,
            },
          },
          imovel: {
            select: {
              id: true,
              titulo: true,
            },
          },
          proprietario: {
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

      await tx.captacaoImovel.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          codigo: data.codigo,
          dataCaptacao: data.dataCaptacao,
          tipo: data.tipo,
          status: data.status,
          dataInicio: data.dataInicio,
          dataFim: data.dataFim,
          percentualComissaoVenda: data.percentualComissaoVenda,
          percentualAdministracao: data.percentualAdministracao,
          valorMinimoAutorizado: data.valorMinimoAutorizado,
          documentos: data.documentos,
          observacoes: data.observacoes,
          filial: prismaRelationship.connectOrDisconnectOne(data.filial),
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          proprietario: prismaRelationship.connectOrDisconnectOne(
            data.proprietario,
          ),
          corretor: prismaRelationship.connectOrDisconnectOne(data.corretor),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedCaptacaoImovel = await tx.captacaoImovel.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          filial: {
            select: {
              id: true,
              nome: true,
            },
          },
          imovel: {
            select: {
              id: true,
              titulo: true,
            },
          },
          proprietario: {
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
        entityName: 'CaptacaoImovel',
        operation: auditLogOperations.update,
        context,
        oldData: oldCaptacaoImovel,
        newData: updatedCaptacaoImovel,
        tx,
      });

      return updatedCaptacaoImovel;
    },
  );

  captacaoImovel = await filePopulateDownloadUrlInTree(captacaoImovel);

  return captacaoImovel;
}
