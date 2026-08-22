import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { proprietarioRestoreManyInputSchema } from '../proprietarioSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const proprietarioRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/proprietario/restore',
  query: proprietarioRestoreManyInputSchema,
};

export const proprietarioRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'proprietario_restore_many',
  description: dictionary.proprietario.mcpDescription.restore,
  requiredPermissions: { proprietario: ['restore'] },
  schema: toMcpJsonSchema(proprietarioRestoreManyInputSchema),
  handler: async (params, context) => {
    return await proprietarioRestoreManyController(params, context);
  },
});

export async function proprietarioRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      proprietario: ['restore'],
    },
    context,
  );

  const { ids } = proprietarioRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldProprietarios = await tx.proprietario.findMany({
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

      const result = await tx.proprietario.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newProprietarios = await tx.proprietario.findMany({
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

      for (const oldProprietario of oldProprietarios) {
        const newProprietario = newProprietarios.find(
          (c) => c.id === oldProprietario.id,
        );
        await auditLogCreate({
          entityId: oldProprietario.id,
          entityName: 'Proprietario',
          operation: auditLogOperations.update,
          context,
          oldData: oldProprietario,
          newData: newProprietario,
          tx,
        });
      }

      return result;
    },
  );
}
