import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { interacaoLeadDeleteManyInputSchema } from '../interacaoLeadSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const interacaoLeadDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/interacao-lead',
  query: interacaoLeadDeleteManyInputSchema,
};

export const interacaoLeadDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'interacaoLead_delete_many',
  description: dictionary.interacaoLead.mcpDescription.delete,
  requiredPermissions: { interacaoLead: ['delete'] },
  schema: toMcpJsonSchema(interacaoLeadDeleteManyInputSchema),
  handler: async (params, context) => {
    return await interacaoLeadDeleteManyController(params, context);
  },
});

export async function interacaoLeadDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      interacaoLead: ['delete'],
    },
    context,
  );

  const { ids } = interacaoLeadDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const interacoesLeadToDelete = await tx.interacaoLead.findMany({
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

      const result = await tx.interacaoLead.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const interacaoLead of interacoesLeadToDelete) {
        await auditLogCreate({
          entityId: interacaoLead.id,
          entityName: 'InteracaoLead',
          operation: auditLogOperations.delete,
          context,
          oldData: interacaoLead,
          tx,
        });
      }

      return result;
    },
  );
}
