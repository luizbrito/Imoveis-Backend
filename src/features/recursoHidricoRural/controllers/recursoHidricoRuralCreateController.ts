import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { recursoHidricoRuralCreateInputSchema } from '../recursoHidricoRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const recursoHidricoRuralCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/recurso-hidrico-rural',
  body: recursoHidricoRuralCreateInputSchema,
  response: 'RecursoHidricoRural',
};

export const recursoHidricoRuralCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'recursoHidricoRural_create',
  description: dictionary.recursoHidricoRural.mcpDescription.create,
  requiredPermissions: { recursoHidricoRural: ['create'] },
  schema: toMcpJsonSchema(recursoHidricoRuralCreateInputSchema),
  handler: async (params, context) => {
    return await recursoHidricoRuralCreateController(params, context);
  },
});

export async function recursoHidricoRuralCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      recursoHidricoRural: ['create'],
    },
    context,
  );
  return await recursoHidricoRuralCreate(body, context);
}

export async function recursoHidricoRuralCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = recursoHidricoRuralCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newRecursoHidricoRural = await tx.recursoHidricoRural.create({
        data: {
          nome: data.nome,
          tipo: data.tipo,
          perene: data.perene,
          navegavel: data.navegavel,
          extensaoNaPropriedadeKm: data.extensaoNaPropriedadeKm,
          frentePropriedadeKm: data.frentePropriedadeKm,
          vazaoEstimada: data.vazaoEstimada,
          unidadeVazao: data.unidadeVazao,
          qualidadeAgua: data.qualidadeAgua,
          sazonalidade: data.sazonalidade,
          usoGado: data.usoGado,
          usoIrrigacao: data.usoIrrigacao,
          usoHumano: data.usoHumano,
          capacidadeAbastecimentoCabecas: data.capacidadeAbastecimentoCabecas,
          areaIrrigavelHa: data.areaIrrigavelHa,
          outorgaNecessaria: data.outorgaNecessaria,
          outorgaSituacao: data.outorgaSituacao,
          documentoOutorga: data.documentoOutorga,
          kml: data.kml,
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
        entityId: newRecursoHidricoRural.id,
        entityName: 'RecursoHidricoRural',
        operation: auditLogOperations.create,
        context,
        newData: newRecursoHidricoRural,
        tx,
      });

      const recursoHidricoRural = await filePopulateDownloadUrlInTree(
        newRecursoHidricoRural,
      );

      return recursoHidricoRural;
    },
  );
}
