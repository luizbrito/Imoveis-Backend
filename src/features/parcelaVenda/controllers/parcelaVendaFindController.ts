import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { parcelaVendaFindSchema } from '../parcelaVendaSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const parcelaVendaFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/parcela-venda/{id}',
  params: parcelaVendaFindSchema,
  response: 'ParcelaVenda',
};

export const parcelaVendaFindMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'parcelaVenda_get',
  description: dictionary.parcelaVenda.mcpDescription.get,
  requiredPermissions: { parcelaVenda: ['read'] },
  schema: toMcpJsonSchema(parcelaVendaFindSchema),
  handler: async (params, context) => {
    return await parcelaVendaFindController(params, context);
  },
});

export async function parcelaVendaFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      parcelaVenda: ['read'],
    },
    context,
  );

  const { id } = parcelaVendaFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let parcelaVenda = await tx.parcelaVenda.findUnique({
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

      parcelaVenda = await filePopulateDownloadUrlInTree(parcelaVenda);

      return parcelaVenda;
    },
  );
}
