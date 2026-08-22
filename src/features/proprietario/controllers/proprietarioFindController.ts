import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { proprietarioFindSchema } from '../proprietarioSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const proprietarioFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/proprietario/{id}',
  params: proprietarioFindSchema,
  response: 'Proprietario',
};

export const proprietarioFindMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'proprietario_get',
  description: dictionary.proprietario.mcpDescription.get,
  requiredPermissions: { proprietario: ['read'] },
  schema: toMcpJsonSchema(proprietarioFindSchema),
  handler: async (params, context) => {
    return await proprietarioFindController(params, context);
  },
});

export async function proprietarioFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      proprietario: ['read'],
    },
    context,
  );

  const { id } = proprietarioFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let proprietario = await tx.proprietario.findUnique({
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
          imoveis: {
            select: {
              id: true,
              titulo: true,
            },
          },
          captacoes: {
            select: {
              id: true,
              codigo: true,
            },
          },
          vendasComoProprietario: {
            select: {
              id: true,
              codigo: true,
            },
          },
          locacoes: {
            select: {
              id: true,
              codigo: true,
            },
          },
          repasses: {
            select: {
              id: true,
              competencia: true,
            },
          },
          documentosPessoais: {
            select: {
              id: true,
              titulo: true,
            },
          },
          consentimentos: {
            select: {
              id: true,
              tipo: true,
            },
          },
          contratosAdministracao: {
            select: {
              id: true,
              numero: true,
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

      proprietario = await filePopulateDownloadUrlInTree(proprietario);

      return proprietario;
    },
  );
}
