import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { vendaDeleteManyInputSchema } from '../vendaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const vendaDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/venda',
  query: vendaDeleteManyInputSchema,
};

export const vendaDeleteManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'venda_delete_many',
  description: dictionary.venda.mcpDescription.delete,
  requiredPermissions: { venda: ['delete'] },
  schema: toMcpJsonSchema(vendaDeleteManyInputSchema),
  handler: async (params, context) => {
    return await vendaDeleteManyController(params, context);
  },
});

export async function vendaDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      venda: ['delete'],
    },
    context,
  );

  const { ids } = vendaDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const vendasToDelete = await tx.venda.findMany({
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
          proposta: {
            select: {
              id: true,
              codigo: true,
            },
          },
          imovel: {
            select: {
              id: true,
              titulo: true,
            },
          },
          proprietario: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          comprador: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          corretor: {
            select: {
              id: true,
              nomeCompleto: true,
            },
          },
          contratos: {
            select: {
              id: true,
              numero: true,
            },
          },
          parcelas: {
            select: {
              id: true,
              numeroParcela: true,
            },
          },
          comissoes: {
            select: {
              id: true,
              codigo: true,
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

      const result = await tx.venda.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const venda of vendasToDelete) {
        await auditLogCreate({
          entityId: venda.id,
          entityName: 'Venda',
          operation: auditLogOperations.delete,
          context,
          oldData: venda,
          tx,
        });
      }

      return result;
    },
  );
}
