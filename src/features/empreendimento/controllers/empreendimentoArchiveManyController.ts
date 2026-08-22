import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { empreendimentoArchiveManyInputSchema as empreendimentoArchiveManyInputSchema } from '../empreendimentoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const empreendimentoArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/empreendimento/archive',
  query: empreendimentoArchiveManyInputSchema,
};

export const empreendimentoArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'empreendimento_archive_many',
  description: dictionary.empreendimento.mcpDescription.archive,
  requiredPermissions: { empreendimento: ['archive'] },
  schema: toMcpJsonSchema(empreendimentoArchiveManyInputSchema),
  handler: async (params, context) => {
    return await empreendimentoArchiveManyController(params, context);
  },
});

export async function empreendimentoArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      empreendimento: ['archive'],
    },
    context,
  );

  const { ids } = empreendimentoArchiveManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldEmpreendimentos = await tx.empreendimento.findMany({
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

      const result = await tx.empreendimento.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
        },
      });

      const newEmpreendimentos = await tx.empreendimento.findMany({
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

      for (const oldEmpreendimento of oldEmpreendimentos) {
        const newEmpreendimento = newEmpreendimentos.find(
          (c) => c.id === oldEmpreendimento.id,
        );
        await auditLogCreate({
          entityId: oldEmpreendimento.id,
          entityName: 'Empreendimento',
          operation: auditLogOperations.update,
          context,
          oldData: oldEmpreendimento,
          newData: newEmpreendimento,
          tx,
        });
      }

      return result;
    },
  );
}
