import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { caracteristicaImovelCreateInputSchema } from '../caracteristicaImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const caracteristicaImovelCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/caracteristica-imovel',
  body: caracteristicaImovelCreateInputSchema,
  response: 'CaracteristicaImovel',
};

export const caracteristicaImovelCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'caracteristicaImovel_create',
  description: dictionary.caracteristicaImovel.mcpDescription.create,
  requiredPermissions: { caracteristicaImovel: ['create'] },
  schema: toMcpJsonSchema(caracteristicaImovelCreateInputSchema),
  handler: async (params, context) => {
    return await caracteristicaImovelCreateController(params, context);
  },
});

export async function caracteristicaImovelCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      caracteristicaImovel: ['create'],
    },
    context,
  );
  return await caracteristicaImovelCreate(body, context);
}

export async function caracteristicaImovelCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = caracteristicaImovelCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const duplicatedNome = await tx.caracteristicaImovel.count({
        where: {
          nome: {
            equals: data.nome,
            mode: 'insensitive',
          },
          organizationId: currentOrganization.id,
        },
      });

      if (duplicatedNome) {
        throw new Error400(
          dictionaryFormat(
            context.dictionary.shared.errors.unique,
            context.dictionary.caracteristicaImovel.fields.nome,
          ),
        );
      }

      const newCaracteristicaImovel = await tx.caracteristicaImovel.create({
        data: {
          nome: data.nome,
          grupo: data.grupo,
          icone: data.icone,
          ativa: data.ativa,
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
          imoveisVinculados: {
            select: {
              id: true,
              valorTexto: true,
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
        entityId: newCaracteristicaImovel.id,
        entityName: 'CaracteristicaImovel',
        operation: auditLogOperations.create,
        context,
        newData: newCaracteristicaImovel,
        tx,
      });

      const caracteristicaImovel = await filePopulateDownloadUrlInTree(
        newCaracteristicaImovel,
      );

      return caracteristicaImovel;
    },
  );
}
