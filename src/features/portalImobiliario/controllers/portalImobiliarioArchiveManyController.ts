import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { portalImobiliarioArchiveManyInputSchema as portalImobiliarioArchiveManyInputSchema } from '../portalImobiliarioSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const portalImobiliarioArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/portal-imobiliario/archive',
  query: portalImobiliarioArchiveManyInputSchema,
};

export const portalImobiliarioArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'portal-imobiliario_archive_many',
  description: dictionary.portalImobiliario.mcpDescription.archive,
  requiredPermissions: { portalImobiliario: ['archive'] },
  schema: toMcpJsonSchema(portalImobiliarioArchiveManyInputSchema),
  handler: async (params, context) => {
    return await portalImobiliarioArchiveManyController(params, context);
  },
});

export async function portalImobiliarioArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      portalImobiliario: ['archive'],
    },
    context,
  );

  const { ids } = portalImobiliarioArchiveManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldPortaisImobiliarios = await tx.portalImobiliario.findMany({
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

      const result = await tx.portalImobiliario.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
        },
      });

      const newPortaisImobiliarios = await tx.portalImobiliario.findMany({
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

      for (const oldPortalImobiliario of oldPortaisImobiliarios) {
        const newPortalImobiliario = newPortaisImobiliarios.find(
          (c) => c.id === oldPortalImobiliario.id,
        );
        await auditLogCreate({
          entityId: oldPortalImobiliario.id,
          entityName: 'PortalImobiliario',
          operation: auditLogOperations.update,
          context,
          oldData: oldPortalImobiliario,
          newData: newPortalImobiliario,
          tx,
        });
      }

      return result;
    },
  );
}
