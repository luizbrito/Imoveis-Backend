import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { captacaoImovelDeleteManyInputSchema } from '../captacaoImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const captacaoImovelDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/captacao-imovel',
  query: captacaoImovelDeleteManyInputSchema,
};

export const captacaoImovelDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'captacaoImovel_delete_many',
  description: dictionary.captacaoImovel.mcpDescription.delete,
  requiredPermissions: { captacaoImovel: ['delete'] },
  schema: toMcpJsonSchema(captacaoImovelDeleteManyInputSchema),
  handler: async (params, context) => {
    return await captacaoImovelDeleteManyController(params, context);
  },
});

export async function captacaoImovelDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      captacaoImovel: ['delete'],
    },
    context,
  );

  const { ids } = captacaoImovelDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const captacoesImovelToDelete = await tx.captacaoImovel.findMany({
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
          corretor: {
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

      const result = await tx.captacaoImovel.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const captacaoImovel of captacoesImovelToDelete) {
        await auditLogCreate({
          entityId: captacaoImovel.id,
          entityName: 'CaptacaoImovel',
          operation: auditLogOperations.delete,
          context,
          oldData: captacaoImovel,
          tx,
        });
      }

      return result;
    },
  );
}
