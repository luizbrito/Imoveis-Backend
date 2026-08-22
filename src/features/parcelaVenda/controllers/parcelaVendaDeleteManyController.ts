import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { parcelaVendaDeleteManyInputSchema } from '../parcelaVendaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const parcelaVendaDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/parcela-venda',
  query: parcelaVendaDeleteManyInputSchema,
};

export const parcelaVendaDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'parcelaVenda_delete_many',
  description: dictionary.parcelaVenda.mcpDescription.delete,
  requiredPermissions: { parcelaVenda: ['delete'] },
  schema: toMcpJsonSchema(parcelaVendaDeleteManyInputSchema),
  handler: async (params, context) => {
    return await parcelaVendaDeleteManyController(params, context);
  },
});

export async function parcelaVendaDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      parcelaVenda: ['delete'],
    },
    context,
  );

  const { ids } = parcelaVendaDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const parcelasVendaToDelete = await tx.parcelaVenda.findMany({
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

      const result = await tx.parcelaVenda.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const parcelaVenda of parcelasVendaToDelete) {
        await auditLogCreate({
          entityId: parcelaVenda.id,
          entityName: 'ParcelaVenda',
          operation: auditLogOperations.delete,
          context,
          oldData: parcelaVenda,
          tx,
        });
      }

      return result;
    },
  );
}
