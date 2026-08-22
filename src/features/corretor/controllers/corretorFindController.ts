import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { corretorFindSchema } from '../corretorSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const corretorFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/corretor/{id}',
  params: corretorFindSchema,
  response: 'Corretor',
};

export const corretorFindMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'corretor_get',
  description: dictionary.corretor.mcpDescription.get,
  requiredPermissions: { corretor: ['read'] },
  schema: toMcpJsonSchema(corretorFindSchema),
  handler: async (params, context) => {
    return await corretorFindController(params, context);
  },
});

export async function corretorFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      corretor: ['read'],
    },
    context,
  );

  const { id } = corretorFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let corretor = await tx.corretor.findUnique({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          contaMembro: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
          filial: {
            select: {
              id: true,
              nome: true,
            },
          },
          imoveisCaptados: {
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
          avaliacoesRealizadas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          vistoriasResponsaveis: {
            select: {
              id: true,
              codigo: true,
            },
          },
          anunciosResponsaveis: {
            select: {
              id: true,
              titulo: true,
            },
          },
          leadsResponsaveis: {
            select: {
              id: true,
              nome: true,
            },
          },
          interacoesRealizadas: {
            select: {
              id: true,
              assunto: true,
            },
          },
          tarefasAtribuidas: {
            select: {
              id: true,
              titulo: true,
            },
          },
          visitasConduzidas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          propostasIntermediadas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          reservasGerenciadas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          vendasIntermediadas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          locacoesIntermediadas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          comissoes: {
            select: {
              id: true,
              codigo: true,
            },
          },
          solicitacoesGerenciadas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          documentosPessoais: {
            select: {
              id: true,
              titulo: true,
            },
          },
          solicitacoesAtendidas: {
            select: {
              id: true,
              nome: true,
            },
          },
          ocorrenciasGerenciadas: {
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

      corretor = await filePopulateDownloadUrlInTree(corretor);

      return corretor;
    },
  );
}
