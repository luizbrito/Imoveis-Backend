import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { documentacaoRuralBrasilArchiveManyInputSchema as documentacaoRuralBrasilArchiveManyInputSchema } from '../documentacaoRuralBrasilSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const documentacaoRuralBrasilArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/documentacao-rural-brasil/archive',
  query: documentacaoRuralBrasilArchiveManyInputSchema,
};

export const documentacaoRuralBrasilArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'documentacao-rural-brasil_archive_many',
  description: dictionary.documentacaoRuralBrasil.mcpDescription.archive,
  requiredPermissions: { documentacaoRuralBrasil: ['archive'] },
  schema: toMcpJsonSchema(documentacaoRuralBrasilArchiveManyInputSchema),
  handler: async (params, context) => {
    return await documentacaoRuralBrasilArchiveManyController(params, context);
  },
});

export async function documentacaoRuralBrasilArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      documentacaoRuralBrasil: ['archive'],
    },
    context,
  );

  const { ids } = documentacaoRuralBrasilArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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
