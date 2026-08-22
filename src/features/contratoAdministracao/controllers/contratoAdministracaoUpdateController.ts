import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  contratoAdministracaoUpdateBodyInputSchema,
  contratoAdministracaoUpdateParamsInputSchema,
} from '../contratoAdministracaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const contratoAdministracaoUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/contrato-administracao/{id}',
  params: contratoAdministracaoUpdateParamsInputSchema,
  body: contratoAdministracaoUpdateBodyInputSchema,
  response: 'ContratoAdministracao',
};

export const contratoAdministracaoUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'contratoAdministracao_update',
  description: dictionary.contratoAdministracao.mcpDescription.update,
  requiredPermissions: { contratoAdministracao: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: contratoAdministracaoUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await contratoAdministracaoUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function contratoAdministracaoUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      contratoAdministracao: ['update'],
    },
    context,
  );

  const { id } = contratoAdministracaoUpdateParamsInputSchema.parse(params);

  const data = contratoAdministracaoUpdateBodyInputSchema.parse(body);

  let contratoAdministracao = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentContratoAdministracao =
          await tx.contratoAdministracao.findUnique({
            where: {
              id_organizationId: {
                id,
                organizationId: currentOrganization.id,
              },
            },
            select: { updatedAt: true },
          });

        if (currentContratoAdministracao) {
          const currentUpdatedAt =
            currentContratoAdministracao.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }
      const duplicatedNumero = await tx.contratoAdministracao.count({
        where: {
          numero: {
            equals: data.numero,
            mode: 'insensitive',
          },
          id: { not: id },
          organizationId: currentOrganization.id,
        },
      });

      if (duplicatedNumero) {
        throw new Error400(
          dictionaryFormat(
            context.dictionary.shared.errors.unique,
            context.dictionary.contratoAdministracao.fields.numero,
          ),
        );
      }

      const oldContratoAdministracao =
        await tx.contratoAdministracao.findUniqueOrThrow({
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
            proprietario: {
              select: {
                id: true,
                nomeRazaoSocial: true,
              },
            },
            filial: {
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

      await tx.contratoAdministracao.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          numero: data.numero,
          status: data.status,
          dataInicio: data.dataInicio,
          dataFim: data.dataFim,
          taxaAdministracaoPercentual: data.taxaAdministracaoPercentual,
          taxaIntermediacaoPercentual: data.taxaIntermediacaoPercentual,
          prazoRepasseDias: data.prazoRepasseDias,
          autorizaManutencaoAte: data.autorizaManutencaoAte,
          arquivos: data.arquivos,
          observacoes: data.observacoes,
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          proprietario: prismaRelationship.connectOrDisconnectOne(
            data.proprietario,
          ),
          filial: prismaRelationship.connectOrDisconnectOne(data.filial),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedContratoAdministracao =
        await tx.contratoAdministracao.findUniqueOrThrow({
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
            proprietario: {
              select: {
                id: true,
                nomeRazaoSocial: true,
              },
            },
            filial: {
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
        entityName: 'ContratoAdministracao',
        operation: auditLogOperations.update,
        context,
        oldData: oldContratoAdministracao,
        newData: updatedContratoAdministracao,
        tx,
      });

      return updatedContratoAdministracao;
    },
  );

  contratoAdministracao = await filePopulateDownloadUrlInTree(
    contratoAdministracao,
  );

  return contratoAdministracao;
}
