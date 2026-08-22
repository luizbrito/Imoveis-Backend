import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  contratoLocacaoUpdateBodyInputSchema,
  contratoLocacaoUpdateParamsInputSchema,
} from '../contratoLocacaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const contratoLocacaoUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/contrato-locacao/{id}',
  params: contratoLocacaoUpdateParamsInputSchema,
  body: contratoLocacaoUpdateBodyInputSchema,
  response: 'ContratoLocacao',
};

export const contratoLocacaoUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'contratoLocacao_update',
  description: dictionary.contratoLocacao.mcpDescription.update,
  requiredPermissions: { contratoLocacao: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: contratoLocacaoUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await contratoLocacaoUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function contratoLocacaoUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      contratoLocacao: ['update'],
    },
    context,
  );

  const { id } = contratoLocacaoUpdateParamsInputSchema.parse(params);

  const data = contratoLocacaoUpdateBodyInputSchema.parse(body);

  let contratoLocacao = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentContratoLocacao = await tx.contratoLocacao.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentContratoLocacao) {
          const currentUpdatedAt =
            currentContratoLocacao.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }
      const duplicatedNumero = await tx.contratoLocacao.count({
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
            context.dictionary.contratoLocacao.fields.numero,
          ),
        );
      }

      const oldContratoLocacao = await tx.contratoLocacao.findUniqueOrThrow({
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

      await tx.contratoLocacao.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          numero: data.numero,
          tipo: data.tipo,
          status: data.status,
          dataEmissao: data.dataEmissao,
          dataAssinatura: data.dataAssinatura,
          arquivos: data.arquivos,
          assinaturaEletronicaId: data.assinaturaEletronicaId,
          observacoes: data.observacoes,
          locacao: prismaRelationship.connectOrDisconnectOne(data.locacao),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedContratoLocacao = await tx.contratoLocacao.findUniqueOrThrow(
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
        entityName: 'ContratoLocacao',
        operation: auditLogOperations.update,
        context,
        oldData: oldContratoLocacao,
        newData: updatedContratoLocacao,
        tx,
      });

      return updatedContratoLocacao;
    },
  );

  contratoLocacao = await filePopulateDownloadUrlInTree(contratoLocacao);

  return contratoLocacao;
}
