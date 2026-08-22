import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { documentoImovelArchiveManyInputSchema as documentoImovelArchiveManyInputSchema } from '../documentoImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const documentoImovelArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/documento-imovel/archive',
  query: documentoImovelArchiveManyInputSchema,
};

export const documentoImovelArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'documento-imovel_archive_many',
  description: dictionary.documentoImovel.mcpDescription.archive,
  requiredPermissions: { documentoImovel: ['archive'] },
  schema: toMcpJsonSchema(documentoImovelArchiveManyInputSchema),
  handler: async (params, context) => {
    return await documentoImovelArchiveManyController(params, context);
  },
});

export async function documentoImovelArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      documentoImovel: ['archive'],
    },
    context,
  );

  const { ids } = documentoImovelArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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
