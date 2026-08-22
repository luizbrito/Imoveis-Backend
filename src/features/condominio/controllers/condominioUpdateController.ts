import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  condominioUpdateBodyInputSchema,
  condominioUpdateParamsInputSchema,
} from '../condominioSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const condominioUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/condominio/{id}',
  params: condominioUpdateParamsInputSchema,
  body: condominioUpdateBodyInputSchema,
  response: 'Condominio',
};

export const condominioUpdateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'condominio_update',
  description: dictionary.condominio.mcpDescription.update,
  requiredPermissions: { condominio: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: condominioUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await condominioUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function condominioUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      condominio: ['update'],
    },
    context,
  );

  const { id } = condominioUpdateParamsInputSchema.parse(params);

  const data = condominioUpdateBodyInputSchema.parse(body);

  let condominio = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentCondominio = await tx.condominio.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentCondominio) {
          const currentUpdatedAt = currentCondominio.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldCondominio = await tx.condominio.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          imoveis: {
            select: {
              id: true,
              titulo: true,
            },
          },
          arquivosKml: {
            select: {
              id: true,
              nome: true,
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

      await tx.condominio.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          nome: data.nome,
          cnpj: data.cnpj,
          tipo: data.tipo,
          telefoneAdministracao: data.telefoneAdministracao,
          emailAdministracao: data.emailAdministracao,
          logradouro: data.logradouro,
          numero: data.numero,
          bairro: data.bairro,
          cidade: data.cidade,
          uf: data.uf,
          cep: data.cep,
          valorCondominioReferencia: data.valorCondominioReferencia,
          infraestrutura: data.infraestrutura,
          regras: data.regras,
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedCondominio = await tx.condominio.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          imoveis: {
            select: {
              id: true,
              titulo: true,
            },
          },
          arquivosKml: {
            select: {
              id: true,
              nome: true,
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
        entityName: 'Condominio',
        operation: auditLogOperations.update,
        context,
        oldData: oldCondominio,
        newData: updatedCondominio,
        tx,
      });

      return updatedCondominio;
    },
  );

  condominio = await filePopulateDownloadUrlInTree(condominio);

  return condominio;
}
