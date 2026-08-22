import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { ativoIncluidoVendaRuralCreateInputSchema } from '../ativoIncluidoVendaRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const ativoIncluidoVendaRuralCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/ativo-incluido-venda-rural',
  body: ativoIncluidoVendaRuralCreateInputSchema,
  response: 'AtivoIncluidoVendaRural',
};

export const ativoIncluidoVendaRuralCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'ativoIncluidoVendaRural_create',
  description: dictionary.ativoIncluidoVendaRural.mcpDescription.create,
  requiredPermissions: { ativoIncluidoVendaRural: ['create'] },
  schema: toMcpJsonSchema(ativoIncluidoVendaRuralCreateInputSchema),
  handler: async (params, context) => {
    return await ativoIncluidoVendaRuralCreateController(params, context);
  },
});

export async function ativoIncluidoVendaRuralCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      ativoIncluidoVendaRural: ['create'],
    },
    context,
  );
  return await ativoIncluidoVendaRuralCreate(body, context);
}

export async function ativoIncluidoVendaRuralCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = ativoIncluidoVendaRuralCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newAtivoIncluidoVendaRural =
        await tx.ativoIncluidoVendaRural.create({
          data: {
            nome: data.nome,
            tipo: data.tipo,
            descricao: data.descricao,
            quantidade: data.quantidade,
            valorEstimado: data.valorEstimado,
            moeda: data.moeda,
            incluidoPreco: data.incluidoPreco,
            documentos: data.documentos,
            fotos: data.fotos,
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
        entityId: newAtivoIncluidoVendaRural.id,
        entityName: 'AtivoIncluidoVendaRural',
        operation: auditLogOperations.create,
        context,
        newData: newAtivoIncluidoVendaRural,
        tx,
      });

      const ativoIncluidoVendaRural = await filePopulateDownloadUrlInTree(
        newAtivoIncluidoVendaRural,
      );

      return ativoIncluidoVendaRural;
    },
  );
}
