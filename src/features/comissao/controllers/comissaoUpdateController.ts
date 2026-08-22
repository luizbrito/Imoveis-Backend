import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  comissaoUpdateBodyInputSchema,
  comissaoUpdateParamsInputSchema,
} from '../comissaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const comissaoUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/comissao/{id}',
  params: comissaoUpdateParamsInputSchema,
  body: comissaoUpdateBodyInputSchema,
  response: 'Comissao',
};

export const comissaoUpdateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'comissao_update',
  description: dictionary.comissao.mcpDescription.update,
  requiredPermissions: { comissao: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: comissaoUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await comissaoUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function comissaoUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      comissao: ['update'],
    },
    context,
  );

  const { id } = comissaoUpdateParamsInputSchema.parse(params);

  const data = comissaoUpdateBodyInputSchema.parse(body);

  let comissao = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentComissao = await tx.comissao.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentComissao) {
          const currentUpdatedAt = currentComissao.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }
      const duplicatedCodigo = await tx.comissao.count({
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
            context.dictionary.comissao.fields.codigo,
          ),
        );
      }

      const oldComissao = await tx.comissao.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          pagamentos: {
            select: {
              id: true,
              dataPagamento: true,
            },
          },
          lancamentosFinanceiros: {
            select: {
              id: true,
              descricao: true,
            },
          },
          venda: {
            select: {
              id: true,
              codigo: true,
            },
          },
          locacao: {
            select: {
              id: true,
              codigo: true,
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

      await tx.comissao.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          codigo: data.codigo,
          tipo: data.tipo,
          baseCalculo: data.baseCalculo,
          percentual: data.percentual,
          valorComissao: data.valorComissao,
          status: data.status,
          dataCompetencia: data.dataCompetencia,
          observacoes: data.observacoes,
          venda: prismaRelationship.connectOrDisconnectOne(data.venda),
          locacao: prismaRelationship.connectOrDisconnectOne(data.locacao),
          corretor: prismaRelationship.connectOrDisconnectOne(data.corretor),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedComissao = await tx.comissao.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          pagamentos: {
            select: {
              id: true,
              dataPagamento: true,
            },
          },
          lancamentosFinanceiros: {
            select: {
              id: true,
              descricao: true,
            },
          },
          venda: {
            select: {
              id: true,
              codigo: true,
            },
          },
          locacao: {
            select: {
              id: true,
              codigo: true,
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
        entityName: 'Comissao',
        operation: auditLogOperations.update,
        context,
        oldData: oldComissao,
        newData: updatedComissao,
        tx,
      });

      return updatedComissao;
    },
  );

  comissao = await filePopulateDownloadUrlInTree(comissao);

  return comissao;
}
