import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { soloImovelRuralCreateInputSchema } from '../soloImovelRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const soloImovelRuralCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/solo-imovel-rural',
  body: soloImovelRuralCreateInputSchema,
  response: 'SoloImovelRural',
};

export const soloImovelRuralCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'soloImovelRural_create',
  description: dictionary.soloImovelRural.mcpDescription.create,
  requiredPermissions: { soloImovelRural: ['create'] },
  schema: toMcpJsonSchema(soloImovelRuralCreateInputSchema),
  handler: async (params, context) => {
    return await soloImovelRuralCreateController(params, context);
  },
});

export async function soloImovelRuralCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      soloImovelRural: ['create'],
    },
    context,
  );
  return await soloImovelRuralCreate(body, context);
}

export async function soloImovelRuralCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = soloImovelRuralCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newSoloImovelRural = await tx.soloImovelRural.create({
        data: {
          nomeArea: data.nomeArea,
          areaHa: data.areaHa,
          percentualImovel: data.percentualImovel,
          profundidadeMediaCm: data.profundidadeMediaCm,
          declividadeMediaPercentual: data.declividadeMediaPercentual,
          phMedio: data.phMedio,
          materiaOrganicaPercentual: data.materiaOrganicaPercentual,
          teorArgilaPercentual: data.teorArgilaPercentual,
          teorAreiaPercentual: data.teorAreiaPercentual,
          teorSiltePercentual: data.teorSiltePercentual,
          capacidadeUso: data.capacidadeUso,
          usoAtual: data.usoAtual,
          usoRecomendado: data.usoRecomendado,
          necessitaCorrecao: data.necessitaCorrecao,
          correcaoRecomendada: data.correcaoRecomendada,
          analiseSoloData: data.analiseSoloData,
          analiseSoloArquivo: data.analiseSoloArquivo,
          mapaSoloArquivo: data.mapaSoloArquivo,
          arquivoKmlSolo: data.arquivoKmlSolo,
          observacoes: data.observacoes,
          imovel: prismaRelationship.connectOneOrThrow(data.imovel),
          tipoSolo: prismaRelationship.connectOneOrThrow(data.tipoSolo),
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
          tipoSolo: {
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
        entityId: newSoloImovelRural.id,
        entityName: 'SoloImovelRural',
        operation: auditLogOperations.create,
        context,
        newData: newSoloImovelRural,
        tx,
      });

      const soloImovelRural =
        await filePopulateDownloadUrlInTree(newSoloImovelRural);

      return soloImovelRural;
    },
  );
}
