import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { consentimentoLGPDCreateInputSchema } from '../consentimentoLGPDSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const consentimentoLGPDCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/consentimento-l-g-p-d',
  body: consentimentoLGPDCreateInputSchema,
  response: 'ConsentimentoLGPD',
};

export const consentimentoLGPDCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'consentimentoLGPD_create',
  description: dictionary.consentimentoLGPD.mcpDescription.create,
  requiredPermissions: { consentimentoLGPD: ['create'] },
  schema: toMcpJsonSchema(consentimentoLGPDCreateInputSchema),
  handler: async (params, context) => {
    return await consentimentoLGPDCreateController(params, context);
  },
});

export async function consentimentoLGPDCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      consentimentoLGPD: ['create'],
    },
    context,
  );
  return await consentimentoLGPDCreate(body, context);
}

export async function consentimentoLGPDCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = consentimentoLGPDCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newConsentimentoLGPD = await tx.consentimentoLGPD.create({
        data: {
          tipo: data.tipo,
          versaoTermo: data.versaoTermo,
          dataConsentimento: data.dataConsentimento,
          status: data.status,
          dataRevogacao: data.dataRevogacao,
          ipOrigem: data.ipOrigem,
          canal: data.canal,
          comprovante: data.comprovante,
          observacoes: data.observacoes,
          cliente: prismaRelationship.connectOne(data.cliente),
          proprietario: prismaRelationship.connectOne(data.proprietario),
          lead: prismaRelationship.connectOne(data.lead),
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
          proprietario: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          lead: {
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
        entityId: newConsentimentoLGPD.id,
        entityName: 'ConsentimentoLGPD',
        operation: auditLogOperations.create,
        context,
        newData: newConsentimentoLGPD,
        tx,
      });

      const consentimentoLGPD =
        await filePopulateDownloadUrlInTree(newConsentimentoLGPD);

      return consentimentoLGPD;
    },
  );
}
