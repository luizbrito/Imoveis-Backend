import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { portalImobiliarioFindManyInputSchema } from '../portalImobiliarioSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const portalImobiliarioFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/portal-imobiliario',
  query: portalImobiliarioFindManyInputSchema,
  response: '{ portaisImobiliarios: PortalImobiliario[], count: number }',
};

export const portalImobiliarioFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'portalImobiliario_list',
  description: dictionary.portalImobiliario.mcpDescription.list,
  requiredPermissions: { portalImobiliario: ['read'] },
  schema: toMcpJsonSchema(portalImobiliarioFindManyInputSchema),
  handler: async (params, context) => {
    return await portalImobiliarioFindManyController(params, context);
  },
});

export async function portalImobiliarioFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      portalImobiliario: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    portalImobiliarioFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.PortalImobiliarioWhereInput> = [];

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
      if (filter?.urlBase != null) {
        whereAnd.push({
          urlBase: { contains: filter?.urlBase, mode: 'insensitive' },
        });
      }
      if (filter?.tipoIntegracao != null) {
        whereAnd.push({
          tipoIntegracao: filter?.tipoIntegracao,
        });
      }
      if (filter?.identificadorConta != null) {
        whereAnd.push({
          identificadorConta: {
            contains: filter?.identificadorConta,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.ativo != null) {
        whereAnd.push({
          ativo: filter.ativo === 'true',
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

      let portaisImobiliarios = await tx.portalImobiliario.findMany({
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

      const count = await tx.portalImobiliario.count({
        where: {
          AND: whereAnd,
        },
      });

      portaisImobiliarios =
        await filePopulateDownloadUrlInTree(portaisImobiliarios);

      return { portaisImobiliarios, count };
    },
  );
}
