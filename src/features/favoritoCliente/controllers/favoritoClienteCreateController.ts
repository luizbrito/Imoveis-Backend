import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { favoritoClienteCreateInputSchema } from '../favoritoClienteSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const favoritoClienteCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/favorito-cliente',
  body: favoritoClienteCreateInputSchema,
  response: 'FavoritoCliente',
};

export const favoritoClienteCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'favoritoCliente_create',
  description: dictionary.favoritoCliente.mcpDescription.create,
  requiredPermissions: { favoritoCliente: ['create'] },
  schema: toMcpJsonSchema(favoritoClienteCreateInputSchema),
  handler: async (params, context) => {
    return await favoritoClienteCreateController(params, context);
  },
});

export async function favoritoClienteCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      favoritoCliente: ['create'],
    },
    context,
  );
  return await favoritoClienteCreate(body, context);
}

export async function favoritoClienteCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = favoritoClienteCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newFavoritoCliente = await tx.favoritoCliente.create({
        data: {
          dataInclusao: data.dataInclusao,
          observacoes: data.observacoes,
          ativo: data.ativo,
          cliente: prismaRelationship.connectOneOrThrow(data.cliente),
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
          cliente: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
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
        entityId: newFavoritoCliente.id,
        entityName: 'FavoritoCliente',
        operation: auditLogOperations.create,
        context,
        newData: newFavoritoCliente,
        tx,
      });

      const favoritoCliente =
        await filePopulateDownloadUrlInTree(newFavoritoCliente);

      return favoritoCliente;
    },
  );
}
