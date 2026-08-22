import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { solicitacaoContatoCreateInputSchema } from '../solicitacaoContatoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const solicitacaoContatoCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/solicitacao-contato',
  body: solicitacaoContatoCreateInputSchema,
  response: 'SolicitacaoContato',
};

export const solicitacaoContatoCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'solicitacaoContato_create',
  description: dictionary.solicitacaoContato.mcpDescription.create,
  requiredPermissions: { solicitacaoContato: ['create'] },
  schema: toMcpJsonSchema(solicitacaoContatoCreateInputSchema),
  handler: async (params, context) => {
    return await solicitacaoContatoCreateController(params, context);
  },
});

export async function solicitacaoContatoCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      solicitacaoContato: ['create'],
    },
    context,
  );
  return await solicitacaoContatoCreate(body, context);
}

export async function solicitacaoContatoCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = solicitacaoContatoCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newSolicitacaoContato = await tx.solicitacaoContato.create({
        data: {
          nome: data.nome,
          telefone: data.telefone,
          email: data.email,
          canalOrigem: data.canalOrigem,
          dataHora: data.dataHora,
          status: data.status,
          mensagem: data.mensagem,
          consentiuContato: data.consentiuContato,
          imovel: prismaRelationship.connectOne(data.imovel),
          anuncio: prismaRelationship.connectOne(data.anuncio),
          corretorResponsavel: prismaRelationship.connectOne(
            data.corretorResponsavel,
          ),
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
          anuncio: {
            select: {
              id: true,
              titulo: true,
            },
          },
          corretorResponsavel: {
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
        entityId: newSolicitacaoContato.id,
        entityName: 'SolicitacaoContato',
        operation: auditLogOperations.create,
        context,
        newData: newSolicitacaoContato,
        tx,
      });

      const solicitacaoContato = await filePopulateDownloadUrlInTree(
        newSolicitacaoContato,
      );

      return solicitacaoContato;
    },
  );
}
