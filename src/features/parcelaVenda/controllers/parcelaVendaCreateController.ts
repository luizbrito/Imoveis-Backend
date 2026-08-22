import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { parcelaVendaCreateInputSchema } from '../parcelaVendaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const parcelaVendaCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/parcela-venda',
  body: parcelaVendaCreateInputSchema,
  response: 'ParcelaVenda',
};

export const parcelaVendaCreateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'parcelaVenda_create',
  description: dictionary.parcelaVenda.mcpDescription.create,
  requiredPermissions: { parcelaVenda: ['create'] },
  schema: toMcpJsonSchema(parcelaVendaCreateInputSchema),
  handler: async (params, context) => {
    return await parcelaVendaCreateController(params, context);
  },
});

export async function parcelaVendaCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      parcelaVenda: ['create'],
    },
    context,
  );
  return await parcelaVendaCreate(body, context);
}

export async function parcelaVendaCreate(body: unknown, context: AppContext) {
  const currentOrganization = context.currentOrganization!;

  const data = parcelaVendaCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newParcelaVenda = await tx.parcelaVenda.create({
        data: {
          numeroParcela: data.numeroParcela,
          dataVencimento: data.dataVencimento,
          valor: data.valor,
          status: data.status,
          dataPagamento: data.dataPagamento,
          valorPago: data.valorPago,
          formaPagamento: data.formaPagamento,
          comprovantes: data.comprovantes,
          venda: prismaRelationship.connectOneOrThrow(data.venda),
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
        entityId: newParcelaVenda.id,
        entityName: 'ParcelaVenda',
        operation: auditLogOperations.create,
        context,
        newData: newParcelaVenda,
        tx,
      });

      const parcelaVenda = await filePopulateDownloadUrlInTree(newParcelaVenda);

      return parcelaVenda;
    },
  );
}
