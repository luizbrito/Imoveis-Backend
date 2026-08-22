import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { avaliacaoImovelDeleteManyInputSchema } from '../avaliacaoImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const avaliacaoImovelDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/avaliacao-imovel',
  query: avaliacaoImovelDeleteManyInputSchema,
};

export const avaliacaoImovelDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'avaliacaoImovel_delete_many',
  description: dictionary.avaliacaoImovel.mcpDescription.delete,
  requiredPermissions: { avaliacaoImovel: ['delete'] },
  schema: toMcpJsonSchema(avaliacaoImovelDeleteManyInputSchema),
  handler: async (params, context) => {
    return await avaliacaoImovelDeleteManyController(params, context);
  },
});

export async function avaliacaoImovelDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      avaliacaoImovel: ['delete'],
    },
    context,
  );

  const { ids } = avaliacaoImovelDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const avaliacoesImovelToDelete = await tx.avaliacaoImovel.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        include: {
          imovel: {
            select: {
              id: true,
              titulo: true,
            },
          },
          avaliador: {
            select: {
              id: true,
              nomeCompleto: true,
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

      const result = await tx.avaliacaoImovel.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const avaliacaoImovel of avaliacoesImovelToDelete) {
        await auditLogCreate({
          entityId: avaliacaoImovel.id,
          entityName: 'AvaliacaoImovel',
          operation: auditLogOperations.delete,
          context,
          oldData: avaliacaoImovel,
          tx,
        });
      }

      return result;
    },
  );
}
