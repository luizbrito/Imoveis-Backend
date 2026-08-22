import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { sistemaProdutivoRuralCreateInputSchema } from '../sistemaProdutivoRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const sistemaProdutivoRuralCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/sistema-produtivo-rural',
  body: sistemaProdutivoRuralCreateInputSchema,
  response: 'SistemaProdutivoRural',
};

export const sistemaProdutivoRuralCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'sistemaProdutivoRural_create',
  description: dictionary.sistemaProdutivoRural.mcpDescription.create,
  requiredPermissions: { sistemaProdutivoRural: ['create'] },
  schema: toMcpJsonSchema(sistemaProdutivoRuralCreateInputSchema),
  handler: async (params, context) => {
    return await sistemaProdutivoRuralCreateController(params, context);
  },
});

export async function sistemaProdutivoRuralCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      sistemaProdutivoRural: ['create'],
    },
    context,
  );
  return await sistemaProdutivoRuralCreate(body, context);
}

export async function sistemaProdutivoRuralCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = sistemaProdutivoRuralCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newSistemaProdutivoRural = await tx.sistemaProdutivoRural.create({
        data: {
          nome: data.nome,
          tipo: data.tipo,
          areaHa: data.areaHa,
          irrigado: data.irrigado,
          tipoIrrigacao: data.tipoIrrigacao,
          quantidadePivos: data.quantidadePivos,
          areaIrrigadaHa: data.areaIrrigadaHa,
          fonteAgua: data.fonteAgua,
          capacidadeIrrigacaoHa: data.capacidadeIrrigacaoHa,
          certificadoOrganico: data.certificadoOrganico,
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
        entityId: newSistemaProdutivoRural.id,
        entityName: 'SistemaProdutivoRural',
        operation: auditLogOperations.create,
        context,
        newData: newSistemaProdutivoRural,
        tx,
      });

      const sistemaProdutivoRural = await filePopulateDownloadUrlInTree(
        newSistemaProdutivoRural,
      );

      return sistemaProdutivoRural;
    },
  );
}
