import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { documentoPessoaArchiveManyInputSchema as documentoPessoaArchiveManyInputSchema } from '../documentoPessoaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const documentoPessoaArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/documento-pessoa/archive',
  query: documentoPessoaArchiveManyInputSchema,
};

export const documentoPessoaArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'documento-pessoa_archive_many',
  description: dictionary.documentoPessoa.mcpDescription.archive,
  requiredPermissions: { documentoPessoa: ['archive'] },
  schema: toMcpJsonSchema(documentoPessoaArchiveManyInputSchema),
  handler: async (params, context) => {
    return await documentoPessoaArchiveManyController(params, context);
  },
});

export async function documentoPessoaArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      documentoPessoa: ['archive'],
    },
    context,
  );

  const { ids } = documentoPessoaArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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
