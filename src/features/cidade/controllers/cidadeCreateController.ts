import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { cidadeCreateInputSchema } from '../cidadeSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const cidadeCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/cidade',
  body: cidadeCreateInputSchema,
  response: 'Cidade',
};

export const cidadeCreateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'cidade_create',
  description: dictionary.cidade.mcpDescription.create,
  requiredPermissions: { cidade: ['create'] },
  schema: toMcpJsonSchema(cidadeCreateInputSchema),
  handler: async (params, context) => {
    return await cidadeCreateController(params, context);
  },
});

export async function cidadeCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      cidade: ['create'],
    },
    context,
  );
  return await cidadeCreate(body, context);
}

export async function cidadeCreate(body: unknown, context: AppContext) {
  const currentOrganization = context.currentOrganization!;

  const data = cidadeCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newCidade = await tx.cidade.create({
        data: {
          nome: data.nome,
          codigoOficial: data.codigoOficial,
          codigoPostal: data.codigoPostal,
          latitude: data.latitude,
          longitude: data.longitude,
          ativo: data.ativo,
          observacoes: data.observacoes,
          estado: prismaRelationship.connectOneOrThrow(data.estado),
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
          imoveisCidade: {
            select: {
              id: true,
              titulo: true,
            },
          },
          estado: {
            select: {
              id: true,
              nome: true,
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
        entityId: newCidade.id,
        entityName: 'Cidade',
        operation: auditLogOperations.create,
        context,
        newData: newCidade,
        tx,
      });

      const cidade = await filePopulateDownloadUrlInTree(newCidade);

      return cidade;
    },
  );
}
