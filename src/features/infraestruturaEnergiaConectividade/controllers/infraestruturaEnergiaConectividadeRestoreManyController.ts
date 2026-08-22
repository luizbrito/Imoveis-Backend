import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { infraestruturaEnergiaConectividadeRestoreManyInputSchema } from '../infraestruturaEnergiaConectividadeSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const infraestruturaEnergiaConectividadeRestoreManyApiDoc: RouteConfig =
  {
    method: 'put',
    path: '/api/infraestrutura-energia-conectividade/restore',
    query: infraestruturaEnergiaConectividadeRestoreManyInputSchema,
  };

export const infraestruturaEnergiaConectividadeRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'infraestrutura-energia-conectividade_restore_many',
  description:
    dictionary.infraestruturaEnergiaConectividade.mcpDescription.restore,
  requiredPermissions: { infraestruturaEnergiaConectividade: ['restore'] },
  schema: toMcpJsonSchema(
    infraestruturaEnergiaConectividadeRestoreManyInputSchema,
  ),
  handler: async (params, context) => {
    return await infraestruturaEnergiaConectividadeRestoreManyController(
      params,
      context,
    );
  },
});

export async function infraestruturaEnergiaConectividadeRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      infraestruturaEnergiaConectividade: ['restore'],
    },
    context,
  );

  const { ids } =
    infraestruturaEnergiaConectividadeRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldInfraestruturasEnergiaConectividade =
        await tx.infraestruturaEnergiaConectividade.findMany({
          where: {
            id: { in: ids },
            organizationId: currentOrganization.id,
          },
          select: {
            id: true,
            archivedAt: true,
            archivedByMemberId: true,
          },
        });

      const result = await tx.infraestruturaEnergiaConectividade.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newInfraestruturasEnergiaConectividade =
        await tx.infraestruturaEnergiaConectividade.findMany({
          where: {
            id: { in: ids },
            organizationId: currentOrganization.id,
          },
          select: {
            id: true,
            archivedAt: true,
            archivedByMemberId: true,
          },
        });

      for (const oldInfraestruturaEnergiaConectividade of oldInfraestruturasEnergiaConectividade) {
        const newInfraestruturaEnergiaConectividade =
          newInfraestruturasEnergiaConectividade.find(
            (c) => c.id === oldInfraestruturaEnergiaConectividade.id,
          );
        await auditLogCreate({
          entityId: oldInfraestruturaEnergiaConectividade.id,
          entityName: 'InfraestruturaEnergiaConectividade',
          operation: auditLogOperations.update,
          context,
          oldData: oldInfraestruturaEnergiaConectividade,
          newData: newInfraestruturaEnergiaConectividade,
          tx,
        });
      }

      return result;
    },
  );
}
