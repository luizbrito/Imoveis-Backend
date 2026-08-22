import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { midiaImovelCreateInputSchema } from '../midiaImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const midiaImovelCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/midia-imovel',
  body: midiaImovelCreateInputSchema,
  response: 'MidiaImovel',
};

export const midiaImovelCreateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'midiaImovel_create',
  description: dictionary.midiaImovel.mcpDescription.create,
  requiredPermissions: { midiaImovel: ['create'] },
  schema: toMcpJsonSchema(midiaImovelCreateInputSchema),
  handler: async (params, context) => {
    return await midiaImovelCreateController(params, context);
  },
});

export async function midiaImovelCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      midiaImovel: ['create'],
    },
    context,
  );
  return await midiaImovelCreate(body, context);
}

export async function midiaImovelCreate(body: unknown, context: AppContext) {
  const currentOrganization = context.currentOrganization!;

  const data = midiaImovelCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newMidiaImovel = await tx.midiaImovel.create({
        data: {
          titulo: data.titulo,
          tipo: data.tipo,
          imagens: data.imagens,
          urlExterna: data.urlExterna,
          ordem: data.ordem,
          principal: data.principal,
          publica: data.publica,
          legenda: data.legenda,
          imovel: prismaRelationship.connectOneOrThrow(data.imovel),
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
        entityId: newMidiaImovel.id,
        entityName: 'MidiaImovel',
        operation: auditLogOperations.create,
        context,
        newData: newMidiaImovel,
        tx,
      });

      const midiaImovel = await filePopulateDownloadUrlInTree(newMidiaImovel);

      return midiaImovel;
    },
  );
}
