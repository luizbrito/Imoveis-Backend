import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { propostaFindSchema } from '../propostaSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const propostaFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/proposta/{id}',
  params: propostaFindSchema,
  response: 'Proposta',
};

export const propostaFindMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'proposta_get',
  description: dictionary.proposta.mcpDescription.get,
  requiredPermissions: { proposta: ['read'] },
  schema: toMcpJsonSchema(propostaFindSchema),
  handler: async (params, context) => {
    return await propostaFindController(params, context);
  },
});

export async function propostaFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      proposta: ['read'],
    },
    context,
  );

  const { id } = propostaFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let proposta = await tx.proposta.findUnique({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          visitaOrigem: {
            select: {
              id: true,
              codigo: true,
            },
          },
          lead: {
            select: {
              id: true,
              nome: true,
            },
          },
          cliente: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
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
          condicoes: {
            select: {
              id: true,
              descricao: true,
            },
          },
          reservas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          vendasGeradas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          locacoesGeradas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          simulacoesFinanciamento: {
            select: {
              id: true,
              dataSimulacao: true,
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

      proposta = await filePopulateDownloadUrlInTree(proposta);

      return proposta;
    },
  );
}
