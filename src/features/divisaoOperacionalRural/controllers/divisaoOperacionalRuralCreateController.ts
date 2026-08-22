import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { divisaoOperacionalRuralCreateInputSchema } from '../divisaoOperacionalRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const divisaoOperacionalRuralCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/divisao-operacional-rural',
  body: divisaoOperacionalRuralCreateInputSchema,
  response: 'DivisaoOperacionalRural',
};

export const divisaoOperacionalRuralCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'divisaoOperacionalRural_create',
  description: dictionary.divisaoOperacionalRural.mcpDescription.create,
  requiredPermissions: { divisaoOperacionalRural: ['create'] },
  schema: toMcpJsonSchema(divisaoOperacionalRuralCreateInputSchema),
  handler: async (params, context) => {
    return await divisaoOperacionalRuralCreateController(params, context);
  },
});

export async function divisaoOperacionalRuralCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      divisaoOperacionalRural: ['create'],
    },
    context,
  );
  return await divisaoOperacionalRuralCreate(body, context);
}

export async function divisaoOperacionalRuralCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = divisaoOperacionalRuralCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newDivisaoOperacionalRural =
        await tx.divisaoOperacionalRural.create({
          data: {
            nome: data.nome,
            tipo: data.tipo,
            areaHa: data.areaHa,
            usoAtual: data.usoAtual,
            capacidadeCabecas: data.capacidadeCabecas,
            cercaTipo: data.cercaTipo,
            cercaEstado: data.cercaEstado,
            bebedouro: data.bebedouro,
            cocho: data.cocho,
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
        entityId: newDivisaoOperacionalRural.id,
        entityName: 'DivisaoOperacionalRural',
        operation: auditLogOperations.create,
        context,
        newData: newDivisaoOperacionalRural,
        tx,
      });

      const divisaoOperacionalRural = await filePopulateDownloadUrlInTree(
        newDivisaoOperacionalRural,
      );

      return divisaoOperacionalRural;
    },
  );
}
