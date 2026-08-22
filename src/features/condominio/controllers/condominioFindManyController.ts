import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { condominioFindManyInputSchema } from '../condominioSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const condominioFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/condominio',
  query: condominioFindManyInputSchema,
  response: '{ condominios: Condominio[], count: number }',
};

export const condominioFindManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'condominio_list',
  description: dictionary.condominio.mcpDescription.list,
  requiredPermissions: { condominio: ['read'] },
  schema: toMcpJsonSchema(condominioFindManyInputSchema),
  handler: async (params, context) => {
    return await condominioFindManyController(params, context);
  },
});

export async function condominioFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      condominio: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    condominioFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.CondominioWhereInput> = [];

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
      if (filter?.cnpj != null) {
        whereAnd.push({
          cnpj: { contains: filter?.cnpj, mode: 'insensitive' },
        });
      }
      if (filter?.tipo != null) {
        whereAnd.push({
          tipo: filter?.tipo,
        });
      }
      if (filter?.telefoneAdministracao != null) {
        whereAnd.push({
          telefoneAdministracao: {
            contains: filter?.telefoneAdministracao,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.emailAdministracao != null) {
        whereAnd.push({
          emailAdministracao: {
            contains: filter?.emailAdministracao,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.logradouro != null) {
        whereAnd.push({
          logradouro: { contains: filter?.logradouro, mode: 'insensitive' },
        });
      }
      if (filter?.numero != null) {
        whereAnd.push({
          numero: { contains: filter?.numero, mode: 'insensitive' },
        });
      }
      if (filter?.bairro != null) {
        whereAnd.push({
          bairro: { contains: filter?.bairro, mode: 'insensitive' },
        });
      }
      if (filter?.cidade != null) {
        whereAnd.push({
          cidade: { contains: filter?.cidade, mode: 'insensitive' },
        });
      }
      if (filter?.uf != null) {
        whereAnd.push({
          uf: filter?.uf,
        });
      }
      if (filter?.cep != null) {
        whereAnd.push({
          cep: { contains: filter?.cep, mode: 'insensitive' },
        });
      }
      if (filter?.valorCondominioReferenciaRange?.length) {
        const start = filter.valorCondominioReferenciaRange?.[0];
        const end = filter.valorCondominioReferenciaRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorCondominioReferencia: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorCondominioReferencia: { lte: end },
          });
        }
      }
      if (filter?.infraestrutura?.length) {
        whereAnd.push({
          infraestrutura: {
            hasSome: filter.infraestrutura,
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

      let condominios = await tx.condominio.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
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

      const count = await tx.condominio.count({
        where: {
          AND: whereAnd,
        },
      });

      condominios = await filePopulateDownloadUrlInTree(condominios);

      return { condominios, count };
    },
  );
}
