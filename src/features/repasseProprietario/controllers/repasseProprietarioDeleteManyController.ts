import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { repasseProprietarioDeleteManyInputSchema } from '../repasseProprietarioSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const repasseProprietarioDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/repasse-proprietario',
  query: repasseProprietarioDeleteManyInputSchema,
};

export const repasseProprietarioDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'repasseProprietario_delete_many',
  description: dictionary.repasseProprietario.mcpDescription.delete,
  requiredPermissions: { repasseProprietario: ['delete'] },
  schema: toMcpJsonSchema(repasseProprietarioDeleteManyInputSchema),
  handler: async (params, context) => {
    return await repasseProprietarioDeleteManyController(params, context);
  },
});

export async function repasseProprietarioDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      repasseProprietario: ['delete'],
    },
    context,
  );

  const { ids } = repasseProprietarioDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const repassesProprietarioToDelete =
        await tx.repasseProprietario.findMany({
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
            proprietario: {
              select: {
                id: true,
                nomeRazaoSocial: true,
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

      const result = await tx.repasseProprietario.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const repasseProprietario of repassesProprietarioToDelete) {
        await auditLogCreate({
          entityId: repasseProprietario.id,
          entityName: 'RepasseProprietario',
          operation: auditLogOperations.delete,
          context,
          oldData: repasseProprietario,
          tx,
        });
      }

      return result;
    },
  );
}
