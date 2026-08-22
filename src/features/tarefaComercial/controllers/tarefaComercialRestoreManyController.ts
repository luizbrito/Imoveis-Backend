import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { tarefaComercialRestoreManyInputSchema } from '../tarefaComercialSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const tarefaComercialRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/tarefa-comercial/restore',
  query: tarefaComercialRestoreManyInputSchema,
};

export const tarefaComercialRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'tarefa-comercial_restore_many',
  description: dictionary.tarefaComercial.mcpDescription.restore,
  requiredPermissions: { tarefaComercial: ['restore'] },
  schema: toMcpJsonSchema(tarefaComercialRestoreManyInputSchema),
  handler: async (params, context) => {
    return await tarefaComercialRestoreManyController(params, context);
  },
});

export async function tarefaComercialRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      tarefaComercial: ['restore'],
    },
    context,
  );

  const { ids } = tarefaComercialRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldTarefasComerciais = await tx.tarefaComercial.findMany({
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

      const result = await tx.tarefaComercial.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newTarefasComerciais = await tx.tarefaComercial.findMany({
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

      for (const oldTarefaComercial of oldTarefasComerciais) {
        const newTarefaComercial = newTarefasComerciais.find(
          (c) => c.id === oldTarefaComercial.id,
        );
        await auditLogCreate({
          entityId: oldTarefaComercial.id,
          entityName: 'TarefaComercial',
          operation: auditLogOperations.update,
          context,
          oldData: oldTarefaComercial,
          newData: newTarefaComercial,
          tx,
        });
      }

      return result;
    },
  );
}
