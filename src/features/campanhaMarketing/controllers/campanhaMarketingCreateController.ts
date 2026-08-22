import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { campanhaMarketingCreateInputSchema } from '../campanhaMarketingSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const campanhaMarketingCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/campanha-marketing',
  body: campanhaMarketingCreateInputSchema,
  response: 'CampanhaMarketing',
};

export const campanhaMarketingCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'campanhaMarketing_create',
  description: dictionary.campanhaMarketing.mcpDescription.create,
  requiredPermissions: { campanhaMarketing: ['create'] },
  schema: toMcpJsonSchema(campanhaMarketingCreateInputSchema),
  handler: async (params, context) => {
    return await campanhaMarketingCreateController(params, context);
  },
});

export async function campanhaMarketingCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      campanhaMarketing: ['create'],
    },
    context,
  );
  return await campanhaMarketingCreate(body, context);
}

export async function campanhaMarketingCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = campanhaMarketingCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newCampanhaMarketing = await tx.campanhaMarketing.create({
        data: {
          nome: data.nome,
          tipo: data.tipo,
          status: data.status,
          dataInicio: data.dataInicio,
          dataFim: data.dataFim,
          orcamento: data.orcamento,
          custoReal: data.custoReal,
          quantidadeLeads: data.quantidadeLeads,
          quantidadeConversoes: data.quantidadeConversoes,
          observacoes: data.observacoes,
          filial: prismaRelationship.connectOneOrThrow(data.filial),
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
          anunciosVinculados: {
            select: {
              id: true,
              dataInclusao: true,
            },
          },
          leadsGerados: {
            select: {
              id: true,
              nome: true,
            },
          },
          filial: {
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
        entityId: newCampanhaMarketing.id,
        entityName: 'CampanhaMarketing',
        operation: auditLogOperations.create,
        context,
        newData: newCampanhaMarketing,
        tx,
      });

      const campanhaMarketing =
        await filePopulateDownloadUrlInTree(newCampanhaMarketing);

      return campanhaMarketing;
    },
  );
}
