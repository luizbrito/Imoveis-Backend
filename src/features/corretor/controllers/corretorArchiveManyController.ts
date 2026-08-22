import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { corretorArchiveManyInputSchema as corretorArchiveManyInputSchema } from '../corretorSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const corretorArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/corretor/archive',
  query: corretorArchiveManyInputSchema,
};

export const corretorArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'corretor_archive_many',
  description: dictionary.corretor.mcpDescription.archive,
  requiredPermissions: { corretor: ['archive'] },
  schema: toMcpJsonSchema(corretorArchiveManyInputSchema),
  handler: async (params, context) => {
    return await corretorArchiveManyController(params, context);
  },
});

export async function corretorArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      corretor: ['archive'],
    },
    context,
  );

  const { ids } = corretorArchiveManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldCorretores = await tx.corretor.findMany({
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

      const result = await tx.corretor.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
        },
      });

      const newCorretores = await tx.corretor.findMany({
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

      for (const oldCorretor of oldCorretores) {
        const newCorretor = newCorretores.find((c) => c.id === oldCorretor.id);
        await auditLogCreate({
          entityId: oldCorretor.id,
          entityName: 'Corretor',
          operation: auditLogOperations.update,
          context,
          oldData: oldCorretor,
          newData: newCorretor,
          tx,
        });
      }

      return result;
    },
  );
}
