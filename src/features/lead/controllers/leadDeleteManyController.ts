import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { leadDeleteManyInputSchema } from '../leadSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const leadDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/lead',
  query: leadDeleteManyInputSchema,
};

export const leadDeleteManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'lead_delete_many',
  description: dictionary.lead.mcpDescription.delete,
  requiredPermissions: { lead: ['delete'] },
  schema: toMcpJsonSchema(leadDeleteManyInputSchema),
  handler: async (params, context) => {
    return await leadDeleteManyController(params, context);
  },
});

export async function leadDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      lead: ['delete'],
    },
    context,
  );

  const { ids } = leadDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const leadsToDelete = await tx.lead.findMany({
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
          corretorResponsavel: {
            select: {
              id: true,
              nomeCompleto: true,
            },
          },
          anuncioOrigem: {
            select: {
              id: true,
              titulo: true,
            },
          },
          campanhaOrigem: {
            select: {
              id: true,
              nome: true,
            },
          },
          portalOrigem: {
            select: {
              id: true,
              nome: true,
            },
          },
          clienteConvertido: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          interacoes: {
            select: {
              id: true,
              assunto: true,
            },
          },
          tarefas: {
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
          consentimentos: {
            select: {
              id: true,
              tipo: true,
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

      const result = await tx.lead.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const lead of leadsToDelete) {
        await auditLogCreate({
          entityId: lead.id,
          entityName: 'Lead',
          operation: auditLogOperations.delete,
          context,
          oldData: lead,
          tx,
        });
      }

      return result;
    },
  );
}
