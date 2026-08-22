import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  repasseProprietarioUpdateBodyInputSchema,
  repasseProprietarioUpdateParamsInputSchema,
} from '../repasseProprietarioSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const repasseProprietarioUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/repasse-proprietario/{id}',
  params: repasseProprietarioUpdateParamsInputSchema,
  body: repasseProprietarioUpdateBodyInputSchema,
  response: 'RepasseProprietario',
};

export const repasseProprietarioUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'repasseProprietario_update',
  description: dictionary.repasseProprietario.mcpDescription.update,
  requiredPermissions: { repasseProprietario: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: repasseProprietarioUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await repasseProprietarioUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function repasseProprietarioUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      repasseProprietario: ['update'],
    },
    context,
  );

  const { id } = repasseProprietarioUpdateParamsInputSchema.parse(params);

  const data = repasseProprietarioUpdateBodyInputSchema.parse(body);

  let repasseProprietario = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentRepasseProprietario =
          await tx.repasseProprietario.findUnique({
            where: {
              id_organizationId: {
                id,
                organizationId: currentOrganization.id,
              },
            },
            select: { updatedAt: true },
          });

        if (currentRepasseProprietario) {
          const currentUpdatedAt =
            currentRepasseProprietario.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldRepasseProprietario =
        await tx.repasseProprietario.findUniqueOrThrow({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          include: {
            lancamentosFinanceiros: {
              select: {
                id: true,
                descricao: true,
              },
            },
            locacao: {
              select: {
                id: true,
                codigo: true,
              },
            },
            proprietario: {
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

      await tx.repasseProprietario.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          competencia: data.competencia,
          dataPrevista: data.dataPrevista,
          dataRepasse: data.dataRepasse,
          status: data.status,
          valorRecebido: data.valorRecebido,
          taxaAdministracao: data.taxaAdministracao,
          despesasDescontadas: data.despesasDescontadas,
          impostosRetidos: data.impostosRetidos,
          valorLiquido: data.valorLiquido,
          comprovante: data.comprovante,
          observacoes: data.observacoes,
          locacao: prismaRelationship.connectOrDisconnectOne(data.locacao),
          proprietario: prismaRelationship.connectOrDisconnectOne(
            data.proprietario,
          ),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedRepasseProprietario =
        await tx.repasseProprietario.findUniqueOrThrow({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          include: {
            lancamentosFinanceiros: {
              select: {
                id: true,
                descricao: true,
              },
            },
            locacao: {
              select: {
                id: true,
                codigo: true,
              },
            },
            proprietario: {
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

      await auditLogCreate({
        entityId: id,
        entityName: 'RepasseProprietario',
        operation: auditLogOperations.update,
        context,
        oldData: oldRepasseProprietario,
        newData: updatedRepasseProprietario,
        tx,
      });

      return updatedRepasseProprietario;
    },
  );

  repasseProprietario =
    await filePopulateDownloadUrlInTree(repasseProprietario);

  return repasseProprietario;
}
