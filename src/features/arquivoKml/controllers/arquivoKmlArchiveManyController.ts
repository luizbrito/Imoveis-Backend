import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { arquivoKmlArchiveManyInputSchema as arquivoKmlArchiveManyInputSchema } from '../arquivoKmlSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const arquivoKmlArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/arquivo-kml/archive',
  query: arquivoKmlArchiveManyInputSchema,
};

export const arquivoKmlArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'arquivo-kml_archive_many',
  description: dictionary.arquivoKml.mcpDescription.archive,
  requiredPermissions: { arquivoKml: ['archive'] },
  schema: toMcpJsonSchema(arquivoKmlArchiveManyInputSchema),
  handler: async (params, context) => {
    return await arquivoKmlArchiveManyController(params, context);
  },
});

export async function arquivoKmlArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      arquivoKml: ['archive'],
    },
    context,
  );

  const { ids } = arquivoKmlArchiveManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldArquivosKml = await tx.arquivoKml.findMany({
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

      const result = await tx.arquivoKml.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
        },
      });

      const newArquivosKml = await tx.arquivoKml.findMany({
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

      for (const oldArquivoKml of oldArquivosKml) {
        const newArquivoKml = newArquivosKml.find(
          (c) => c.id === oldArquivoKml.id,
        );
        await auditLogCreate({
          entityId: oldArquivoKml.id,
          entityName: 'ArquivoKml',
          operation: auditLogOperations.update,
          context,
          oldData: oldArquivoKml,
          newData: newArquivoKml,
          tx,
        });
      }

      return result;
    },
  );
}
