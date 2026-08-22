import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { imovelCaracteristicaCreateInputSchema } from '../imovelCaracteristicaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const imovelCaracteristicaCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/imovel-caracteristica',
  body: imovelCaracteristicaCreateInputSchema,
  response: 'ImovelCaracteristica',
};

export const imovelCaracteristicaCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'imovelCaracteristica_create',
  description: dictionary.imovelCaracteristica.mcpDescription.create,
  requiredPermissions: { imovelCaracteristica: ['create'] },
  schema: toMcpJsonSchema(imovelCaracteristicaCreateInputSchema),
  handler: async (params, context) => {
    return await imovelCaracteristicaCreateController(params, context);
  },
});

export async function imovelCaracteristicaCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      imovelCaracteristica: ['create'],
    },
    context,
  );
  return await imovelCaracteristicaCreate(body, context);
}

export async function imovelCaracteristicaCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = imovelCaracteristicaCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newImovelCaracteristica = await tx.imovelCaracteristica.create({
        data: {
          valorTexto: data.valorTexto,
          destaque: data.destaque,
          imovel: prismaRelationship.connectOneOrThrow(data.imovel),
          caracteristica: prismaRelationship.connectOneOrThrow(
            data.caracteristica,
          ),
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
          imovel: {
            select: {
              id: true,
              titulo: true,
            },
          },
          caracteristica: {
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
        entityId: newImovelCaracteristica.id,
        entityName: 'ImovelCaracteristica',
        operation: auditLogOperations.create,
        context,
        newData: newImovelCaracteristica,
        tx,
      });

      const imovelCaracteristica = await filePopulateDownloadUrlInTree(
        newImovelCaracteristica,
      );

      return imovelCaracteristica;
    },
  );
}
