import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { tarefaComercialDeleteManyInputSchema } from '../tarefaComercialSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const tarefaComercialDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/tarefa-comercial',
  query: tarefaComercialDeleteManyInputSchema,
};

export const tarefaComercialDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'tarefaComercial_delete_many',
  description: dictionary.tarefaComercial.mcpDescription.delete,
  requiredPermissions: { tarefaComercial: ['delete'] },
  schema: toMcpJsonSchema(tarefaComercialDeleteManyInputSchema),
  handler: async (params, context) => {
    return await tarefaComercialDeleteManyController(params, context);
  },
});

export async function tarefaComercialDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      tarefaComercial: ['delete'],
    },
    context,
  );

  const { ids } = tarefaComercialDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const tarefasComerciaisToDelete = await tx.tarefaComercial.findMany({
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
          corretor: {
            select: {
              id: true,
              nomeCompleto: true,
            },
          },
          cliente: {
            select: {
              id: true,
              nomeRazaoSocial: true,
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

      const result = await tx.tarefaComercial.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const tarefaComercial of tarefasComerciaisToDelete) {
        await auditLogCreate({
          entityId: tarefaComercial.id,
          entityName: 'TarefaComercial',
          operation: auditLogOperations.delete,
          context,
          oldData: tarefaComercial,
          tx,
        });
      }

      return result;
    },
  );
}
