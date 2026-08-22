import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { participanteLocacaoArchiveManyInputSchema as participanteLocacaoArchiveManyInputSchema } from '../participanteLocacaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const participanteLocacaoArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/participante-locacao/archive',
  query: participanteLocacaoArchiveManyInputSchema,
};

export const participanteLocacaoArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'participante-locacao_archive_many',
  description: dictionary.participanteLocacao.mcpDescription.archive,
  requiredPermissions: { participanteLocacao: ['archive'] },
  schema: toMcpJsonSchema(participanteLocacaoArchiveManyInputSchema),
  handler: async (params, context) => {
    return await participanteLocacaoArchiveManyController(params, context);
  },
});

export async function participanteLocacaoArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      participanteLocacao: ['archive'],
    },
    context,
  );

  const { ids } = participanteLocacaoArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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
