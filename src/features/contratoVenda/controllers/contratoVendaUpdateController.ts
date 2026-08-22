import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  contratoVendaUpdateBodyInputSchema,
  contratoVendaUpdateParamsInputSchema,
} from '../contratoVendaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const contratoVendaUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/contrato-venda/{id}',
  params: contratoVendaUpdateParamsInputSchema,
  body: contratoVendaUpdateBodyInputSchema,
  response: 'ContratoVenda',
};

export const contratoVendaUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'contratoVenda_update',
  description: dictionary.contratoVenda.mcpDescription.update,
  requiredPermissions: { contratoVenda: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: contratoVendaUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await contratoVendaUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function contratoVendaUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      contratoVenda: ['update'],
    },
    context,
  );

  const { id } = contratoVendaUpdateParamsInputSchema.parse(params);

  const data = contratoVendaUpdateBodyInputSchema.parse(body);

  let contratoVenda = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentContratoVenda = await tx.contratoVenda.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentContratoVenda) {
          const currentUpdatedAt = currentContratoVenda.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }
      const duplicatedNumero = await tx.contratoVenda.count({
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
            context.dictionary.contratoVenda.fields.numero,
          ),
        );
      }

      const oldContratoVenda = await tx.contratoVenda.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          venda: {
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

      await tx.contratoVenda.update({
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
          dataRegistro: data.dataRegistro,
          arquivos: data.arquivos,
          assinaturaEletronicaId: data.assinaturaEletronicaId,
          observacoes: data.observacoes,
          venda: prismaRelationship.connectOrDisconnectOne(data.venda),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedContratoVenda = await tx.contratoVenda.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          venda: {
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

      await auditLogCreate({
        entityId: id,
        entityName: 'ContratoVenda',
        operation: auditLogOperations.update,
        context,
        oldData: oldContratoVenda,
        newData: updatedContratoVenda,
        tx,
      });

      return updatedContratoVenda;
    },
  );

  contratoVenda = await filePopulateDownloadUrlInTree(contratoVenda);

  return contratoVenda;
}
