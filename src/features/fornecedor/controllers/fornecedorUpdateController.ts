import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  fornecedorUpdateBodyInputSchema,
  fornecedorUpdateParamsInputSchema,
} from '../fornecedorSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const fornecedorUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/fornecedor/{id}',
  params: fornecedorUpdateParamsInputSchema,
  body: fornecedorUpdateBodyInputSchema,
  response: 'Fornecedor',
};

export const fornecedorUpdateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'fornecedor_update',
  description: dictionary.fornecedor.mcpDescription.update,
  requiredPermissions: { fornecedor: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: fornecedorUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await fornecedorUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function fornecedorUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      fornecedor: ['update'],
    },
    context,
  );

  const { id } = fornecedorUpdateParamsInputSchema.parse(params);

  const data = fornecedorUpdateBodyInputSchema.parse(body);

  let fornecedor = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentFornecedor = await tx.fornecedor.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentFornecedor) {
          const currentUpdatedAt = currentFornecedor.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }
      const duplicatedCpfCnpj = await tx.fornecedor.count({
        where: {
          cpfCnpj: {
            equals: data.cpfCnpj,
            mode: 'insensitive',
          },
          id: { not: id },
          organizationId: currentOrganization.id,
        },
      });

      if (duplicatedCpfCnpj) {
        throw new Error400(
          dictionaryFormat(
            context.dictionary.shared.errors.unique,
            context.dictionary.fornecedor.fields.cpfCnpj,
          ),
        );
      }

      const oldFornecedor = await tx.fornecedor.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          ordensServico: {
            select: {
              id: true,
              codigo: true,
            },
          },
          despesas: {
            select: {
              id: true,
              descricao: true,
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

      await tx.fornecedor.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          nomeRazaoSocial: data.nomeRazaoSocial,
          tipoPessoa: data.tipoPessoa,
          cpfCnpj: data.cpfCnpj,
          categorias: data.categorias,
          telefone: data.telefone,
          whatsapp: data.whatsapp,
          email: data.email,
          cidade: data.cidade,
          uf: data.uf,
          avaliacao: data.avaliacao,
          ativo: data.ativo,
          observacoes: data.observacoes,
          filial: prismaRelationship.connectOrDisconnectOne(data.filial),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedFornecedor = await tx.fornecedor.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          ordensServico: {
            select: {
              id: true,
              codigo: true,
            },
          },
          despesas: {
            select: {
              id: true,
              descricao: true,
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
        entityName: 'Fornecedor',
        operation: auditLogOperations.update,
        context,
        oldData: oldFornecedor,
        newData: updatedFornecedor,
        tx,
      });

      return updatedFornecedor;
    },
  );

  fornecedor = await filePopulateDownloadUrlInTree(fornecedor);

  return fornecedor;
}
