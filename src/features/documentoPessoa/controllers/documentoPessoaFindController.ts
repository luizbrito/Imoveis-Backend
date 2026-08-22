import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { documentoPessoaFindSchema } from '../documentoPessoaSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const documentoPessoaFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/documento-pessoa/{id}',
  params: documentoPessoaFindSchema,
  response: 'DocumentoPessoa',
};

export const documentoPessoaFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'documentoPessoa_get',
  description: dictionary.documentoPessoa.mcpDescription.get,
  requiredPermissions: { documentoPessoa: ['read'] },
  schema: toMcpJsonSchema(documentoPessoaFindSchema),
  handler: async (params, context) => {
    return await documentoPessoaFindController(params, context);
  },
});

export async function documentoPessoaFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      documentoPessoa: ['read'],
    },
    context,
  );

  const { id } = documentoPessoaFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let documentoPessoa = await tx.documentoPessoa.findUnique({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
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
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
          updatedByMember: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
          archivedByMember: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      documentoPessoa = await filePopulateDownloadUrlInTree(documentoPessoa);

      return documentoPessoa;
    },
  );
}
