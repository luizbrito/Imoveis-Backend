import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { infraestruturaEnergiaConectividadeArchiveManyInputSchema as infraestruturaEnergiaConectividadeArchiveManyInputSchema } from '../infraestruturaEnergiaConectividadeSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const infraestruturaEnergiaConectividadeArchiveManyApiDoc: RouteConfig =
  {
    method: 'put',
    path: '/api/infraestrutura-energia-conectividade/archive',
    query: infraestruturaEnergiaConectividadeArchiveManyInputSchema,
  };

export const infraestruturaEnergiaConectividadeArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'infraestrutura-energia-conectividade_archive_many',
  description:
    dictionary.infraestruturaEnergiaConectividade.mcpDescription.archive,
  requiredPermissions: { infraestruturaEnergiaConectividade: ['archive'] },
  schema: toMcpJsonSchema(
    infraestruturaEnergiaConectividadeArchiveManyInputSchema,
  ),
  handler: async (params, context) => {
    return await infraestruturaEnergiaConectividadeArchiveManyController(
      params,
      context,
    );
  },
});

export async function infraestruturaEnergiaConectividadeArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      infraestruturaEnergiaConectividade: ['archive'],
    },
    context,
  );

  const { ids } =
    infraestruturaEnergiaConectividadeArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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
