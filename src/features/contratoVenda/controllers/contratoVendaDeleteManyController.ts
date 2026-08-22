import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { contratoVendaDeleteManyInputSchema } from '../contratoVendaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const contratoVendaDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/contrato-venda',
  query: contratoVendaDeleteManyInputSchema,
};

export const contratoVendaDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'contratoVenda_delete_many',
  description: dictionary.contratoVenda.mcpDescription.delete,
  requiredPermissions: { contratoVenda: ['delete'] },
  schema: toMcpJsonSchema(contratoVendaDeleteManyInputSchema),
  handler: async (params, context) => {
    return await contratoVendaDeleteManyController(params, context);
  },
});

export async function contratoVendaDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      contratoVenda: ['delete'],
    },
    context,
  );

  const { ids } = contratoVendaDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const contratosVendaToDelete = await tx.contratoVenda.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        include: {
          venda: {
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

      const result = await tx.contratoVenda.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const contratoVenda of contratosVendaToDelete) {
        await auditLogCreate({
          entityId: contratoVenda.id,
          entityName: 'ContratoVenda',
          operation: auditLogOperations.delete,
          context,
          oldData: contratoVenda,
          tx,
        });
      }

      return result;
    },
  );
}
