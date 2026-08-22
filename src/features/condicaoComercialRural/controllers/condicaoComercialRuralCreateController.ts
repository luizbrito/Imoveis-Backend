import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { condicaoComercialRuralCreateInputSchema } from '../condicaoComercialRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const condicaoComercialRuralCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/condicao-comercial-rural',
  body: condicaoComercialRuralCreateInputSchema,
  response: 'CondicaoComercialRural',
};

export const condicaoComercialRuralCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'condicaoComercialRural_create',
  description: dictionary.condicaoComercialRural.mcpDescription.create,
  requiredPermissions: { condicaoComercialRural: ['create'] },
  schema: toMcpJsonSchema(condicaoComercialRuralCreateInputSchema),
  handler: async (params, context) => {
    return await condicaoComercialRuralCreateController(params, context);
  },
});

export async function condicaoComercialRuralCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      condicaoComercialRural: ['create'],
    },
    context,
  );
  return await condicaoComercialRuralCreate(body, context);
}

export async function condicaoComercialRuralCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = condicaoComercialRuralCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newCondicaoComercialRural = await tx.condicaoComercialRural.create({
        data: {
          precoPorHa: data.precoPorHa,
          moeda: data.moeda,
          valorTotal: data.valorTotal,
          aceitaParcelamento: data.aceitaParcelamento,
          percentualEntrada: data.percentualEntrada,
          numeroParcelas: data.numeroParcelas,
          aceitaPermuta: data.aceitaPermuta,
          aceitaFinanciamento: data.aceitaFinanciamento,
          comissaoImobiliariaPercentual: data.comissaoImobiliariaPercentual,
          comissaoCorretorPercentual: data.comissaoCorretorPercentual,
          exclusividade: data.exclusividade,
          dataInicioExclusividade: data.dataInicioExclusividade,
          dataFimExclusividade: data.dataFimExclusividade,
          motivoVenda: data.motivoVenda,
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
        entityId: newCondicaoComercialRural.id,
        entityName: 'CondicaoComercialRural',
        operation: auditLogOperations.create,
        context,
        newData: newCondicaoComercialRural,
        tx,
      });

      const condicaoComercialRural = await filePopulateDownloadUrlInTree(
        newCondicaoComercialRural,
      );

      return condicaoComercialRural;
    },
  );
}
