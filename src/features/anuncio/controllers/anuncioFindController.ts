import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { anuncioFindSchema } from '../anuncioSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const anuncioFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/anuncio/{id}',
  params: anuncioFindSchema,
  response: 'Anuncio',
};

export const anuncioFindMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'anuncio_get',
  description: dictionary.anuncio.mcpDescription.get,
  requiredPermissions: { anuncio: ['read'] },
  schema: toMcpJsonSchema(anuncioFindSchema),
  handler: async (params, context) => {
    return await anuncioFindController(params, context);
  },
});

export async function anuncioFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      anuncio: ['read'],
    },
    context,
  );

  const { id } = anuncioFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let anuncio = await tx.anuncio.findUnique({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          imovel: {
            select: {
              id: true,
              titulo: true,
            },
          },
          corretor: {
            select: {
              id: true,
              nomeCompleto: true,
            },
          },
          publicacoesPortais: {
            select: {
              id: true,
              codigoExterno: true,
            },
          },
          campanhasVinculadas: {
            select: {
              id: true,
              dataInclusao: true,
            },
          },
          leadsGerados: {
            select: {
              id: true,
              nome: true,
            },
          },
          solicitacoesContato: {
            select: {
              id: true,
              nome: true,
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

      anuncio = await filePopulateDownloadUrlInTree(anuncio);

      return anuncio;
    },
  );
}
