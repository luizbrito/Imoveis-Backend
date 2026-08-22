import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { fornecedorFindSchema } from '../fornecedorSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const fornecedorFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/fornecedor/{id}',
  params: fornecedorFindSchema,
  response: 'Fornecedor',
};

export const fornecedorFindMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'fornecedor_get',
  description: dictionary.fornecedor.mcpDescription.get,
  requiredPermissions: { fornecedor: ['read'] },
  schema: toMcpJsonSchema(fornecedorFindSchema),
  handler: async (params, context) => {
    return await fornecedorFindController(params, context);
  },
});

export async function fornecedorFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      fornecedor: ['read'],
    },
    context,
  );

  const { id } = fornecedorFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let fornecedor = await tx.fornecedor.findUnique({
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
          ordensServico: {
            select: {
              id: true,
              codigo: true,
            },
          },
          despesas: {
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

      fornecedor = await filePopulateDownloadUrlInTree(fornecedor);

      return fornecedor;
    },
  );
}
