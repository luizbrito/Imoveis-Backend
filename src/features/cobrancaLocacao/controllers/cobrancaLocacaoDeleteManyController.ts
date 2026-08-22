import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { cobrancaLocacaoDeleteManyInputSchema } from '../cobrancaLocacaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const cobrancaLocacaoDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/cobranca-locacao',
  query: cobrancaLocacaoDeleteManyInputSchema,
};

export const cobrancaLocacaoDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'cobrancaLocacao_delete_many',
  description: dictionary.cobrancaLocacao.mcpDescription.delete,
  requiredPermissions: { cobrancaLocacao: ['delete'] },
  schema: toMcpJsonSchema(cobrancaLocacaoDeleteManyInputSchema),
  handler: async (params, context) => {
    return await cobrancaLocacaoDeleteManyController(params, context);
  },
});

export async function cobrancaLocacaoDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      cobrancaLocacao: ['delete'],
    },
    context,
  );

  const { ids } = cobrancaLocacaoDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const cobrancasLocacaoToDelete = await tx.cobrancaLocacao.findMany({
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
          pagamentos: {
            select: {
              id: true,
              identificadorTransacao: true,
            },
          },
          lancamentosFinanceiros: {
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

      const result = await tx.cobrancaLocacao.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const cobrancaLocacao of cobrancasLocacaoToDelete) {
        await auditLogCreate({
          entityId: cobrancaLocacao.id,
          entityName: 'CobrancaLocacao',
          operation: auditLogOperations.delete,
          context,
          oldData: cobrancaLocacao,
          tx,
        });
      }

      return result;
    },
  );
}
