import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filialArchiveManyInputSchema as filialArchiveManyInputSchema } from '../filialSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const filialArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/filial/archive',
  query: filialArchiveManyInputSchema,
};

export const filialArchiveManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'filial_archive_many',
  description: dictionary.filial.mcpDescription.archive,
  requiredPermissions: { filial: ['archive'] },
  schema: toMcpJsonSchema(filialArchiveManyInputSchema),
  handler: async (params, context) => {
    return await filialArchiveManyController(params, context);
  },
});

export async function filialArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      filial: ['archive'],
    },
    context,
  );

  const { ids } = filialArchiveManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldFiliais = await tx.filial.findMany({
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

      const result = await tx.filial.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
        },
      });

      const newFiliais = await tx.filial.findMany({
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

      for (const oldFilial of oldFiliais) {
        const newFilial = newFiliais.find((c) => c.id === oldFilial.id);
        await auditLogCreate({
          entityId: oldFilial.id,
          entityName: 'Filial',
          operation: auditLogOperations.update,
          context,
          oldData: oldFilial,
          newData: newFilial,
          tx,
        });
      }

      return result;
    },
  );
}
