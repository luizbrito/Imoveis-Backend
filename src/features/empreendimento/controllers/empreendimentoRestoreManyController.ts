import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { empreendimentoRestoreManyInputSchema } from '../empreendimentoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const empreendimentoRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/empreendimento/restore',
  query: empreendimentoRestoreManyInputSchema,
};

export const empreendimentoRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'empreendimento_restore_many',
  description: dictionary.empreendimento.mcpDescription.restore,
  requiredPermissions: { empreendimento: ['restore'] },
  schema: toMcpJsonSchema(empreendimentoRestoreManyInputSchema),
  handler: async (params, context) => {
    return await empreendimentoRestoreManyController(params, context);
  },
});

export async function empreendimentoRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      empreendimento: ['restore'],
    },
    context,
  );

  const { ids } = empreendimentoRestoreManyInputSchema.parse(query);

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
          archivedAt: null,
          archivedByMemberId: null,
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
