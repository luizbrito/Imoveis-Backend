import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  parcelaVendaUpdateBodyInputSchema,
  parcelaVendaUpdateParamsInputSchema,
} from '../parcelaVendaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const parcelaVendaUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/parcela-venda/{id}',
  params: parcelaVendaUpdateParamsInputSchema,
  body: parcelaVendaUpdateBodyInputSchema,
  response: 'ParcelaVenda',
};

export const parcelaVendaUpdateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'parcelaVenda_update',
  description: dictionary.parcelaVenda.mcpDescription.update,
  requiredPermissions: { parcelaVenda: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: parcelaVendaUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await parcelaVendaUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function parcelaVendaUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      parcelaVenda: ['update'],
    },
    context,
  );

  const { id } = parcelaVendaUpdateParamsInputSchema.parse(params);

  const data = parcelaVendaUpdateBodyInputSchema.parse(body);

  let parcelaVenda = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentParcelaVenda = await tx.parcelaVenda.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentParcelaVenda) {
          const currentUpdatedAt = currentParcelaVenda.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldParcelaVenda = await tx.parcelaVenda.findUniqueOrThrow({
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

      await tx.parcelaVenda.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          numeroParcela: data.numeroParcela,
          dataVencimento: data.dataVencimento,
          valor: data.valor,
          status: data.status,
          dataPagamento: data.dataPagamento,
          valorPago: data.valorPago,
          formaPagamento: data.formaPagamento,
          comprovantes: data.comprovantes,
          venda: prismaRelationship.connectOrDisconnectOne(data.venda),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedParcelaVenda = await tx.parcelaVenda.findUniqueOrThrow({
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
        entityName: 'ParcelaVenda',
        operation: auditLogOperations.update,
        context,
        oldData: oldParcelaVenda,
        newData: updatedParcelaVenda,
        tx,
      });

      return updatedParcelaVenda;
    },
  );

  parcelaVenda = await filePopulateDownloadUrlInTree(parcelaVenda);

  return parcelaVenda;
}
