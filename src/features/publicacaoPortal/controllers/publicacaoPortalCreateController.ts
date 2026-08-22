import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { publicacaoPortalCreateInputSchema } from '../publicacaoPortalSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const publicacaoPortalCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/publicacao-portal',
  body: publicacaoPortalCreateInputSchema,
  response: 'PublicacaoPortal',
};

export const publicacaoPortalCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'publicacaoPortal_create',
  description: dictionary.publicacaoPortal.mcpDescription.create,
  requiredPermissions: { publicacaoPortal: ['create'] },
  schema: toMcpJsonSchema(publicacaoPortalCreateInputSchema),
  handler: async (params, context) => {
    return await publicacaoPortalCreateController(params, context);
  },
});

export async function publicacaoPortalCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      publicacaoPortal: ['create'],
    },
    context,
  );
  return await publicacaoPortalCreate(body, context);
}

export async function publicacaoPortalCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = publicacaoPortalCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newPublicacaoPortal = await tx.publicacaoPortal.create({
        data: {
          codigoExterno: data.codigoExterno,
          status: data.status,
          dataEnvio: data.dataEnvio,
          dataAtualizacao: data.dataAtualizacao,
          urlPublicada: data.urlPublicada,
          mensagemRetorno: data.mensagemRetorno,
          tentativas: data.tentativas,
          anuncio: prismaRelationship.connectOneOrThrow(data.anuncio),
          portal: prismaRelationship.connectOneOrThrow(data.portal),
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
          anuncio: {
            select: {
              id: true,
              titulo: true,
            },
          },
          portal: {
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
        entityId: newPublicacaoPortal.id,
        entityName: 'PublicacaoPortal',
        operation: auditLogOperations.create,
        context,
        newData: newPublicacaoPortal,
        tx,
      });

      const publicacaoPortal =
        await filePopulateDownloadUrlInTree(newPublicacaoPortal);

      return publicacaoPortal;
    },
  );
}
