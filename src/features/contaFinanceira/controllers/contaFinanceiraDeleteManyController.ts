import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { contaFinanceiraDeleteManyInputSchema } from '../contaFinanceiraSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const contaFinanceiraDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/conta-financeira',
  query: contaFinanceiraDeleteManyInputSchema,
};

export const contaFinanceiraDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'contaFinanceira_delete_many',
  description: dictionary.contaFinanceira.mcpDescription.delete,
  requiredPermissions: { contaFinanceira: ['delete'] },
  schema: toMcpJsonSchema(contaFinanceiraDeleteManyInputSchema),
  handler: async (params, context) => {
    return await contaFinanceiraDeleteManyController(params, context);
  },
});

export async function contaFinanceiraDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      contaFinanceira: ['delete'],
    },
    context,
  );

  const { ids } = contaFinanceiraDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const contasFinanceirasToDelete = await tx.contaFinanceira.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        include: {
          filial: {
            select: {
              id: true,
              nome: true,
            },
          },
          lancamentos: {
            select: {
              id: true,
              descricao: true,
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

      const result = await tx.contaFinanceira.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const contaFinanceira of contasFinanceirasToDelete) {
        await auditLogCreate({
          entityId: contaFinanceira.id,
          entityName: 'ContaFinanceira',
          operation: auditLogOperations.delete,
          context,
          oldData: contaFinanceira,
          tx,
        });
      }

      return result;
    },
  );
}
