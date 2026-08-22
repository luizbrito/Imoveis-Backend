import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { riscoRuralCreateInputSchema } from '../riscoRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const riscoRuralCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/risco-rural',
  body: riscoRuralCreateInputSchema,
  response: 'RiscoRural',
};

export const riscoRuralCreateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'riscoRural_create',
  description: dictionary.riscoRural.mcpDescription.create,
  requiredPermissions: { riscoRural: ['create'] },
  schema: toMcpJsonSchema(riscoRuralCreateInputSchema),
  handler: async (params, context) => {
    return await riscoRuralCreateController(params, context);
  },
});

export async function riscoRuralCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      riscoRural: ['create'],
    },
    context,
  );
  return await riscoRuralCreate(body, context);
}

export async function riscoRuralCreate(body: unknown, context: AppContext) {
  const currentOrganization = context.currentOrganization!;

  const data = riscoRuralCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newRiscoRural = await tx.riscoRural.create({
        data: {
          tipo: data.tipo,
          nivel: data.nivel,
          descricao: data.descricao,
          historicoOcorrencia: data.historicoOcorrencia,
          ultimaOcorrencia: data.ultimaOcorrencia,
          areaAfetadaHa: data.areaAfetadaHa,
          mitigacaoExistente: data.mitigacaoExistente,
          descricaoMitigacao: data.descricaoMitigacao,
          documentos: data.documentos,
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
        entityId: newRiscoRural.id,
        entityName: 'RiscoRural',
        operation: auditLogOperations.create,
        context,
        newData: newRiscoRural,
        tx,
      });

      const riscoRural = await filePopulateDownloadUrlInTree(newRiscoRural);

      return riscoRural;
    },
  );
}
