import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { participanteLocacaoDeleteManyInputSchema } from '../participanteLocacaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const participanteLocacaoDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/participante-locacao',
  query: participanteLocacaoDeleteManyInputSchema,
};

export const participanteLocacaoDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'participanteLocacao_delete_many',
  description: dictionary.participanteLocacao.mcpDescription.delete,
  requiredPermissions: { participanteLocacao: ['delete'] },
  schema: toMcpJsonSchema(participanteLocacaoDeleteManyInputSchema),
  handler: async (params, context) => {
    return await participanteLocacaoDeleteManyController(params, context);
  },
});

export async function participanteLocacaoDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      participanteLocacao: ['delete'],
    },
    context,
  );

  const { ids } = participanteLocacaoDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const participantesLocacaoToDelete =
        await tx.participanteLocacao.findMany({
          where: {
            id: { in: ids },
            organizationId: currentOrganization.id,
          },
          include: {
            locacao: {
              select: {
                id: true,
                codigo: true,
              },
            },
            cliente: {
              select: {
                id: true,
                nomeRazaoSocial: true,
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

      const result = await tx.participanteLocacao.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const participanteLocacao of participantesLocacaoToDelete) {
        await auditLogCreate({
          entityId: participanteLocacao.id,
          entityName: 'ParticipanteLocacao',
          operation: auditLogOperations.delete,
          context,
          oldData: participanteLocacao,
          tx,
        });
      }

      return result;
    },
  );
}
