import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { tarefaComercialArchiveManyInputSchema as tarefaComercialArchiveManyInputSchema } from '../tarefaComercialSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const tarefaComercialArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/tarefa-comercial/archive',
  query: tarefaComercialArchiveManyInputSchema,
};

export const tarefaComercialArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'tarefa-comercial_archive_many',
  description: dictionary.tarefaComercial.mcpDescription.archive,
  requiredPermissions: { tarefaComercial: ['archive'] },
  schema: toMcpJsonSchema(tarefaComercialArchiveManyInputSchema),
  handler: async (params, context) => {
    return await tarefaComercialArchiveManyController(params, context);
  },
});

export async function tarefaComercialArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      tarefaComercial: ['archive'],
    },
    context,
  );

  const { ids } = tarefaComercialArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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
