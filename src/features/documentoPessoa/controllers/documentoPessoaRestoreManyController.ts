import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { documentoPessoaRestoreManyInputSchema } from '../documentoPessoaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const documentoPessoaRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/documento-pessoa/restore',
  query: documentoPessoaRestoreManyInputSchema,
};

export const documentoPessoaRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'documento-pessoa_restore_many',
  description: dictionary.documentoPessoa.mcpDescription.restore,
  requiredPermissions: { documentoPessoa: ['restore'] },
  schema: toMcpJsonSchema(documentoPessoaRestoreManyInputSchema),
  handler: async (params, context) => {
    return await documentoPessoaRestoreManyController(params, context);
  },
});

export async function documentoPessoaRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      documentoPessoa: ['restore'],
    },
    context,
  );

  const { ids } = documentoPessoaRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldDocumentosPessoas = await tx.documentoPessoa.findMany({
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

      const result = await tx.documentoPessoa.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newDocumentosPessoas = await tx.documentoPessoa.findMany({
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

      for (const oldDocumentoPessoa of oldDocumentosPessoas) {
        const newDocumentoPessoa = newDocumentosPessoas.find(
          (c) => c.id === oldDocumentoPessoa.id,
        );
        await auditLogCreate({
          entityId: oldDocumentoPessoa.id,
          entityName: 'DocumentoPessoa',
          operation: auditLogOperations.update,
          context,
          oldData: oldDocumentoPessoa,
          newData: newDocumentoPessoa,
          tx,
        });
      }

      return result;
    },
  );
}
