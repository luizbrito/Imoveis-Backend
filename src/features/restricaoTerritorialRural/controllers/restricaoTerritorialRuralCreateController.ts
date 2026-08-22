import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { restricaoTerritorialRuralCreateInputSchema } from '../restricaoTerritorialRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const restricaoTerritorialRuralCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/restricao-territorial-rural',
  body: restricaoTerritorialRuralCreateInputSchema,
  response: 'RestricaoTerritorialRural',
};

export const restricaoTerritorialRuralCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'restricaoTerritorialRural_create',
  description: dictionary.restricaoTerritorialRural.mcpDescription.create,
  requiredPermissions: { restricaoTerritorialRural: ['create'] },
  schema: toMcpJsonSchema(restricaoTerritorialRuralCreateInputSchema),
  handler: async (params, context) => {
    return await restricaoTerritorialRuralCreateController(params, context);
  },
});

export async function restricaoTerritorialRuralCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      restricaoTerritorialRural: ['create'],
    },
    context,
  );
  return await restricaoTerritorialRuralCreate(body, context);
}

export async function restricaoTerritorialRuralCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = restricaoTerritorialRuralCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newRestricaoTerritorialRural =
        await tx.restricaoTerritorialRural.create({
          data: {
            tipo: data.tipo,
            descricao: data.descricao,
            areaAfetadaHa: data.areaAfetadaHa,
            extensaoKm: data.extensaoKm,
            impacto: data.impacto,
            regularizada: data.regularizada,
            documentos: data.documentos,
            kml: data.kml,
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
        entityId: newRestricaoTerritorialRural.id,
        entityName: 'RestricaoTerritorialRural',
        operation: auditLogOperations.create,
        context,
        newData: newRestricaoTerritorialRural,
        tx,
      });

      const restricaoTerritorialRural = await filePopulateDownloadUrlInTree(
        newRestricaoTerritorialRural,
      );

      return restricaoTerritorialRural;
    },
  );
}
