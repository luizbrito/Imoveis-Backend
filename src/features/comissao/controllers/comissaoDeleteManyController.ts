import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { comissaoDeleteManyInputSchema } from '../comissaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const comissaoDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/comissao',
  query: comissaoDeleteManyInputSchema,
};

export const comissaoDeleteManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'comissao_delete_many',
  description: dictionary.comissao.mcpDescription.delete,
  requiredPermissions: { comissao: ['delete'] },
  schema: toMcpJsonSchema(comissaoDeleteManyInputSchema),
  handler: async (params, context) => {
    return await comissaoDeleteManyController(params, context);
  },
});

export async function comissaoDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      comissao: ['delete'],
    },
    context,
  );

  const { ids } = comissaoDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const comissoesToDelete = await tx.comissao.findMany({
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
          locacao: {
            select: {
              id: true,
              codigo: true,
            },
          },
          corretor: {
            select: {
              id: true,
              nomeCompleto: true,
            },
          },
          pagamentos: {
            select: {
              id: true,
              dataPagamento: true,
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

      const result = await tx.comissao.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const comissao of comissoesToDelete) {
        await auditLogCreate({
          entityId: comissao.id,
          entityName: 'Comissao',
          operation: auditLogOperations.delete,
          context,
          oldData: comissao,
          tx,
        });
      }

      return result;
    },
  );
}
