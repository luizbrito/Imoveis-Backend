import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { reajusteLocacaoDeleteManyInputSchema } from '../reajusteLocacaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const reajusteLocacaoDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/reajuste-locacao',
  query: reajusteLocacaoDeleteManyInputSchema,
};

export const reajusteLocacaoDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'reajusteLocacao_delete_many',
  description: dictionary.reajusteLocacao.mcpDescription.delete,
  requiredPermissions: { reajusteLocacao: ['delete'] },
  schema: toMcpJsonSchema(reajusteLocacaoDeleteManyInputSchema),
  handler: async (params, context) => {
    return await reajusteLocacaoDeleteManyController(params, context);
  },
});

export async function reajusteLocacaoDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      reajusteLocacao: ['delete'],
    },
    context,
  );

  const { ids } = reajusteLocacaoDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const reajustesLocacaoToDelete = await tx.reajusteLocacao.findMany({
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

      const result = await tx.reajusteLocacao.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const reajusteLocacao of reajustesLocacaoToDelete) {
        await auditLogCreate({
          entityId: reajusteLocacao.id,
          entityName: 'ReajusteLocacao',
          operation: auditLogOperations.delete,
          context,
          oldData: reajusteLocacao,
          tx,
        });
      }

      return result;
    },
  );
}
