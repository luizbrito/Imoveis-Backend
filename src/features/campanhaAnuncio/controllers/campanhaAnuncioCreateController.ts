import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { campanhaAnuncioCreateInputSchema } from '../campanhaAnuncioSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const campanhaAnuncioCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/campanha-anuncio',
  body: campanhaAnuncioCreateInputSchema,
  response: 'CampanhaAnuncio',
};

export const campanhaAnuncioCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'campanhaAnuncio_create',
  description: dictionary.campanhaAnuncio.mcpDescription.create,
  requiredPermissions: { campanhaAnuncio: ['create'] },
  schema: toMcpJsonSchema(campanhaAnuncioCreateInputSchema),
  handler: async (params, context) => {
    return await campanhaAnuncioCreateController(params, context);
  },
});

export async function campanhaAnuncioCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      campanhaAnuncio: ['create'],
    },
    context,
  );
  return await campanhaAnuncioCreate(body, context);
}

export async function campanhaAnuncioCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = campanhaAnuncioCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newCampanhaAnuncio = await tx.campanhaAnuncio.create({
        data: {
          dataInclusao: data.dataInclusao,
          investimentoAlocado: data.investimentoAlocado,
          impressoes: data.impressoes,
          cliques: data.cliques,
          leadsGerados: data.leadsGerados,
          campanha: prismaRelationship.connectOneOrThrow(data.campanha),
          anuncio: prismaRelationship.connectOneOrThrow(data.anuncio),
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
          campanha: {
            select: {
              id: true,
              nome: true,
            },
          },
          anuncio: {
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
        entityId: newCampanhaAnuncio.id,
        entityName: 'CampanhaAnuncio',
        operation: auditLogOperations.create,
        context,
        newData: newCampanhaAnuncio,
        tx,
      });

      const campanhaAnuncio =
        await filePopulateDownloadUrlInTree(newCampanhaAnuncio);

      return campanhaAnuncio;
    },
  );
}
