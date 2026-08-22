import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { portalImobiliarioCreateInputSchema } from '../portalImobiliarioSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const portalImobiliarioCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/portal-imobiliario',
  body: portalImobiliarioCreateInputSchema,
  response: 'PortalImobiliario',
};

export const portalImobiliarioCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'portalImobiliario_create',
  description: dictionary.portalImobiliario.mcpDescription.create,
  requiredPermissions: { portalImobiliario: ['create'] },
  schema: toMcpJsonSchema(portalImobiliarioCreateInputSchema),
  handler: async (params, context) => {
    return await portalImobiliarioCreateController(params, context);
  },
});

export async function portalImobiliarioCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      portalImobiliario: ['create'],
    },
    context,
  );
  return await portalImobiliarioCreate(body, context);
}

export async function portalImobiliarioCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = portalImobiliarioCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const duplicatedNome = await tx.portalImobiliario.count({
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
            context.dictionary.portalImobiliario.fields.nome,
          ),
        );
      }

      const newPortalImobiliario = await tx.portalImobiliario.create({
        data: {
          nome: data.nome,
          urlBase: data.urlBase,
          tipoIntegracao: data.tipoIntegracao,
          identificadorConta: data.identificadorConta,
          ativo: data.ativo,
          observacoes: data.observacoes,
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
          publicacoes: {
            select: {
              id: true,
              codigoExterno: true,
            },
          },
          leadsGerados: {
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
        entityId: newPortalImobiliario.id,
        entityName: 'PortalImobiliario',
        operation: auditLogOperations.create,
        context,
        newData: newPortalImobiliario,
        tx,
      });

      const portalImobiliario =
        await filePopulateDownloadUrlInTree(newPortalImobiliario);

      return portalImobiliario;
    },
  );
}
