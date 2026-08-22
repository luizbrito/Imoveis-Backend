import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { producaoHistoricaRuralCreateInputSchema } from '../producaoHistoricaRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const producaoHistoricaRuralCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/producao-historica-rural',
  body: producaoHistoricaRuralCreateInputSchema,
  response: 'ProducaoHistoricaRural',
};

export const producaoHistoricaRuralCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'producaoHistoricaRural_create',
  description: dictionary.producaoHistoricaRural.mcpDescription.create,
  requiredPermissions: { producaoHistoricaRural: ['create'] },
  schema: toMcpJsonSchema(producaoHistoricaRuralCreateInputSchema),
  handler: async (params, context) => {
    return await producaoHistoricaRuralCreateController(params, context);
  },
});

export async function producaoHistoricaRuralCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      producaoHistoricaRural: ['create'],
    },
    context,
  );
  return await producaoHistoricaRuralCreate(body, context);
}

export async function producaoHistoricaRuralCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = producaoHistoricaRuralCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newProducaoHistoricaRural = await tx.producaoHistoricaRural.create({
        data: {
          safraAno: data.safraAno,
          atividade: data.atividade,
          areaHa: data.areaHa,
          producaoTotal: data.producaoTotal,
          unidadeProducao: data.unidadeProducao,
          produtividadePorHa: data.produtividadePorHa,
          cabecasMediaAno: data.cabecasMediaAno,
          uaHa: data.uaHa,
          observacoes: data.observacoes,
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
        entityId: newProducaoHistoricaRural.id,
        entityName: 'ProducaoHistoricaRural',
        operation: auditLogOperations.create,
        context,
        newData: newProducaoHistoricaRural,
        tx,
      });

      const producaoHistoricaRural = await filePopulateDownloadUrlInTree(
        newProducaoHistoricaRural,
      );

      return producaoHistoricaRural;
    },
  );
}
