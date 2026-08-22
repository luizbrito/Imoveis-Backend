import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { empreendimentoCreateInputSchema } from '../empreendimentoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const empreendimentoCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/empreendimento',
  body: empreendimentoCreateInputSchema,
  response: 'Empreendimento',
};

export const empreendimentoCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'empreendimento_create',
  description: dictionary.empreendimento.mcpDescription.create,
  requiredPermissions: { empreendimento: ['create'] },
  schema: toMcpJsonSchema(empreendimentoCreateInputSchema),
  handler: async (params, context) => {
    return await empreendimentoCreateController(params, context);
  },
});

export async function empreendimentoCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      empreendimento: ['create'],
    },
    context,
  );
  return await empreendimentoCreate(body, context);
}

export async function empreendimentoCreate(body: unknown, context: AppContext) {
  const currentOrganization = context.currentOrganization!;

  const data = empreendimentoCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newEmpreendimento = await tx.empreendimento.create({
        data: {
          nome: data.nome,
          incorporadora: data.incorporadora,
          construtora: data.construtora,
          status: data.status,
          dataLancamento: data.dataLancamento,
          previsaoEntrega: data.previsaoEntrega,
          cidade: data.cidade,
          bairro: data.bairro,
          endereco: data.endereco,
          descricao: data.descricao,
          diferenciais: data.diferenciais,
          imagens: data.imagens,
          documentos: data.documentos,
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
          unidades: {
            select: {
              id: true,
              titulo: true,
            },
          },
          arquivosKml: {
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
        entityId: newEmpreendimento.id,
        entityName: 'Empreendimento',
        operation: auditLogOperations.create,
        context,
        newData: newEmpreendimento,
        tx,
      });

      const empreendimento =
        await filePopulateDownloadUrlInTree(newEmpreendimento);

      return empreendimento;
    },
  );
}
