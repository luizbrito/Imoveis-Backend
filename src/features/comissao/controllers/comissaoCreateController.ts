import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { comissaoCreateInputSchema } from '../comissaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const comissaoCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/comissao',
  body: comissaoCreateInputSchema,
  response: 'Comissao',
};

export const comissaoCreateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'comissao_create',
  description: dictionary.comissao.mcpDescription.create,
  requiredPermissions: { comissao: ['create'] },
  schema: toMcpJsonSchema(comissaoCreateInputSchema),
  handler: async (params, context) => {
    return await comissaoCreateController(params, context);
  },
});

export async function comissaoCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      comissao: ['create'],
    },
    context,
  );
  return await comissaoCreate(body, context);
}

export async function comissaoCreate(body: unknown, context: AppContext) {
  const currentOrganization = context.currentOrganization!;

  const data = comissaoCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const duplicatedCodigo = await tx.comissao.count({
        where: {
          codigo: {
            equals: data.codigo,
            mode: 'insensitive',
          },
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

      const newComissao = await tx.comissao.create({
        data: {
          codigo: data.codigo,
          tipo: data.tipo,
          baseCalculo: data.baseCalculo,
          percentual: data.percentual,
          valorComissao: data.valorComissao,
          status: data.status,
          dataCompetencia: data.dataCompetencia,
          observacoes: data.observacoes,
          venda: prismaRelationship.connectOne(data.venda),
          locacao: prismaRelationship.connectOne(data.locacao),
          corretor: prismaRelationship.connectOneOrThrow(data.corretor),
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
        entityId: newComissao.id,
        entityName: 'Comissao',
        operation: auditLogOperations.create,
        context,
        newData: newComissao,
        tx,
      });

      const comissao = await filePopulateDownloadUrlInTree(newComissao);

      return comissao;
    },
  );
}
