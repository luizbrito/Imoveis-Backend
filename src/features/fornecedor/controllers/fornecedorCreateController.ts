import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { fornecedorCreateInputSchema } from '../fornecedorSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const fornecedorCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/fornecedor',
  body: fornecedorCreateInputSchema,
  response: 'Fornecedor',
};

export const fornecedorCreateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'fornecedor_create',
  description: dictionary.fornecedor.mcpDescription.create,
  requiredPermissions: { fornecedor: ['create'] },
  schema: toMcpJsonSchema(fornecedorCreateInputSchema),
  handler: async (params, context) => {
    return await fornecedorCreateController(params, context);
  },
});

export async function fornecedorCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      fornecedor: ['create'],
    },
    context,
  );
  return await fornecedorCreate(body, context);
}

export async function fornecedorCreate(body: unknown, context: AppContext) {
  const currentOrganization = context.currentOrganization!;

  const data = fornecedorCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const duplicatedCpfCnpj = await tx.fornecedor.count({
        where: {
          cpfCnpj: {
            equals: data.cpfCnpj,
            mode: 'insensitive',
          },
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

      const newFornecedor = await tx.fornecedor.create({
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
          filial: prismaRelationship.connectOneOrThrow(data.filial),
          importHash: data.importHash,
          organization: prismaRelationship.connectOneOrThrow(
            context.currentOrganization!.id,
          ),
          createdByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
          createdByUserId: context.currentUser?.id,
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
        entityId: newFornecedor.id,
        entityName: 'Fornecedor',
        operation: auditLogOperations.create,
        context,
        newData: newFornecedor,
        tx,
      });

      const fornecedor = await filePopulateDownloadUrlInTree(newFornecedor);

      return fornecedor;
    },
  );
}
