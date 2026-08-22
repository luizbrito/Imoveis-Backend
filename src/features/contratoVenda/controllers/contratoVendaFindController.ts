import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { contratoVendaFindSchema } from '../contratoVendaSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const contratoVendaFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/contrato-venda/{id}',
  params: contratoVendaFindSchema,
  response: 'ContratoVenda',
};

export const contratoVendaFindMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'contratoVenda_get',
  description: dictionary.contratoVenda.mcpDescription.get,
  requiredPermissions: { contratoVenda: ['read'] },
  schema: toMcpJsonSchema(contratoVendaFindSchema),
  handler: async (params, context) => {
    return await contratoVendaFindController(params, context);
  },
});

export async function contratoVendaFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      contratoVenda: ['read'],
    },
    context,
  );

  const { id } = contratoVendaFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let contratoVenda = await tx.contratoVenda.findUnique({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          venda: {
            select: {
              id: true,
              codigo: true,
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

      contratoVenda = await filePopulateDownloadUrlInTree(contratoVenda);

      return contratoVenda;
    },
  );
}
