import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { benfeitoriaRuralCreateInputSchema } from '../benfeitoriaRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const benfeitoriaRuralCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/benfeitoria-rural',
  body: benfeitoriaRuralCreateInputSchema,
  response: 'BenfeitoriaRural',
};

export const benfeitoriaRuralCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'benfeitoriaRural_create',
  description: dictionary.benfeitoriaRural.mcpDescription.create,
  requiredPermissions: { benfeitoriaRural: ['create'] },
  schema: toMcpJsonSchema(benfeitoriaRuralCreateInputSchema),
  handler: async (params, context) => {
    return await benfeitoriaRuralCreateController(params, context);
  },
});

export async function benfeitoriaRuralCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      benfeitoriaRural: ['create'],
    },
    context,
  );
  return await benfeitoriaRuralCreate(body, context);
}

export async function benfeitoriaRuralCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = benfeitoriaRuralCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newBenfeitoriaRural = await tx.benfeitoriaRural.create({
        data: {
          nome: data.nome,
          tipo: data.tipo,
          quantidade: data.quantidade,
          areaConstruidaM2: data.areaConstruidaM2,
          anoConstrucao: data.anoConstrucao,
          estadoConservacao: data.estadoConservacao,
          valorEstimado: data.valorEstimado,
          moeda: data.moeda,
          incluidaVenda: data.incluidaVenda,
          fotos: data.fotos,
          documentos: data.documentos,
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
        entityId: newBenfeitoriaRural.id,
        entityName: 'BenfeitoriaRural',
        operation: auditLogOperations.create,
        context,
        newData: newBenfeitoriaRural,
        tx,
      });

      const benfeitoriaRural =
        await filePopulateDownloadUrlInTree(newBenfeitoriaRural);

      return benfeitoriaRural;
    },
  );
}
