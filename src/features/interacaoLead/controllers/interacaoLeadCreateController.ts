import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { interacaoLeadCreateInputSchema } from '../interacaoLeadSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const interacaoLeadCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/interacao-lead',
  body: interacaoLeadCreateInputSchema,
  response: 'InteracaoLead',
};

export const interacaoLeadCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'interacaoLead_create',
  description: dictionary.interacaoLead.mcpDescription.create,
  requiredPermissions: { interacaoLead: ['create'] },
  schema: toMcpJsonSchema(interacaoLeadCreateInputSchema),
  handler: async (params, context) => {
    return await interacaoLeadCreateController(params, context);
  },
});

export async function interacaoLeadCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      interacaoLead: ['create'],
    },
    context,
  );
  return await interacaoLeadCreate(body, context);
}

export async function interacaoLeadCreate(body: unknown, context: AppContext) {
  const currentOrganization = context.currentOrganization!;

  const data = interacaoLeadCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newInteracaoLead = await tx.interacaoLead.create({
        data: {
          dataHora: data.dataHora,
          tipo: data.tipo,
          resultado: data.resultado,
          assunto: data.assunto,
          descricao: data.descricao,
          proximaAcao: data.proximaAcao,
          dataProximaAcao: data.dataProximaAcao,
          lead: prismaRelationship.connectOneOrThrow(data.lead),
          corretor: prismaRelationship.connectOneOrThrow(data.corretor),
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
          lead: {
            select: {
              id: true,
              nome: true,
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
        entityId: newInteracaoLead.id,
        entityName: 'InteracaoLead',
        operation: auditLogOperations.create,
        context,
        newData: newInteracaoLead,
        tx,
      });

      const interacaoLead =
        await filePopulateDownloadUrlInTree(newInteracaoLead);

      return interacaoLead;
    },
  );
}
