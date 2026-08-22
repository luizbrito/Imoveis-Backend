import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { fornecedorDeleteManyInputSchema } from '../fornecedorSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const fornecedorDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/fornecedor',
  query: fornecedorDeleteManyInputSchema,
};

export const fornecedorDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'fornecedor_delete_many',
  description: dictionary.fornecedor.mcpDescription.delete,
  requiredPermissions: { fornecedor: ['delete'] },
  schema: toMcpJsonSchema(fornecedorDeleteManyInputSchema),
  handler: async (params, context) => {
    return await fornecedorDeleteManyController(params, context);
  },
});

export async function fornecedorDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      fornecedor: ['delete'],
    },
    context,
  );

  const { ids } = fornecedorDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const fornecedoresToDelete = await tx.fornecedor.findMany({
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
          ordensServico: {
            select: {
              id: true,
              codigo: true,
            },
          },
          despesas: {
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

      const result = await tx.fornecedor.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const fornecedor of fornecedoresToDelete) {
        await auditLogCreate({
          entityId: fornecedor.id,
          entityName: 'Fornecedor',
          operation: auditLogOperations.delete,
          context,
          oldData: fornecedor,
          tx,
        });
      }

      return result;
    },
  );
}
