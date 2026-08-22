import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { repasseProprietarioRestoreManyInputSchema } from '../repasseProprietarioSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const repasseProprietarioRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/repasse-proprietario/restore',
  query: repasseProprietarioRestoreManyInputSchema,
};

export const repasseProprietarioRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'repasse-proprietario_restore_many',
  description: dictionary.repasseProprietario.mcpDescription.restore,
  requiredPermissions: { repasseProprietario: ['restore'] },
  schema: toMcpJsonSchema(repasseProprietarioRestoreManyInputSchema),
  handler: async (params, context) => {
    return await repasseProprietarioRestoreManyController(params, context);
  },
});

export async function repasseProprietarioRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      repasseProprietario: ['restore'],
    },
    context,
  );

  const { ids } = repasseProprietarioRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldRepassesProprietario = await tx.repasseProprietario.findMany({
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

      const result = await tx.repasseProprietario.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newRepassesProprietario = await tx.repasseProprietario.findMany({
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

      for (const oldRepasseProprietario of oldRepassesProprietario) {
        const newRepasseProprietario = newRepassesProprietario.find(
          (c) => c.id === oldRepasseProprietario.id,
        );
        await auditLogCreate({
          entityId: oldRepasseProprietario.id,
          entityName: 'RepasseProprietario',
          operation: auditLogOperations.update,
          context,
          oldData: oldRepasseProprietario,
          newData: newRepasseProprietario,
          tx,
        });
      }

      return result;
    },
  );
}
