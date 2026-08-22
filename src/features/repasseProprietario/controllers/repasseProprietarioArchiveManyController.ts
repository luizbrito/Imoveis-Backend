import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { repasseProprietarioArchiveManyInputSchema as repasseProprietarioArchiveManyInputSchema } from '../repasseProprietarioSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const repasseProprietarioArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/repasse-proprietario/archive',
  query: repasseProprietarioArchiveManyInputSchema,
};

export const repasseProprietarioArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'repasse-proprietario_archive_many',
  description: dictionary.repasseProprietario.mcpDescription.archive,
  requiredPermissions: { repasseProprietario: ['archive'] },
  schema: toMcpJsonSchema(repasseProprietarioArchiveManyInputSchema),
  handler: async (params, context) => {
    return await repasseProprietarioArchiveManyController(params, context);
  },
});

export async function repasseProprietarioArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      repasseProprietario: ['archive'],
    },
    context,
  );

  const { ids } = repasseProprietarioArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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
