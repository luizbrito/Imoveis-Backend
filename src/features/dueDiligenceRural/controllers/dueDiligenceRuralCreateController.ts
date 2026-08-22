import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { dueDiligenceRuralCreateInputSchema } from '../dueDiligenceRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const dueDiligenceRuralCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/due-diligence-rural',
  body: dueDiligenceRuralCreateInputSchema,
  response: 'DueDiligenceRural',
};

export const dueDiligenceRuralCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'dueDiligenceRural_create',
  description: dictionary.dueDiligenceRural.mcpDescription.create,
  requiredPermissions: { dueDiligenceRural: ['create'] },
  schema: toMcpJsonSchema(dueDiligenceRuralCreateInputSchema),
  handler: async (params, context) => {
    return await dueDiligenceRuralCreateController(params, context);
  },
});

export async function dueDiligenceRuralCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      dueDiligenceRural: ['create'],
    },
    context,
  );
  return await dueDiligenceRuralCreate(body, context);
}

export async function dueDiligenceRuralCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = dueDiligenceRuralCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newDueDiligenceRural = await tx.dueDiligenceRural.create({
        data: {
          titulo: data.titulo,
          dataAnalise: data.dataAnalise,
          status: data.status,
          riscoFundiario: data.riscoFundiario,
          riscoAmbiental: data.riscoAmbiental,
          riscoFiscal: data.riscoFiscal,
          riscoTrabalhista: data.riscoTrabalhista,
          riscoDocumental: data.riscoDocumental,
          notaDocumentacao: data.notaDocumentacao,
          notaInfraestrutura: data.notaInfraestrutura,
          notaLogistica: data.notaLogistica,
          notaRecursosHidricos: data.notaRecursosHidricos,
          notaClima: data.notaClima,
          notaSolo: data.notaSolo,
          notaAptidaoAgricola: data.notaAptidaoAgricola,
          notaAptidaoPecuaria: data.notaAptidaoPecuaria,
          notaAmbiental: data.notaAmbiental,
          scoreGeral: data.scoreGeral,
          classificacaoFinal: data.classificacaoFinal,
          pendencias: data.pendencias,
          recomendacoes: data.recomendacoes,
          relatorio: data.relatorio,
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
        entityId: newDueDiligenceRural.id,
        entityName: 'DueDiligenceRural',
        operation: auditLogOperations.create,
        context,
        newData: newDueDiligenceRural,
        tx,
      });

      const dueDiligenceRural =
        await filePopulateDownloadUrlInTree(newDueDiligenceRural);

      return dueDiligenceRural;
    },
  );
}
