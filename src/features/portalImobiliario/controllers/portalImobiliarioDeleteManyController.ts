import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { portalImobiliarioDeleteManyInputSchema } from '../portalImobiliarioSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const portalImobiliarioDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/portal-imobiliario',
  query: portalImobiliarioDeleteManyInputSchema,
};

export const portalImobiliarioDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'portalImobiliario_delete_many',
  description: dictionary.portalImobiliario.mcpDescription.delete,
  requiredPermissions: { portalImobiliario: ['delete'] },
  schema: toMcpJsonSchema(portalImobiliarioDeleteManyInputSchema),
  handler: async (params, context) => {
    return await portalImobiliarioDeleteManyController(params, context);
  },
});

export async function portalImobiliarioDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      portalImobiliario: ['delete'],
    },
    context,
  );

  const { ids } = portalImobiliarioDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const portaisImobiliariosToDelete = await tx.portalImobiliario.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        include: {
          publicacoes: {
            select: {
              id: true,
              codigoExterno: true,
            },
          },
          leadsGerados: {
            select: {
              id: true,
              nome: true,
            },
          },
          createdByMember: {
            select: {
              id: true,
              fullName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          updatedByMember: {
            select: {
              id: true,
              fullName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          archivedByMember: {
            select: {
              id: true,
              fullName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      });

      const result = await tx.portalImobiliario.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const portalImobiliario of portaisImobiliariosToDelete) {
        await auditLogCreate({
          entityId: portalImobiliario.id,
          entityName: 'PortalImobiliario',
          operation: auditLogOperations.delete,
          context,
          oldData: portalImobiliario,
          tx,
        });
      }

      return result;
    },
  );
}
