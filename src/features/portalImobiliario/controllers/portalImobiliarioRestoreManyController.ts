import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { portalImobiliarioRestoreManyInputSchema } from '../portalImobiliarioSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const portalImobiliarioRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/portal-imobiliario/restore',
  query: portalImobiliarioRestoreManyInputSchema,
};

export const portalImobiliarioRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'portal-imobiliario_restore_many',
  description: dictionary.portalImobiliario.mcpDescription.restore,
  requiredPermissions: { portalImobiliario: ['restore'] },
  schema: toMcpJsonSchema(portalImobiliarioRestoreManyInputSchema),
  handler: async (params, context) => {
    return await portalImobiliarioRestoreManyController(params, context);
  },
});

export async function portalImobiliarioRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      portalImobiliario: ['restore'],
    },
    context,
  );

  const { ids } = portalImobiliarioRestoreManyInputSchema.parse(query);

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
          archivedAt: null,
          archivedByMemberId: null,
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
