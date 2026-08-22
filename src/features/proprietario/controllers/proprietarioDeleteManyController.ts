import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { proprietarioDeleteManyInputSchema } from '../proprietarioSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const proprietarioDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/proprietario',
  query: proprietarioDeleteManyInputSchema,
};

export const proprietarioDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'proprietario_delete_many',
  description: dictionary.proprietario.mcpDescription.delete,
  requiredPermissions: { proprietario: ['delete'] },
  schema: toMcpJsonSchema(proprietarioDeleteManyInputSchema),
  handler: async (params, context) => {
    return await proprietarioDeleteManyController(params, context);
  },
});

export async function proprietarioDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      proprietario: ['delete'],
    },
    context,
  );

  const { ids } = proprietarioDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const proprietariosToDelete = await tx.proprietario.findMany({
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
          imoveis: {
            select: {
              id: true,
              titulo: true,
            },
          },
          captacoes: {
            select: {
              id: true,
              codigo: true,
            },
          },
          vendasComoProprietario: {
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
          repasses: {
            select: {
              id: true,
              competencia: true,
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

      const result = await tx.proprietario.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const proprietario of proprietariosToDelete) {
        await auditLogCreate({
          entityId: proprietario.id,
          entityName: 'Proprietario',
          operation: auditLogOperations.delete,
          context,
          oldData: proprietario,
          tx,
        });
      }

      return result;
    },
  );
}
