import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { documentacaoRuralBrasilRestoreManyInputSchema } from '../documentacaoRuralBrasilSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const documentacaoRuralBrasilRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/documentacao-rural-brasil/restore',
  query: documentacaoRuralBrasilRestoreManyInputSchema,
};

export const documentacaoRuralBrasilRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'documentacao-rural-brasil_restore_many',
  description: dictionary.documentacaoRuralBrasil.mcpDescription.restore,
  requiredPermissions: { documentacaoRuralBrasil: ['restore'] },
  schema: toMcpJsonSchema(documentacaoRuralBrasilRestoreManyInputSchema),
  handler: async (params, context) => {
    return await documentacaoRuralBrasilRestoreManyController(params, context);
  },
});

export async function documentacaoRuralBrasilRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      documentacaoRuralBrasil: ['restore'],
    },
    context,
  );

  const { ids } = documentacaoRuralBrasilRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldDocumentacoesRuraisBrasil =
        await tx.documentacaoRuralBrasil.findMany({
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

      const result = await tx.documentacaoRuralBrasil.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newDocumentacoesRuraisBrasil =
        await tx.documentacaoRuralBrasil.findMany({
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

      for (const oldDocumentacaoRuralBrasil of oldDocumentacoesRuraisBrasil) {
        const newDocumentacaoRuralBrasil = newDocumentacoesRuraisBrasil.find(
          (c) => c.id === oldDocumentacaoRuralBrasil.id,
        );
        await auditLogCreate({
          entityId: oldDocumentacaoRuralBrasil.id,
          entityName: 'DocumentacaoRuralBrasil',
          operation: auditLogOperations.update,
          context,
          oldData: oldDocumentacaoRuralBrasil,
          newData: newDocumentacaoRuralBrasil,
          tx,
        });
      }

      return result;
    },
  );
}
