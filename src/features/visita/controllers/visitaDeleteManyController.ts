import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { visitaDeleteManyInputSchema } from '../visitaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const visitaDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/visita',
  query: visitaDeleteManyInputSchema,
};

export const visitaDeleteManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'visita_delete_many',
  description: dictionary.visita.mcpDescription.delete,
  requiredPermissions: { visita: ['delete'] },
  schema: toMcpJsonSchema(visitaDeleteManyInputSchema),
  handler: async (params, context) => {
    return await visitaDeleteManyController(params, context);
  },
});

export async function visitaDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      visita: ['delete'],
    },
    context,
  );

  const { ids } = visitaDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const visitasToDelete = await tx.visita.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        include: {
          lead: {
            select: {
              id: true,
              nome: true,
            },
          },
          cliente: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          imovel: {
            select: {
              id: true,
              titulo: true,
            },
          },
          corretor: {
            select: {
              id: true,
              nomeCompleto: true,
            },
          },
          propostas: {
            select: {
              id: true,
              codigo: true,
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

      const result = await tx.visita.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const visita of visitasToDelete) {
        await auditLogCreate({
          entityId: visita.id,
          entityName: 'Visita',
          operation: auditLogOperations.delete,
          context,
          oldData: visita,
          tx,
        });
      }

      return result;
    },
  );
}
