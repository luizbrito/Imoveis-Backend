import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { documentoImovelRestoreManyInputSchema } from '../documentoImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const documentoImovelRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/documento-imovel/restore',
  query: documentoImovelRestoreManyInputSchema,
};

export const documentoImovelRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'documento-imovel_restore_many',
  description: dictionary.documentoImovel.mcpDescription.restore,
  requiredPermissions: { documentoImovel: ['restore'] },
  schema: toMcpJsonSchema(documentoImovelRestoreManyInputSchema),
  handler: async (params, context) => {
    return await documentoImovelRestoreManyController(params, context);
  },
});

export async function documentoImovelRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      documentoImovel: ['restore'],
    },
    context,
  );

  const { ids } = documentoImovelRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldDocumentosImovel = await tx.documentoImovel.findMany({
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

      const result = await tx.documentoImovel.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newDocumentosImovel = await tx.documentoImovel.findMany({
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

      for (const oldDocumentoImovel of oldDocumentosImovel) {
        const newDocumentoImovel = newDocumentosImovel.find(
          (c) => c.id === oldDocumentoImovel.id,
        );
        await auditLogCreate({
          entityId: oldDocumentoImovel.id,
          entityName: 'DocumentoImovel',
          operation: auditLogOperations.update,
          context,
          oldData: oldDocumentoImovel,
          newData: newDocumentoImovel,
          tx,
        });
      }

      return result;
    },
  );
}
