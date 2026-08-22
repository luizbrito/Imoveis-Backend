import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { topografiaRuralCreateInputSchema } from '../topografiaRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const topografiaRuralCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/topografia-rural',
  body: topografiaRuralCreateInputSchema,
  response: 'TopografiaRural',
};

export const topografiaRuralCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'topografiaRural_create',
  description: dictionary.topografiaRural.mcpDescription.create,
  requiredPermissions: { topografiaRural: ['create'] },
  schema: toMcpJsonSchema(topografiaRuralCreateInputSchema),
  handler: async (params, context) => {
    return await topografiaRuralCreateController(params, context);
  },
});

export async function topografiaRuralCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      topografiaRural: ['create'],
    },
    context,
  );
  return await topografiaRuralCreate(body, context);
}

export async function topografiaRuralCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = topografiaRuralCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newTopografiaRural = await tx.topografiaRural.create({
        data: {
          descricao: data.descricao,
          tipoRelevo: data.tipoRelevo,
          altitudeMinimaM: data.altitudeMinimaM,
          altitudeMaximaM: data.altitudeMaximaM,
          altitudeMediaM: data.altitudeMediaM,
          declividadeMediaPercentual: data.declividadeMediaPercentual,
          declividadeMaximaPercentual: data.declividadeMaximaPercentual,
          areaPlanaPercentual: data.areaPlanaPercentual,
          areaOnduladaPercentual: data.areaOnduladaPercentual,
          riscoErosao: data.riscoErosao,
          mapaTopografico: data.mapaTopografico,
          arquivoDem: data.arquivoDem,
          observacoes: data.observacoes,
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
        entityId: newTopografiaRural.id,
        entityName: 'TopografiaRural',
        operation: auditLogOperations.create,
        context,
        newData: newTopografiaRural,
        tx,
      });

      const topografiaRural =
        await filePopulateDownloadUrlInTree(newTopografiaRural);

      return topografiaRural;
    },
  );
}
