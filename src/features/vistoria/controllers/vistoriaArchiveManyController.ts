import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { vistoriaArchiveManyInputSchema as vistoriaArchiveManyInputSchema } from '../vistoriaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const vistoriaArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/vistoria/archive',
  query: vistoriaArchiveManyInputSchema,
};

export const vistoriaArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'vistoria_archive_many',
  description: dictionary.vistoria.mcpDescription.archive,
  requiredPermissions: { vistoria: ['archive'] },
  schema: toMcpJsonSchema(vistoriaArchiveManyInputSchema),
  handler: async (params, context) => {
    return await vistoriaArchiveManyController(params, context);
  },
});

export async function vistoriaArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      vistoria: ['archive'],
    },
    context,
  );

  const { ids } = vistoriaArchiveManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldVistorias = await tx.vistoria.findMany({
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

      const result = await tx.vistoria.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
        },
      });

      const newVistorias = await tx.vistoria.findMany({
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

      for (const oldVistoria of oldVistorias) {
        const newVistoria = newVistorias.find((c) => c.id === oldVistoria.id);
        await auditLogCreate({
          entityId: oldVistoria.id,
          entityName: 'Vistoria',
          operation: auditLogOperations.update,
          context,
          oldData: oldVistoria,
          newData: newVistoria,
          tx,
        });
      }

      return result;
    },
  );
}
