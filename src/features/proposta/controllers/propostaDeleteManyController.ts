import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { propostaDeleteManyInputSchema } from '../propostaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const propostaDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/proposta',
  query: propostaDeleteManyInputSchema,
};

export const propostaDeleteManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'proposta_delete_many',
  description: dictionary.proposta.mcpDescription.delete,
  requiredPermissions: { proposta: ['delete'] },
  schema: toMcpJsonSchema(propostaDeleteManyInputSchema),
  handler: async (params, context) => {
    return await propostaDeleteManyController(params, context);
  },
});

export async function propostaDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      proposta: ['delete'],
    },
    context,
  );

  const { ids } = propostaDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const propostasToDelete = await tx.proposta.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        include: {
          visitaOrigem: {
            select: {
              id: true,
              codigo: true,
            },
          },
          lead: {
            select: {
              id: true,
              nome: true,
            },
          },
          cliente: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          imovel: {
            select: {
              id: true,
              titulo: true,
            },
          },
          corretor: {
            select: {
              id: true,
              nomeCompleto: true,
            },
          },
          condicoes: {
            select: {
              id: true,
              descricao: true,
            },
          },
          reservas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          vendasGeradas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          locacoesGeradas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          simulacoesFinanciamento: {
            select: {
              id: true,
              dataSimulacao: true,
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

      const result = await tx.proposta.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const proposta of propostasToDelete) {
        await auditLogCreate({
          entityId: proposta.id,
          entityName: 'Proposta',
          operation: auditLogOperations.delete,
          context,
          oldData: proposta,
          tx,
        });
      }

      return result;
    },
  );
}
