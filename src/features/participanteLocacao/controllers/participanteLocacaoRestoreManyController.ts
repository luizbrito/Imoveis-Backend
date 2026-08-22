import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { participanteLocacaoRestoreManyInputSchema } from '../participanteLocacaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const participanteLocacaoRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/participante-locacao/restore',
  query: participanteLocacaoRestoreManyInputSchema,
};

export const participanteLocacaoRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'participante-locacao_restore_many',
  description: dictionary.participanteLocacao.mcpDescription.restore,
  requiredPermissions: { participanteLocacao: ['restore'] },
  schema: toMcpJsonSchema(participanteLocacaoRestoreManyInputSchema),
  handler: async (params, context) => {
    return await participanteLocacaoRestoreManyController(params, context);
  },
});

export async function participanteLocacaoRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      participanteLocacao: ['restore'],
    },
    context,
  );

  const { ids } = participanteLocacaoRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldParticipantesLocacao = await tx.participanteLocacao.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        select: {
          id: true,
          archivedAt: true,
          archivedByMemberId: true,
        },
      });

      const result = await tx.participanteLocacao.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newParticipantesLocacao = await tx.participanteLocacao.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        select: {
          id: true,
          archivedAt: true,
          archivedByMemberId: true,
        },
      });

      for (const oldParticipanteLocacao of oldParticipantesLocacao) {
        const newParticipanteLocacao = newParticipantesLocacao.find(
          (c) => c.id === oldParticipanteLocacao.id,
        );
        await auditLogCreate({
          entityId: oldParticipanteLocacao.id,
          entityName: 'ParticipanteLocacao',
          operation: auditLogOperations.update,
          context,
          oldData: oldParticipanteLocacao,
          newData: newParticipanteLocacao,
          tx,
        });
      }

      return result;
    },
  );
}
