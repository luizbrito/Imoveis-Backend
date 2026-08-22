import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { pistaAviacaoRuralCreateInputSchema } from '../pistaAviacaoRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const pistaAviacaoRuralCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/pista-aviacao-rural',
  body: pistaAviacaoRuralCreateInputSchema,
  response: 'PistaAviacaoRural',
};

export const pistaAviacaoRuralCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'pistaAviacaoRural_create',
  description: dictionary.pistaAviacaoRural.mcpDescription.create,
  requiredPermissions: { pistaAviacaoRural: ['create'] },
  schema: toMcpJsonSchema(pistaAviacaoRuralCreateInputSchema),
  handler: async (params, context) => {
    return await pistaAviacaoRuralCreateController(params, context);
  },
});

export async function pistaAviacaoRuralCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      pistaAviacaoRural: ['create'],
    },
    context,
  );
  return await pistaAviacaoRuralCreate(body, context);
}

export async function pistaAviacaoRuralCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = pistaAviacaoRuralCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newPistaAviacaoRural = await tx.pistaAviacaoRural.create({
        data: {
          nome: data.nome,
          habilitada: data.habilitada,
          situacaoHabilitacao: data.situacaoHabilitacao,
          comprimentoM: data.comprimentoM,
          larguraM: data.larguraM,
          tipoPiso: data.tipoPiso,
          orientacao: data.orientacao,
          latitude: data.latitude,
          longitude: data.longitude,
          usoNoturno: data.usoNoturno,
          hangar: data.hangar,
          combustivelDisponivel: data.combustivelDisponivel,
          documentoHabilitacao: data.documentoHabilitacao,
          fotos: data.fotos,
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
        entityId: newPistaAviacaoRural.id,
        entityName: 'PistaAviacaoRural',
        operation: auditLogOperations.create,
        context,
        newData: newPistaAviacaoRural,
        tx,
      });

      const pistaAviacaoRural =
        await filePopulateDownloadUrlInTree(newPistaAviacaoRural);

      return pistaAviacaoRural;
    },
  );
}
