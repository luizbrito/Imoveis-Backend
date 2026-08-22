import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { leadFindSchema } from '../leadSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const leadFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/lead/{id}',
  params: leadFindSchema,
  response: 'Lead',
};

export const leadFindMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'lead_get',
  description: dictionary.lead.mcpDescription.get,
  requiredPermissions: { lead: ['read'] },
  schema: toMcpJsonSchema(leadFindSchema),
  handler: async (params, context) => {
    return await leadFindController(params, context);
  },
});

export async function leadFindController(params: unknown, context: AppContext) {
  const { currentOrganization } = await authGuardBackend(
    {
      lead: ['read'],
    },
    context,
  );

  const { id } = leadFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let lead = await tx.lead.findUnique({
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
          corretorResponsavel: {
            select: {
              id: true,
              nomeCompleto: true,
            },
          },
          anuncioOrigem: {
            select: {
              id: true,
              titulo: true,
            },
          },
          campanhaOrigem: {
            select: {
              id: true,
              nome: true,
            },
          },
          portalOrigem: {
            select: {
              id: true,
              nome: true,
            },
          },
          clienteConvertido: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          interacoes: {
            select: {
              id: true,
              assunto: true,
            },
          },
          tarefas: {
            select: {
              id: true,
              titulo: true,
            },
          },
          visitas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          propostas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          consentimentos: {
            select: {
              id: true,
              tipo: true,
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

      lead = await filePopulateDownloadUrlInTree(lead);

      return lead;
    },
  );
}
