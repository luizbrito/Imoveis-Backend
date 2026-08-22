import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { leadFindManyInputSchema } from '../leadSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const leadFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/lead',
  query: leadFindManyInputSchema,
  response: '{ leads: Lead[], count: number }',
};

export const leadFindManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'lead_list',
  description: dictionary.lead.mcpDescription.list,
  requiredPermissions: { lead: ['read'] },
  schema: toMcpJsonSchema(leadFindManyInputSchema),
  handler: async (params, context) => {
    return await leadFindManyController(params, context);
  },
});

export async function leadFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      lead: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } = leadFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.LeadWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.archived !== 'true') {
        whereAnd.push({ archivedAt: null });
      }
      if (filter?.nome != null) {
        whereAnd.push({
          nome: { contains: filter?.nome, mode: 'insensitive' },
        });
      }
      if (filter?.telefone != null) {
        whereAnd.push({
          telefone: { contains: filter?.telefone, mode: 'insensitive' },
        });
      }
      if (filter?.whatsapp != null) {
        whereAnd.push({
          whatsapp: { contains: filter?.whatsapp, mode: 'insensitive' },
        });
      }
      if (filter?.email != null) {
        whereAnd.push({
          email: { contains: filter?.email, mode: 'insensitive' },
        });
      }
      if (filter?.origem != null) {
        whereAnd.push({
          origem: filter?.origem,
        });
      }
      if (filter?.status != null) {
        whereAnd.push({
          status: filter?.status,
        });
      }
      if (filter?.temperatura != null) {
        whereAnd.push({
          temperatura: filter?.temperatura,
        });
      }
      if (filter?.dataEntradaRange?.length) {
        const start = filter.dataEntradaRange?.[0];
        const end = filter.dataEntradaRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataEntrada: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataEntrada: {
              lte: end,
            },
          });
        }
      }
      if (filter?.proximoContatoRange?.length) {
        const start = filter.proximoContatoRange?.[0];
        const end = filter.proximoContatoRange?.[1];

        if (start != null) {
          whereAnd.push({
            proximoContato: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            proximoContato: {
              lte: end,
            },
          });
        }
      }
      if (filter?.finalidade != null) {
        whereAnd.push({
          finalidade: filter?.finalidade,
        });
      }
      if (filter?.faixaValorRange?.length) {
        const start = filter.faixaValorRange?.[0];
        const end = filter.faixaValorRange?.[1];

        if (start != null) {
          whereAnd.push({
            faixaValor: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            faixaValor: { lte: end },
          });
        }
      }
      if (filter?.motivoPerda != null) {
        whereAnd.push({
          motivoPerda: { contains: filter?.motivoPerda, mode: 'insensitive' },
        });
      }
      if (filter?.filial != null) {
        whereAnd.push({
          filial: {
            id: filter.filial,
          },
        });
      }
      if (filter?.corretorResponsavel != null) {
        whereAnd.push({
          corretorResponsavel: {
            id: filter.corretorResponsavel,
          },
        });
      }
      if (filter?.anuncioOrigem != null) {
        whereAnd.push({
          anuncioOrigem: {
            id: filter.anuncioOrigem,
          },
        });
      }
      if (filter?.campanhaOrigem != null) {
        whereAnd.push({
          campanhaOrigem: {
            id: filter.campanhaOrigem,
          },
        });
      }
      if (filter?.portalOrigem != null) {
        whereAnd.push({
          portalOrigem: {
            id: filter.portalOrigem,
          },
        });
      }
      if (filter?.clienteConvertido != null) {
        whereAnd.push({
          clienteConvertido: {
            id: filter.clienteConvertido,
          },
        });
      }
      if (filter?.createdByMember != null) {
        whereAnd.push({
          createdByMember: {
            id: filter.createdByMember,
          },
        });
      }

      if (filter?.updatedByMember != null) {
        whereAnd.push({
          updatedByMember: {
            id: filter.updatedByMember,
          },
        });
      }

      if (filter?.createdAtRange?.length) {
        const start = filter.createdAtRange?.[0];
        const end = filter.createdAtRange?.[1];

        if (start != null) {
          whereAnd.push({
            createdAt: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            createdAt: {
              lte: end,
            },
          });
        }
      }

      if (filter?.updatedAtRange?.length) {
        const start = filter.updatedAtRange?.[0];
        const end = filter.updatedAtRange?.[1];

        if (start != null) {
          whereAnd.push({
            updatedAt: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            updatedAt: {
              lte: end,
            },
          });
        }
      }

      let leads = await tx.lead.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          filial: true,
          corretorResponsavel: true,
          anuncioOrigem: true,
          campanhaOrigem: true,
          portalOrigem: true,
          clienteConvertido: true,
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
        },
      });

      const count = await tx.lead.count({
        where: {
          AND: whereAnd,
        },
      });

      leads = await filePopulateDownloadUrlInTree(leads);

      return { leads, count };
    },
  );
}
