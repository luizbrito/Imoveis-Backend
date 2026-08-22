import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { documentoPessoaCreateInputSchema } from '../documentoPessoaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const documentoPessoaCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/documento-pessoa',
  body: documentoPessoaCreateInputSchema,
  response: 'DocumentoPessoa',
};

export const documentoPessoaCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'documentoPessoa_create',
  description: dictionary.documentoPessoa.mcpDescription.create,
  requiredPermissions: { documentoPessoa: ['create'] },
  schema: toMcpJsonSchema(documentoPessoaCreateInputSchema),
  handler: async (params, context) => {
    return await documentoPessoaCreateController(params, context);
  },
});

export async function documentoPessoaCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      documentoPessoa: ['create'],
    },
    context,
  );
  return await documentoPessoaCreate(body, context);
}

export async function documentoPessoaCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = documentoPessoaCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newDocumentoPessoa = await tx.documentoPessoa.create({
        data: {
          titulo: data.titulo,
          tipo: data.tipo,
          numero: data.numero,
          dataEmissao: data.dataEmissao,
          dataValidade: data.dataValidade,
          arquivos: data.arquivos,
          statusValidacao: data.statusValidacao,
          observacoes: data.observacoes,
          proprietario: prismaRelationship.connectOne(data.proprietario),
          cliente: prismaRelationship.connectOne(data.cliente),
          corretor: prismaRelationship.connectOne(data.corretor),
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
          proprietario: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          cliente: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          corretor: {
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
        entityId: newDocumentoPessoa.id,
        entityName: 'DocumentoPessoa',
        operation: auditLogOperations.create,
        context,
        newData: newDocumentoPessoa,
        tx,
      });

      const documentoPessoa =
        await filePopulateDownloadUrlInTree(newDocumentoPessoa);

      return documentoPessoa;
    },
  );
}
