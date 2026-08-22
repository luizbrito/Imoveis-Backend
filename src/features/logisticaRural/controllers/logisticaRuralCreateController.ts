import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { logisticaRuralCreateInputSchema } from '../logisticaRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const logisticaRuralCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/logistica-rural',
  body: logisticaRuralCreateInputSchema,
  response: 'LogisticaRural',
};

export const logisticaRuralCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'logisticaRural_create',
  description: dictionary.logisticaRural.mcpDescription.create,
  requiredPermissions: { logisticaRural: ['create'] },
  schema: toMcpJsonSchema(logisticaRuralCreateInputSchema),
  handler: async (params, context) => {
    return await logisticaRuralCreateController(params, context);
  },
});

export async function logisticaRuralCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      logisticaRural: ['create'],
    },
    context,
  );
  return await logisticaRuralCreate(body, context);
}

export async function logisticaRuralCreate(body: unknown, context: AppContext) {
  const currentOrganization = context.currentOrganization!;

  const data = logisticaRuralCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newLogisticaRural = await tx.logisticaRural.create({
        data: {
          descricao: data.descricao,
          tipoAcessoPrincipal: data.tipoAcessoPrincipal,
          distanciaAsfaltoKm: data.distanciaAsfaltoKm,
          transitavelAnoTodo: data.transitavelAnoTodo,
          restricaoEpocaChuva: data.restricaoEpocaChuva,
          acessoCaminhaoBitrem: data.acessoCaminhaoBitrem,
          acessoRodotrem: data.acessoRodotrem,
          distanciaCidadeKm: data.distanciaCidadeKm,
          distanciaSiloKm: data.distanciaSiloKm,
          distanciaFrigorificoKm: data.distanciaFrigorificoKm,
          distanciaCooperativaKm: data.distanciaCooperativaKm,
          distanciaPortoKm: data.distanciaPortoKm,
          distanciaFerroviaKm: data.distanciaFerroviaKm,
          distanciaAeroportoKm: data.distanciaAeroportoKm,
          distanciaRodoviaPrincipalKm: data.distanciaRodoviaPrincipalKm,
          pontesInternas: data.pontesInternas,
          estradasInternasKm: data.estradasInternasKm,
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
        entityId: newLogisticaRural.id,
        entityName: 'LogisticaRural',
        operation: auditLogOperations.create,
        context,
        newData: newLogisticaRural,
        tx,
      });

      const logisticaRural =
        await filePopulateDownloadUrlInTree(newLogisticaRural);

      return logisticaRural;
    },
  );
}
