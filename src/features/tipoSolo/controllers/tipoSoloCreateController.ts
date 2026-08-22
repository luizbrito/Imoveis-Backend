import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { tipoSoloCreateInputSchema } from '../tipoSoloSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const tipoSoloCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/tipo-solo',
  body: tipoSoloCreateInputSchema,
  response: 'TipoSolo',
};

export const tipoSoloCreateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'tipoSolo_create',
  description: dictionary.tipoSolo.mcpDescription.create,
  requiredPermissions: { tipoSolo: ['create'] },
  schema: toMcpJsonSchema(tipoSoloCreateInputSchema),
  handler: async (params, context) => {
    return await tipoSoloCreateController(params, context);
  },
});

export async function tipoSoloCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      tipoSolo: ['create'],
    },
    context,
  );
  return await tipoSoloCreate(body, context);
}

export async function tipoSoloCreate(body: unknown, context: AppContext) {
  const currentOrganization = context.currentOrganization!;

  const data = tipoSoloCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newTipoSolo = await tx.tipoSolo.create({
        data: {
          nome: data.nome,
          codigo: data.codigo,
          descricao: data.descricao,
          classeTextural: data.classeTextural,
          origem: data.origem,
          corPredominante: data.corPredominante,
          drenagem: data.drenagem,
          fertilidadeNatural: data.fertilidadeNatural,
          materiaOrganica: data.materiaOrganica,
          acidez: data.acidez,
          riscoErosao: data.riscoErosao,
          riscoCompactacao: data.riscoCompactacao,
          riscoEncharcamento: data.riscoEncharcamento,
          aptidaoAgricola: data.aptidaoAgricola,
          aptidaoPastagem: data.aptidaoPastagem,
          aptidaoFlorestal: data.aptidaoFlorestal,
          observacoes: data.observacoes,
          fonteClassificacao: data.fonteClassificacao,
          mapaReferencia: data.mapaReferencia,
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
          areasImoveis: {
            select: {
              id: true,
              nomeArea: true,
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
        entityId: newTipoSolo.id,
        entityName: 'TipoSolo',
        operation: auditLogOperations.create,
        context,
        newData: newTipoSolo,
        tx,
      });

      const tipoSolo = await filePopulateDownloadUrlInTree(newTipoSolo);

      return tipoSolo;
    },
  );
}
