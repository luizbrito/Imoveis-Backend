import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { clienteDeleteManyInputSchema } from '../clienteSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const clienteDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/cliente',
  query: clienteDeleteManyInputSchema,
};

export const clienteDeleteManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'cliente_delete_many',
  description: dictionary.cliente.mcpDescription.delete,
  requiredPermissions: { cliente: ['delete'] },
  schema: toMcpJsonSchema(clienteDeleteManyInputSchema),
  handler: async (params, context) => {
    return await clienteDeleteManyController(params, context);
  },
});

export async function clienteDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      cliente: ['delete'],
    },
    context,
  );

  const { ids } = clienteDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const clientesToDelete = await tx.cliente.findMany({
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
          historicoLeads: {
            select: {
              id: true,
              nome: true,
            },
          },
          tarefasRelacionadas: {
            select: {
              id: true,
              titulo: true,
            },
          },
          visitas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          propostas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          reservas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          compras: {
            select: {
              id: true,
              codigo: true,
            },
          },
          participacoesLocacao: {
            select: {
              id: true,
              papel: true,
            },
          },
          solicitacoesAbertas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          documentosPessoais: {
            select: {
              id: true,
              titulo: true,
            },
          },
          consentimentos: {
            select: {
              id: true,
              tipo: true,
            },
          },
          favoritos: {
            select: {
              id: true,
              dataInclusao: true,
            },
          },
          simulacoesFinanciamento: {
            select: {
              id: true,
              dataSimulacao: true,
            },
          },
          ocorrenciasReportadas: {
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

      const result = await tx.cliente.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const cliente of clientesToDelete) {
        await auditLogCreate({
          entityId: cliente.id,
          entityName: 'Cliente',
          operation: auditLogOperations.delete,
          context,
          oldData: cliente,
          tx,
        });
      }

      return result;
    },
  );
}
