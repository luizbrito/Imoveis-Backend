import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { proprietarioArchiveManyInputSchema as proprietarioArchiveManyInputSchema } from '../proprietarioSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const proprietarioArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/proprietario/archive',
  query: proprietarioArchiveManyInputSchema,
};

export const proprietarioArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'proprietario_archive_many',
  description: dictionary.proprietario.mcpDescription.archive,
  requiredPermissions: { proprietario: ['archive'] },
  schema: toMcpJsonSchema(proprietarioArchiveManyInputSchema),
  handler: async (params, context) => {
    return await proprietarioArchiveManyController(params, context);
  },
});

export async function proprietarioArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      proprietario: ['archive'],
    },
    context,
  );

  const { ids } = proprietarioArchiveManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldProprietarios = await tx.proprietario.findMany({
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

      const result = await tx.proprietario.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
        },
      });

      const newProprietarios = await tx.proprietario.findMany({
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

      for (const oldProprietario of oldProprietarios) {
        const newProprietario = newProprietarios.find(
          (c) => c.id === oldProprietario.id,
        );
        await auditLogCreate({
          entityId: oldProprietario.id,
          entityName: 'Proprietario',
          operation: auditLogOperations.update,
          context,
          oldData: oldProprietario,
          newData: newProprietario,
          tx,
        });
      }

      return result;
    },
  );
}
