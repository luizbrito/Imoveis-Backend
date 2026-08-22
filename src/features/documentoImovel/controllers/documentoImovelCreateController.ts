import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { documentoImovelCreateInputSchema } from '../documentoImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const documentoImovelCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/documento-imovel',
  body: documentoImovelCreateInputSchema,
  response: 'DocumentoImovel',
};

export const documentoImovelCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'documentoImovel_create',
  description: dictionary.documentoImovel.mcpDescription.create,
  requiredPermissions: { documentoImovel: ['create'] },
  schema: toMcpJsonSchema(documentoImovelCreateInputSchema),
  handler: async (params, context) => {
    return await documentoImovelCreateController(params, context);
  },
});

export async function documentoImovelCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      documentoImovel: ['create'],
    },
    context,
  );
  return await documentoImovelCreate(body, context);
}

export async function documentoImovelCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = documentoImovelCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newDocumentoImovel = await tx.documentoImovel.create({
        data: {
          titulo: data.titulo,
          tipo: data.tipo,
          numeroDocumento: data.numeroDocumento,
          dataEmissao: data.dataEmissao,
          dataValidade: data.dataValidade,
          arquivos: data.arquivos,
          visibilidade: data.visibilidade,
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
        entityId: newDocumentoImovel.id,
        entityName: 'DocumentoImovel',
        operation: auditLogOperations.create,
        context,
        newData: newDocumentoImovel,
        tx,
      });

      const documentoImovel =
        await filePopulateDownloadUrlInTree(newDocumentoImovel);

      return documentoImovel;
    },
  );
}
