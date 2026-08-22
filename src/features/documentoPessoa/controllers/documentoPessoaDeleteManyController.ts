import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { documentoPessoaDeleteManyInputSchema } from '../documentoPessoaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const documentoPessoaDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/documento-pessoa',
  query: documentoPessoaDeleteManyInputSchema,
};

export const documentoPessoaDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'documentoPessoa_delete_many',
  description: dictionary.documentoPessoa.mcpDescription.delete,
  requiredPermissions: { documentoPessoa: ['delete'] },
  schema: toMcpJsonSchema(documentoPessoaDeleteManyInputSchema),
  handler: async (params, context) => {
    return await documentoPessoaDeleteManyController(params, context);
  },
});

export async function documentoPessoaDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      documentoPessoa: ['delete'],
    },
    context,
  );

  const { ids } = documentoPessoaDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const documentosPessoasToDelete = await tx.documentoPessoa.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        include: {
          proprietario: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          cliente: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          corretor: {
            select: {
              id: true,
              nomeCompleto: true,
            },
          },
          createdByMember: {
            select: {
              id: true,
              fullName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          updatedByMember: {
            select: {
              id: true,
              fullName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          archivedByMember: {
            select: {
              id: true,
              fullName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      });

      const result = await tx.documentoPessoa.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const documentoPessoa of documentosPessoasToDelete) {
        await auditLogCreate({
          entityId: documentoPessoa.id,
          entityName: 'DocumentoPessoa',
          operation: auditLogOperations.delete,
          context,
          oldData: documentoPessoa,
          tx,
        });
      }

      return result;
    },
  );
}
