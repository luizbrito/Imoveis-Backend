import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { clienteFindSchema } from '../clienteSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const clienteFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/cliente/{id}',
  params: clienteFindSchema,
  response: 'Cliente',
};

export const clienteFindMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'cliente_get',
  description: dictionary.cliente.mcpDescription.get,
  requiredPermissions: { cliente: ['read'] },
  schema: toMcpJsonSchema(clienteFindSchema),
  handler: async (params, context) => {
    return await clienteFindController(params, context);
  },
});

export async function clienteFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      cliente: ['read'],
    },
    context,
  );

  const { id } = clienteFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let cliente = await tx.cliente.findUnique({
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
          historicoLeads: {
            select: {
              id: true,
              nome: true,
            },
          },
          tarefasRelacionadas: {
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
          reservas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          compras: {
            select: {
              id: true,
              codigo: true,
            },
          },
          participacoesLocacao: {
            select: {
              id: true,
              papel: true,
            },
          },
          solicitacoesAbertas: {
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
          consentimentos: {
            select: {
              id: true,
              tipo: true,
            },
          },
          favoritos: {
            select: {
              id: true,
              dataInclusao: true,
            },
          },
          simulacoesFinanciamento: {
            select: {
              id: true,
              dataSimulacao: true,
            },
          },
          ocorrenciasReportadas: {
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

      cliente = await filePopulateDownloadUrlInTree(cliente);

      return cliente;
    },
  );
}
