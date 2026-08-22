import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  anuncioUpdateBodyInputSchema,
  anuncioUpdateParamsInputSchema,
} from '../anuncioSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const anuncioUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/anuncio/{id}',
  params: anuncioUpdateParamsInputSchema,
  body: anuncioUpdateBodyInputSchema,
  response: 'Anuncio',
};

export const anuncioUpdateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'anuncio_update',
  description: dictionary.anuncio.mcpDescription.update,
  requiredPermissions: { anuncio: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: anuncioUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await anuncioUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function anuncioUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      anuncio: ['update'],
    },
    context,
  );

  const { id } = anuncioUpdateParamsInputSchema.parse(params);

  const data = anuncioUpdateBodyInputSchema.parse(body);

  let anuncio = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentAnuncio = await tx.anuncio.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentAnuncio) {
          const currentUpdatedAt = currentAnuncio.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }
      const duplicatedSlug = await tx.anuncio.count({
        where: {
          slug: {
            equals: data.slug,
            mode: 'insensitive',
          },
          id: { not: id },
          organizationId: currentOrganization.id,
        },
      });

      if (duplicatedSlug) {
        throw new Error400(
          dictionaryFormat(
            context.dictionary.shared.errors.unique,
            context.dictionary.anuncio.fields.slug,
          ),
        );
      }

      const oldAnuncio = await tx.anuncio.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          publicacoesPortais: {
            select: {
              id: true,
              codigoExterno: true,
            },
          },
          campanhasVinculadas: {
            select: {
              id: true,
              dataInclusao: true,
            },
          },
          leadsGerados: {
            select: {
              id: true,
              nome: true,
            },
          },
          solicitacoesContato: {
            select: {
              id: true,
              nome: true,
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
          createdByMember: {
            select: {
              id: true,
              fullName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          updatedByMember: {
            select: {
              id: true,
              fullName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          archivedByMember: {
            select: {
              id: true,
              fullName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      });

      await tx.anuncio.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          titulo: data.titulo,
          slug: data.slug,
          status: data.status,
          dataInicio: data.dataInicio,
          dataFim: data.dataFim,
          valorDivulgado: data.valorDivulgado,
          tituloSeo: data.tituloSeo,
          descricaoSeo: data.descricaoSeo,
          palavrasChave: data.palavrasChave,
          textoPublicacao: data.textoPublicacao,
          destaque: data.destaque,
          aceitaContato: data.aceitaContato,
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          corretor: prismaRelationship.connectOrDisconnectOne(data.corretor),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedAnuncio = await tx.anuncio.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          publicacoesPortais: {
            select: {
              id: true,
              codigoExterno: true,
            },
          },
          campanhasVinculadas: {
            select: {
              id: true,
              dataInclusao: true,
            },
          },
          leadsGerados: {
            select: {
              id: true,
              nome: true,
            },
          },
          solicitacoesContato: {
            select: {
              id: true,
              nome: true,
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
          createdByMember: {
            select: {
              id: true,
              fullName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          updatedByMember: {
            select: {
              id: true,
              fullName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          archivedByMember: {
            select: {
              id: true,
              fullName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      });

      await auditLogCreate({
        entityId: id,
        entityName: 'Anuncio',
        operation: auditLogOperations.update,
        context,
        oldData: oldAnuncio,
        newData: updatedAnuncio,
        tx,
      });

      return updatedAnuncio;
    },
  );

  anuncio = await filePopulateDownloadUrlInTree(anuncio);

  return anuncio;
}
