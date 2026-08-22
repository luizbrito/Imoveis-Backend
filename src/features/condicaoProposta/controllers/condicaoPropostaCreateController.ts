import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { condicaoPropostaCreateInputSchema } from '../condicaoPropostaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const condicaoPropostaCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/condicao-proposta',
  body: condicaoPropostaCreateInputSchema,
  response: 'CondicaoProposta',
};

export const condicaoPropostaCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'condicaoProposta_create',
  description: dictionary.condicaoProposta.mcpDescription.create,
  requiredPermissions: { condicaoProposta: ['create'] },
  schema: toMcpJsonSchema(condicaoPropostaCreateInputSchema),
  handler: async (params, context) => {
    return await condicaoPropostaCreateController(params, context);
  },
});

export async function condicaoPropostaCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      condicaoProposta: ['create'],
    },
    context,
  );
  return await condicaoPropostaCreate(body, context);
}

export async function condicaoPropostaCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = condicaoPropostaCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newCondicaoProposta = await tx.condicaoProposta.create({
        data: {
          ordem: data.ordem,
          tipo: data.tipo,
          descricao: data.descricao,
          obrigatoria: data.obrigatoria,
          atendida: data.atendida,
          proposta: prismaRelationship.connectOneOrThrow(data.proposta),
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
          proposta: {
            select: {
              id: true,
              codigo: true,
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
        entityId: newCondicaoProposta.id,
        entityName: 'CondicaoProposta',
        operation: auditLogOperations.create,
        context,
        newData: newCondicaoProposta,
        tx,
      });

      const condicaoProposta =
        await filePopulateDownloadUrlInTree(newCondicaoProposta);

      return condicaoProposta;
    },
  );
}
