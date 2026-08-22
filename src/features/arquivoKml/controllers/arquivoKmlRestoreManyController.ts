import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { arquivoKmlRestoreManyInputSchema } from '../arquivoKmlSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const arquivoKmlRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/arquivo-kml/restore',
  query: arquivoKmlRestoreManyInputSchema,
};

export const arquivoKmlRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'arquivo-kml_restore_many',
  description: dictionary.arquivoKml.mcpDescription.restore,
  requiredPermissions: { arquivoKml: ['restore'] },
  schema: toMcpJsonSchema(arquivoKmlRestoreManyInputSchema),
  handler: async (params, context) => {
    return await arquivoKmlRestoreManyController(params, context);
  },
});

export async function arquivoKmlRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      arquivoKml: ['restore'],
    },
    context,
  );

  const { ids } = arquivoKmlRestoreManyInputSchema.parse(query);

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
          archivedAt: null,
          archivedByMemberId: null,
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
