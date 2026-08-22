import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { categoriaFinanceiraFindSchema } from '../categoriaFinanceiraSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const categoriaFinanceiraFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/categoria-financeira/{id}',
  params: categoriaFinanceiraFindSchema,
  response: 'CategoriaFinanceira',
};

export const categoriaFinanceiraFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'categoriaFinanceira_get',
  description: dictionary.categoriaFinanceira.mcpDescription.get,
  requiredPermissions: { categoriaFinanceira: ['read'] },
  schema: toMcpJsonSchema(categoriaFinanceiraFindSchema),
  handler: async (params, context) => {
    return await categoriaFinanceiraFindController(params, context);
  },
});

export async function categoriaFinanceiraFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      categoriaFinanceira: ['read'],
    },
    context,
  );

  const { id } = categoriaFinanceiraFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let categoriaFinanceira = await tx.categoriaFinanceira.findUnique({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          lancamentos: {
            select: {
              id: true,
              descricao: true,
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

      categoriaFinanceira =
        await filePopulateDownloadUrlInTree(categoriaFinanceira);

      return categoriaFinanceira;
    },
  );
}
