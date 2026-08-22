import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { contaFinanceiraFindSchema } from '../contaFinanceiraSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const contaFinanceiraFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/conta-financeira/{id}',
  params: contaFinanceiraFindSchema,
  response: 'ContaFinanceira',
};

export const contaFinanceiraFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'contaFinanceira_get',
  description: dictionary.contaFinanceira.mcpDescription.get,
  requiredPermissions: { contaFinanceira: ['read'] },
  schema: toMcpJsonSchema(contaFinanceiraFindSchema),
  handler: async (params, context) => {
    return await contaFinanceiraFindController(params, context);
  },
});

export async function contaFinanceiraFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      contaFinanceira: ['read'],
    },
    context,
  );

  const { id } = contaFinanceiraFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let contaFinanceira = await tx.contaFinanceira.findUnique({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          filial: {
            select: {
              id: true,
              nome: true,
            },
          },
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

      contaFinanceira = await filePopulateDownloadUrlInTree(contaFinanceira);

      return contaFinanceira;
    },
  );
}
