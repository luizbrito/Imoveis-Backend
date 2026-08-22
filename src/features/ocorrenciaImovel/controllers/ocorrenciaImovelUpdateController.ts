import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  ocorrenciaImovelUpdateBodyInputSchema,
  ocorrenciaImovelUpdateParamsInputSchema,
} from '../ocorrenciaImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const ocorrenciaImovelUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/ocorrencia-imovel/{id}',
  params: ocorrenciaImovelUpdateParamsInputSchema,
  body: ocorrenciaImovelUpdateBodyInputSchema,
  response: 'OcorrenciaImovel',
};

export const ocorrenciaImovelUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'ocorrenciaImovel_update',
  description: dictionary.ocorrenciaImovel.mcpDescription.update,
  requiredPermissions: { ocorrenciaImovel: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: ocorrenciaImovelUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await ocorrenciaImovelUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function ocorrenciaImovelUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      ocorrenciaImovel: ['update'],
    },
    context,
  );

  const { id } = ocorrenciaImovelUpdateParamsInputSchema.parse(params);

  const data = ocorrenciaImovelUpdateBodyInputSchema.parse(body);

  let ocorrenciaImovel = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentOcorrenciaImovel = await tx.ocorrenciaImovel.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentOcorrenciaImovel) {
          const currentUpdatedAt =
            currentOcorrenciaImovel.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }
      const duplicatedCodigo = await tx.ocorrenciaImovel.count({
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
            context.dictionary.ocorrenciaImovel.fields.codigo,
          ),
        );
      }

      const oldOcorrenciaImovel = await tx.ocorrenciaImovel.findUniqueOrThrow({
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
          locacao: {
            select: {
              id: true,
              codigo: true,
            },
          },
          clienteRelator: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          corretorResponsavel: {
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

      await tx.ocorrenciaImovel.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          codigo: data.codigo,
          dataHora: data.dataHora,
          tipo: data.tipo,
          gravidade: data.gravidade,
          status: data.status,
          titulo: data.titulo,
          descricao: data.descricao,
          anexos: data.anexos,
          dataResolucao: data.dataResolucao,
          resolucao: data.resolucao,
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          locacao: prismaRelationship.connectOrDisconnectOne(data.locacao),
          clienteRelator: prismaRelationship.connectOrDisconnectOne(
            data.clienteRelator,
          ),
          corretorResponsavel: prismaRelationship.connectOrDisconnectOne(
            data.corretorResponsavel,
          ),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedOcorrenciaImovel =
        await tx.ocorrenciaImovel.findUniqueOrThrow({
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
            locacao: {
              select: {
                id: true,
                codigo: true,
              },
            },
            clienteRelator: {
              select: {
                id: true,
                nomeRazaoSocial: true,
              },
            },
            corretorResponsavel: {
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
        entityName: 'OcorrenciaImovel',
        operation: auditLogOperations.update,
        context,
        oldData: oldOcorrenciaImovel,
        newData: updatedOcorrenciaImovel,
        tx,
      });

      return updatedOcorrenciaImovel;
    },
  );

  ocorrenciaImovel = await filePopulateDownloadUrlInTree(ocorrenciaImovel);

  return ocorrenciaImovel;
}
