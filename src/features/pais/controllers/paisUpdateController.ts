import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  paisUpdateBodyInputSchema,
  paisUpdateParamsInputSchema,
} from '../paisSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const paisUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/pais/{id}',
  params: paisUpdateParamsInputSchema,
  body: paisUpdateBodyInputSchema,
  response: 'Pais',
};

export const paisUpdateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'pais_update',
  description: dictionary.pais.mcpDescription.update,
  requiredPermissions: { pais: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: paisUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await paisUpdateController({ id: params.id }, params.data, context);
  },
});

export async function paisUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      pais: ['update'],
    },
    context,
  );

  const { id } = paisUpdateParamsInputSchema.parse(params);

  const data = paisUpdateBodyInputSchema.parse(body);

  let pais = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentPais = await tx.pais.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentPais) {
          const currentUpdatedAt = currentPais.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }
      const duplicatedNome = await tx.pais.count({
        where: {
          nome: {
            equals: data.nome,
            mode: 'insensitive',
          },
          id: { not: id },
          organizationId: currentOrganization.id,
        },
      });

      if (duplicatedNome) {
        throw new Error400(
          dictionaryFormat(
            context.dictionary.shared.errors.unique,
            context.dictionary.pais.fields.nome,
          ),
        );
      }
      const duplicatedSigla = await tx.pais.count({
        where: {
          sigla: {
            equals: data.sigla,
            mode: 'insensitive',
          },
          id: { not: id },
          organizationId: currentOrganization.id,
        },
      });

      if (duplicatedSigla) {
        throw new Error400(
          dictionaryFormat(
            context.dictionary.shared.errors.unique,
            context.dictionary.pais.fields.sigla,
          ),
        );
      }

      const oldPais = await tx.pais.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          estados: {
            select: {
              id: true,
              nome: true,
            },
          },
          imoveisPais: {
            select: {
              id: true,
              titulo: true,
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

      await tx.pais.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          nome: data.nome,
          sigla: data.sigla,
          codigoTelefone: data.codigoTelefone,
          nacionalidade: data.nacionalidade,
          ativo: data.ativo,
          observacoes: data.observacoes,
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedPais = await tx.pais.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          estados: {
            select: {
              id: true,
              nome: true,
            },
          },
          imoveisPais: {
            select: {
              id: true,
              titulo: true,
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
        entityName: 'Pais',
        operation: auditLogOperations.update,
        context,
        oldData: oldPais,
        newData: updatedPais,
        tx,
      });

      return updatedPais;
    },
  );

  pais = await filePopulateDownloadUrlInTree(pais);

  return pais;
}
