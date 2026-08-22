import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { avaliacaoImovelCreateInputSchema } from '../avaliacaoImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const avaliacaoImovelCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/avaliacao-imovel',
  body: avaliacaoImovelCreateInputSchema,
  response: 'AvaliacaoImovel',
};

export const avaliacaoImovelCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'avaliacaoImovel_create',
  description: dictionary.avaliacaoImovel.mcpDescription.create,
  requiredPermissions: { avaliacaoImovel: ['create'] },
  schema: toMcpJsonSchema(avaliacaoImovelCreateInputSchema),
  handler: async (params, context) => {
    return await avaliacaoImovelCreateController(params, context);
  },
});

export async function avaliacaoImovelCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      avaliacaoImovel: ['create'],
    },
    context,
  );
  return await avaliacaoImovelCreate(body, context);
}

export async function avaliacaoImovelCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = avaliacaoImovelCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const duplicatedCodigo = await tx.avaliacaoImovel.count({
        where: {
          codigo: {
            equals: data.codigo,
            mode: 'insensitive',
          },
          organizationId: currentOrganization.id,
        },
      });

      if (duplicatedCodigo) {
        throw new Error400(
          dictionaryFormat(
            context.dictionary.shared.errors.unique,
            context.dictionary.avaliacaoImovel.fields.codigo,
          ),
        );
      }

      const newAvaliacaoImovel = await tx.avaliacaoImovel.create({
        data: {
          codigo: data.codigo,
          dataAvaliacao: data.dataAvaliacao,
          metodo: data.metodo,
          valorMercado: data.valorMercado,
          valorVendaRapida: data.valorVendaRapida,
          valorLocacaoEstimado: data.valorLocacaoEstimado,
          moeda: data.moeda,
          validadeAte: data.validadeAte,
          laudo: data.laudo,
          criterios: data.criterios,
          imovel: prismaRelationship.connectOneOrThrow(data.imovel),
          avaliador: prismaRelationship.connectOneOrThrow(data.avaliador),
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
          avaliador: {
            select: {
              id: true,
              nomeCompleto: true,
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
        entityId: newAvaliacaoImovel.id,
        entityName: 'AvaliacaoImovel',
        operation: auditLogOperations.create,
        context,
        newData: newAvaliacaoImovel,
        tx,
      });

      const avaliacaoImovel =
        await filePopulateDownloadUrlInTree(newAvaliacaoImovel);

      return avaliacaoImovel;
    },
  );
}
