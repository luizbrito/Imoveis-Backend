import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { consentimentoLGPDFindManyInputSchema } from '../consentimentoLGPDSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const consentimentoLGPDFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/consentimento-l-g-p-d',
  query: consentimentoLGPDFindManyInputSchema,
  response: '{ consentimentosLGPD: ConsentimentoLGPD[], count: number }',
};

export const consentimentoLGPDFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'consentimentoLGPD_list',
  description: dictionary.consentimentoLGPD.mcpDescription.list,
  requiredPermissions: { consentimentoLGPD: ['read'] },
  schema: toMcpJsonSchema(consentimentoLGPDFindManyInputSchema),
  handler: async (params, context) => {
    return await consentimentoLGPDFindManyController(params, context);
  },
});

export async function consentimentoLGPDFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      consentimentoLGPD: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    consentimentoLGPDFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.ConsentimentoLGPDWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.archived !== 'true') {
        whereAnd.push({ archivedAt: null });
      }
      if (filter?.tipo != null) {
        whereAnd.push({
          tipo: filter?.tipo,
        });
      }
      if (filter?.versaoTermo != null) {
        whereAnd.push({
          versaoTermo: { contains: filter?.versaoTermo, mode: 'insensitive' },
        });
      }
      if (filter?.dataConsentimentoRange?.length) {
        const start = filter.dataConsentimentoRange?.[0];
        const end = filter.dataConsentimentoRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataConsentimento: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataConsentimento: {
              lte: end,
            },
          });
        }
      }
      if (filter?.status != null) {
        whereAnd.push({
          status: filter?.status,
        });
      }
      if (filter?.dataRevogacaoRange?.length) {
        const start = filter.dataRevogacaoRange?.[0];
        const end = filter.dataRevogacaoRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataRevogacao: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataRevogacao: {
              lte: end,
            },
          });
        }
      }
      if (filter?.ipOrigem != null) {
        whereAnd.push({
          ipOrigem: { contains: filter?.ipOrigem, mode: 'insensitive' },
        });
      }
      if (filter?.canal != null) {
        whereAnd.push({
          canal: filter?.canal,
        });
      }
      if (filter?.cliente != null) {
        whereAnd.push({
          cliente: {
            id: filter.cliente,
          },
        });
      }
      if (filter?.proprietario != null) {
        whereAnd.push({
          proprietario: {
            id: filter.proprietario,
          },
        });
      }
      if (filter?.lead != null) {
        whereAnd.push({
          lead: {
            id: filter.lead,
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

      let consentimentosLGPD = await tx.consentimentoLGPD.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          cliente: true,
          proprietario: true,
          lead: true,
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

      const count = await tx.consentimentoLGPD.count({
        where: {
          AND: whereAnd,
        },
      });

      consentimentosLGPD =
        await filePopulateDownloadUrlInTree(consentimentosLGPD);

      return { consentimentosLGPD, count };
    },
  );
}
