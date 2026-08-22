import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { infraestruturaEnergiaConectividadeDeleteManyInputSchema } from '../infraestruturaEnergiaConectividadeSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const infraestruturaEnergiaConectividadeDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/infraestrutura-energia-conectividade',
  query: infraestruturaEnergiaConectividadeDeleteManyInputSchema,
};

export const infraestruturaEnergiaConectividadeDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'infraestruturaEnergiaConectividade_delete_many',
  description:
    dictionary.infraestruturaEnergiaConectividade.mcpDescription.delete,
  requiredPermissions: { infraestruturaEnergiaConectividade: ['delete'] },
  schema: toMcpJsonSchema(
    infraestruturaEnergiaConectividadeDeleteManyInputSchema,
  ),
  handler: async (params, context) => {
    return await infraestruturaEnergiaConectividadeDeleteManyController(
      params,
      context,
    );
  },
});

export async function infraestruturaEnergiaConectividadeDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      infraestruturaEnergiaConectividade: ['delete'],
    },
    context,
  );

  const { ids } =
    infraestruturaEnergiaConectividadeDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const infraestruturasEnergiaConectividadeToDelete =
        await tx.infraestruturaEnergiaConectividade.findMany({
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

      const result = await tx.infraestruturaEnergiaConectividade.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const infraestruturaEnergiaConectividade of infraestruturasEnergiaConectividadeToDelete) {
        await auditLogCreate({
          entityId: infraestruturaEnergiaConectividade.id,
          entityName: 'InfraestruturaEnergiaConectividade',
          operation: auditLogOperations.delete,
          context,
          oldData: infraestruturaEnergiaConectividade,
          tx,
        });
      }

      return result;
    },
  );
}
