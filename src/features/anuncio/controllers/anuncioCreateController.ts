import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { anuncioCreateInputSchema } from '../anuncioSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const anuncioCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/anuncio',
  body: anuncioCreateInputSchema,
  response: 'Anuncio',
};

export const anuncioCreateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'anuncio_create',
  description: dictionary.anuncio.mcpDescription.create,
  requiredPermissions: { anuncio: ['create'] },
  schema: toMcpJsonSchema(anuncioCreateInputSchema),
  handler: async (params, context) => {
    return await anuncioCreateController(params, context);
  },
});

export async function anuncioCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      anuncio: ['create'],
    },
    context,
  );
  return await anuncioCreate(body, context);
}

export async function anuncioCreate(body: unknown, context: AppContext) {
  const currentOrganization = context.currentOrganization!;

  const data = anuncioCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const duplicatedSlug = await tx.anuncio.count({
        where: {
          slug: {
            equals: data.slug,
            mode: 'insensitive',
          },
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

      const newAnuncio = await tx.anuncio.create({
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
          imovel: prismaRelationship.connectOneOrThrow(data.imovel),
          corretor: prismaRelationship.connectOneOrThrow(data.corretor),
          importHash: data.importHash,
          organization: prismaRelationship.connectOneOrThrow(
            context.currentOrganization!.id,
          ),
          createdByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
          createdByUserId: context.currentUser?.id,
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
        entityId: newAnuncio.id,
        entityName: 'Anuncio',
        operation: auditLogOperations.create,
        context,
        newData: newAnuncio,
        tx,
      });

      const anuncio = await filePopulateDownloadUrlInTree(newAnuncio);

      return anuncio;
    },
  );
}
