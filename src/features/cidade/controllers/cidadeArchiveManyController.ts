import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { cidadeArchiveManyInputSchema as cidadeArchiveManyInputSchema } from '../cidadeSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const cidadeArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/cidade/archive',
  query: cidadeArchiveManyInputSchema,
};

export const cidadeArchiveManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'cidade_archive_many',
  description: dictionary.cidade.mcpDescription.archive,
  requiredPermissions: { cidade: ['archive'] },
  schema: toMcpJsonSchema(cidadeArchiveManyInputSchema),
  handler: async (params, context) => {
    return await cidadeArchiveManyController(params, context);
  },
});

export async function cidadeArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      cidade: ['archive'],
    },
    context,
  );

  const { ids } = cidadeArchiveManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldCidades = await tx.cidade.findMany({
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

      const result = await tx.cidade.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
        },
      });

      const newCidades = await tx.cidade.findMany({
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

      for (const oldCidade of oldCidades) {
        const newCidade = newCidades.find((c) => c.id === oldCidade.id);
        await auditLogCreate({
          entityId: oldCidade.id,
          entityName: 'Cidade',
          operation: auditLogOperations.update,
          context,
          oldData: oldCidade,
          newData: newCidade,
          tx,
        });
      }

      return result;
    },
  );
}
