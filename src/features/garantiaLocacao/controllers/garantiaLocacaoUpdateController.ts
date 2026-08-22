import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  garantiaLocacaoUpdateBodyInputSchema,
  garantiaLocacaoUpdateParamsInputSchema,
} from '../garantiaLocacaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const garantiaLocacaoUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/garantia-locacao/{id}',
  params: garantiaLocacaoUpdateParamsInputSchema,
  body: garantiaLocacaoUpdateBodyInputSchema,
  response: 'GarantiaLocacao',
};

export const garantiaLocacaoUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'garantiaLocacao_update',
  description: dictionary.garantiaLocacao.mcpDescription.update,
  requiredPermissions: { garantiaLocacao: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: garantiaLocacaoUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await garantiaLocacaoUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function garantiaLocacaoUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      garantiaLocacao: ['update'],
    },
    context,
  );

  const { id } = garantiaLocacaoUpdateParamsInputSchema.parse(params);

  const data = garantiaLocacaoUpdateBodyInputSchema.parse(body);

  let garantiaLocacao = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentGarantiaLocacao = await tx.garantiaLocacao.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentGarantiaLocacao) {
          const currentUpdatedAt =
            currentGarantiaLocacao.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldGarantiaLocacao = await tx.garantiaLocacao.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          locacao: {
            select: {
              id: true,
              codigo: true,
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

      await tx.garantiaLocacao.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          tipo: data.tipo,
          status: data.status,
          valorGarantia: data.valorGarantia,
          garantidorNome: data.garantidorNome,
          garantidorCpfCnpj: data.garantidorCpfCnpj,
          seguradora: data.seguradora,
          numeroApolice: data.numeroApolice,
          validadeAte: data.validadeAte,
          documentos: data.documentos,
          observacoes: data.observacoes,
          locacao: prismaRelationship.connectOrDisconnectOne(data.locacao),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedGarantiaLocacao = await tx.garantiaLocacao.findUniqueOrThrow(
        {
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          include: {
            locacao: {
              select: {
                id: true,
                codigo: true,
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
        entityName: 'GarantiaLocacao',
        operation: auditLogOperations.update,
        context,
        oldData: oldGarantiaLocacao,
        newData: updatedGarantiaLocacao,
        tx,
      });

      return updatedGarantiaLocacao;
    },
  );

  garantiaLocacao = await filePopulateDownloadUrlInTree(garantiaLocacao);

  return garantiaLocacao;
}
