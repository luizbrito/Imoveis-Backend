import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filialDeleteManyInputSchema } from '../filialSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const filialDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/filial',
  query: filialDeleteManyInputSchema,
};

export const filialDeleteManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'filial_delete_many',
  description: dictionary.filial.mcpDescription.delete,
  requiredPermissions: { filial: ['delete'] },
  schema: toMcpJsonSchema(filialDeleteManyInputSchema),
  handler: async (params, context) => {
    return await filialDeleteManyController(params, context);
  },
});

export async function filialDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      filial: ['delete'],
    },
    context,
  );

  const { ids } = filialDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const filiaisToDelete = await tx.filial.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        include: {
          corretores: {
            select: {
              id: true,
              nomeCompleto: true,
            },
          },
          proprietarios: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          clientes: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          imoveis: {
            select: {
              id: true,
              titulo: true,
            },
          },
          leads: {
            select: {
              id: true,
              nome: true,
            },
          },
          campanhasMarketing: {
            select: {
              id: true,
              nome: true,
            },
          },
          vendas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          locacoes: {
            select: {
              id: true,
              codigo: true,
            },
          },
          contasFinanceiras: {
            select: {
              id: true,
              nome: true,
            },
          },
          fornecedores: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          captacoesImovel: {
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
          contratosAdministracao: {
            select: {
              id: true,
              numero: true,
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

      const result = await tx.filial.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const filial of filiaisToDelete) {
        await auditLogCreate({
          entityId: filial.id,
          entityName: 'Filial',
          operation: auditLogOperations.delete,
          context,
          oldData: filial,
          tx,
        });
      }

      return result;
    },
  );
}
