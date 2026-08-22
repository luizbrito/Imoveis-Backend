import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { chaveImovelCreateInputSchema } from '../chaveImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const chaveImovelCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/chave-imovel',
  body: chaveImovelCreateInputSchema,
  response: 'ChaveImovel',
};

export const chaveImovelCreateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'chaveImovel_create',
  description: dictionary.chaveImovel.mcpDescription.create,
  requiredPermissions: { chaveImovel: ['create'] },
  schema: toMcpJsonSchema(chaveImovelCreateInputSchema),
  handler: async (params, context) => {
    return await chaveImovelCreateController(params, context);
  },
});

export async function chaveImovelCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      chaveImovel: ['create'],
    },
    context,
  );
  return await chaveImovelCreate(body, context);
}

export async function chaveImovelCreate(body: unknown, context: AppContext) {
  const currentOrganization = context.currentOrganization!;

  const data = chaveImovelCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const duplicatedCodigo = await tx.chaveImovel.count({
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
            context.dictionary.chaveImovel.fields.codigo,
          ),
        );
      }

      const newChaveImovel = await tx.chaveImovel.create({
        data: {
          codigo: data.codigo,
          tipo: data.tipo,
          status: data.status,
          localArmazenamento: data.localArmazenamento,
          dataRetirada: data.dataRetirada,
          dataPrevistaDevolucao: data.dataPrevistaDevolucao,
          dataDevolucao: data.dataDevolucao,
          retiradaPor: data.retiradaPor,
          telefoneRetirada: data.telefoneRetirada,
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
        entityId: newChaveImovel.id,
        entityName: 'ChaveImovel',
        operation: auditLogOperations.create,
        context,
        newData: newChaveImovel,
        tx,
      });

      const chaveImovel = await filePopulateDownloadUrlInTree(newChaveImovel);

      return chaveImovel;
    },
  );
}
