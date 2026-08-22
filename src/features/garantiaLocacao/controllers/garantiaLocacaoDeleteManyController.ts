import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { garantiaLocacaoDeleteManyInputSchema } from '../garantiaLocacaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const garantiaLocacaoDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/garantia-locacao',
  query: garantiaLocacaoDeleteManyInputSchema,
};

export const garantiaLocacaoDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'garantiaLocacao_delete_many',
  description: dictionary.garantiaLocacao.mcpDescription.delete,
  requiredPermissions: { garantiaLocacao: ['delete'] },
  schema: toMcpJsonSchema(garantiaLocacaoDeleteManyInputSchema),
  handler: async (params, context) => {
    return await garantiaLocacaoDeleteManyController(params, context);
  },
});

export async function garantiaLocacaoDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      garantiaLocacao: ['delete'],
    },
    context,
  );

  const { ids } = garantiaLocacaoDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const garantiasLocacaoToDelete = await tx.garantiaLocacao.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        include: {
          locacao: {
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

      const result = await tx.garantiaLocacao.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const garantiaLocacao of garantiasLocacaoToDelete) {
        await auditLogCreate({
          entityId: garantiaLocacao.id,
          entityName: 'GarantiaLocacao',
          operation: auditLogOperations.delete,
          context,
          oldData: garantiaLocacao,
          tx,
        });
      }

      return result;
    },
  );
}
