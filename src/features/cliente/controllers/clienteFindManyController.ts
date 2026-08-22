import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { clienteFindManyInputSchema } from '../clienteSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const clienteFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/cliente',
  query: clienteFindManyInputSchema,
  response: '{ clientes: Cliente[], count: number }',
};

export const clienteFindManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'cliente_list',
  description: dictionary.cliente.mcpDescription.list,
  requiredPermissions: { cliente: ['read'] },
  schema: toMcpJsonSchema(clienteFindManyInputSchema),
  handler: async (params, context) => {
    return await clienteFindManyController(params, context);
  },
});

export async function clienteFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      cliente: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    clienteFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.ClienteWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.archived !== 'true') {
        whereAnd.push({ archivedAt: null });
      }
      if (filter?.nomeRazaoSocial != null) {
        whereAnd.push({
          nomeRazaoSocial: {
            contains: filter?.nomeRazaoSocial,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.tipoPessoa != null) {
        whereAnd.push({
          tipoPessoa: filter?.tipoPessoa,
        });
      }
      if (filter?.cpfCnpj != null) {
        whereAnd.push({
          cpfCnpj: { contains: filter?.cpfCnpj, mode: 'insensitive' },
        });
      }
      if (filter?.dataNascimentoRange?.length) {
        const start = filter.dataNascimentoRange?.[0];
        const end = filter.dataNascimentoRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataNascimento: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataNascimento: {
              lte: end,
            },
          });
        }
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
      if (filter?.profissao != null) {
        whereAnd.push({
          profissao: { contains: filter?.profissao, mode: 'insensitive' },
        });
      }
      if (filter?.rendaMensalRange?.length) {
        const start = filter.rendaMensalRange?.[0];
        const end = filter.rendaMensalRange?.[1];

        if (start != null) {
          whereAnd.push({
            rendaMensal: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            rendaMensal: { lte: end },
          });
        }
      }
      if (filter?.finalidades?.length) {
        whereAnd.push({
          finalidades: {
            hasSome: filter.finalidades,
          },
        });
      }
      if (filter?.tiposInteresse?.length) {
        whereAnd.push({
          tiposInteresse: {
            hasSome: filter.tiposInteresse,
          },
        });
      }
      if (filter?.faixaValorMinimoRange?.length) {
        const start = filter.faixaValorMinimoRange?.[0];
        const end = filter.faixaValorMinimoRange?.[1];

        if (start != null) {
          whereAnd.push({
            faixaValorMinimo: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            faixaValorMinimo: { lte: end },
          });
        }
      }
      if (filter?.faixaValorMaximoRange?.length) {
        const start = filter.faixaValorMaximoRange?.[0];
        const end = filter.faixaValorMaximoRange?.[1];

        if (start != null) {
          whereAnd.push({
            faixaValorMaximo: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            faixaValorMaximo: { lte: end },
          });
        }
      }
      if (filter?.cidadeInteresse != null) {
        whereAnd.push({
          cidadeInteresse: {
            contains: filter?.cidadeInteresse,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.bairrosInteresse?.length) {
        whereAnd.push({
          bairrosInteresse: {
            hasSome: filter.bairrosInteresse,
          },
        });
      }
      if (filter?.canalPreferido != null) {
        whereAnd.push({
          canalPreferido: filter?.canalPreferido,
        });
      }
      if (filter?.ativo != null) {
        whereAnd.push({
          ativo: filter.ativo === 'true',
        });
      }
      if (filter?.filial != null) {
        whereAnd.push({
          filial: {
            id: filter.filial,
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

      let clientes = await tx.cliente.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          filial: true,
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

      const count = await tx.cliente.count({
        where: {
          AND: whereAnd,
        },
      });

      clientes = await filePopulateDownloadUrlInTree(clientes);

      return { clientes, count };
    },
  );
}
