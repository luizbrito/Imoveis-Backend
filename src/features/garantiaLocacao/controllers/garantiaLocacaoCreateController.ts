import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { garantiaLocacaoCreateInputSchema } from '../garantiaLocacaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const garantiaLocacaoCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/garantia-locacao',
  body: garantiaLocacaoCreateInputSchema,
  response: 'GarantiaLocacao',
};

export const garantiaLocacaoCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'garantiaLocacao_create',
  description: dictionary.garantiaLocacao.mcpDescription.create,
  requiredPermissions: { garantiaLocacao: ['create'] },
  schema: toMcpJsonSchema(garantiaLocacaoCreateInputSchema),
  handler: async (params, context) => {
    return await garantiaLocacaoCreateController(params, context);
  },
});

export async function garantiaLocacaoCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      garantiaLocacao: ['create'],
    },
    context,
  );
  return await garantiaLocacaoCreate(body, context);
}

export async function garantiaLocacaoCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = garantiaLocacaoCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newGarantiaLocacao = await tx.garantiaLocacao.create({
        data: {
          tipo: data.tipo,
          status: data.status,
          valorGarantia: data.valorGarantia,
          garantidorNome: data.garantidorNome,
          garantidorCpfCnpj: data.garantidorCpfCnpj,
          seguradora: data.seguradora,
          numeroApolice: data.numeroApolice,
          validadeAte: data.validadeAte,
          documentos: data.documentos,
          observacoes: data.observacoes,
          locacao: prismaRelationship.connectOneOrThrow(data.locacao),
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
          locacao: {
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
        entityId: newGarantiaLocacao.id,
        entityName: 'GarantiaLocacao',
        operation: auditLogOperations.create,
        context,
        newData: newGarantiaLocacao,
        tx,
      });

      const garantiaLocacao =
        await filePopulateDownloadUrlInTree(newGarantiaLocacao);

      return garantiaLocacao;
    },
  );
}
