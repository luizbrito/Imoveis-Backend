import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { itemVistoriaCreateInputSchema } from '../itemVistoriaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const itemVistoriaCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/item-vistoria',
  body: itemVistoriaCreateInputSchema,
  response: 'ItemVistoria',
};

export const itemVistoriaCreateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'itemVistoria_create',
  description: dictionary.itemVistoria.mcpDescription.create,
  requiredPermissions: { itemVistoria: ['create'] },
  schema: toMcpJsonSchema(itemVistoriaCreateInputSchema),
  handler: async (params, context) => {
    return await itemVistoriaCreateController(params, context);
  },
});

export async function itemVistoriaCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      itemVistoria: ['create'],
    },
    context,
  );
  return await itemVistoriaCreate(body, context);
}

export async function itemVistoriaCreate(body: unknown, context: AppContext) {
  const currentOrganization = context.currentOrganization!;

  const data = itemVistoriaCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newItemVistoria = await tx.itemVistoria.create({
        data: {
          ambiente: data.ambiente,
          item: data.item,
          estado: data.estado,
          quantidade: data.quantidade,
          descricao: data.descricao,
          fotos: data.fotos,
          requerCorrecao: data.requerCorrecao,
          valorEstimadoCorrecao: data.valorEstimadoCorrecao,
          vistoria: prismaRelationship.connectOneOrThrow(data.vistoria),
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
          vistoria: {
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
        entityId: newItemVistoria.id,
        entityName: 'ItemVistoria',
        operation: auditLogOperations.create,
        context,
        newData: newItemVistoria,
        tx,
      });

      const itemVistoria = await filePopulateDownloadUrlInTree(newItemVistoria);

      return itemVistoria;
    },
  );
}
