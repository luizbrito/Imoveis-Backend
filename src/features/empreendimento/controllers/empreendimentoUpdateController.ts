import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  empreendimentoUpdateBodyInputSchema,
  empreendimentoUpdateParamsInputSchema,
} from '../empreendimentoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const empreendimentoUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/empreendimento/{id}',
  params: empreendimentoUpdateParamsInputSchema,
  body: empreendimentoUpdateBodyInputSchema,
  response: 'Empreendimento',
};

export const empreendimentoUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'empreendimento_update',
  description: dictionary.empreendimento.mcpDescription.update,
  requiredPermissions: { empreendimento: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: empreendimentoUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await empreendimentoUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function empreendimentoUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      empreendimento: ['update'],
    },
    context,
  );

  const { id } = empreendimentoUpdateParamsInputSchema.parse(params);

  const data = empreendimentoUpdateBodyInputSchema.parse(body);

  let empreendimento = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentEmpreendimento = await tx.empreendimento.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentEmpreendimento) {
          const currentUpdatedAt =
            currentEmpreendimento.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldEmpreendimento = await tx.empreendimento.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          unidades: {
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

      await tx.empreendimento.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          nome: data.nome,
          incorporadora: data.incorporadora,
          construtora: data.construtora,
          status: data.status,
          dataLancamento: data.dataLancamento,
          previsaoEntrega: data.previsaoEntrega,
          cidade: data.cidade,
          bairro: data.bairro,
          endereco: data.endereco,
          descricao: data.descricao,
          diferenciais: data.diferenciais,
          imagens: data.imagens,
          documentos: data.documentos,
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedEmpreendimento = await tx.empreendimento.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          unidades: {
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
        entityName: 'Empreendimento',
        operation: auditLogOperations.update,
        context,
        oldData: oldEmpreendimento,
        newData: updatedEmpreendimento,
        tx,
      });

      return updatedEmpreendimento;
    },
  );

  empreendimento = await filePopulateDownloadUrlInTree(empreendimento);

  return empreendimento;
}
