import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  ativoIncluidoVendaRuralUpdateBodyInputSchema,
  ativoIncluidoVendaRuralUpdateParamsInputSchema,
} from '../ativoIncluidoVendaRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const ativoIncluidoVendaRuralUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/ativo-incluido-venda-rural/{id}',
  params: ativoIncluidoVendaRuralUpdateParamsInputSchema,
  body: ativoIncluidoVendaRuralUpdateBodyInputSchema,
  response: 'AtivoIncluidoVendaRural',
};

export const ativoIncluidoVendaRuralUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'ativoIncluidoVendaRural_update',
  description: dictionary.ativoIncluidoVendaRural.mcpDescription.update,
  requiredPermissions: { ativoIncluidoVendaRural: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: ativoIncluidoVendaRuralUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await ativoIncluidoVendaRuralUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function ativoIncluidoVendaRuralUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      ativoIncluidoVendaRural: ['update'],
    },
    context,
  );

  const { id } = ativoIncluidoVendaRuralUpdateParamsInputSchema.parse(params);

  const data = ativoIncluidoVendaRuralUpdateBodyInputSchema.parse(body);

  let ativoIncluidoVendaRural = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentAtivoIncluidoVendaRural =
          await tx.ativoIncluidoVendaRural.findUnique({
            where: {
              id_organizationId: {
                id,
                organizationId: currentOrganization.id,
              },
            },
            select: { updatedAt: true },
          });

        if (currentAtivoIncluidoVendaRural) {
          const currentUpdatedAt =
            currentAtivoIncluidoVendaRural.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldAtivoIncluidoVendaRural =
        await tx.ativoIncluidoVendaRural.findUniqueOrThrow({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          include: {
            imovel: {
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

      await tx.ativoIncluidoVendaRural.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          nome: data.nome,
          tipo: data.tipo,
          descricao: data.descricao,
          quantidade: data.quantidade,
          valorEstimado: data.valorEstimado,
          moeda: data.moeda,
          incluidoPreco: data.incluidoPreco,
          documentos: data.documentos,
          fotos: data.fotos,
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedAtivoIncluidoVendaRural =
        await tx.ativoIncluidoVendaRural.findUniqueOrThrow({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          include: {
            imovel: {
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
        entityName: 'AtivoIncluidoVendaRural',
        operation: auditLogOperations.update,
        context,
        oldData: oldAtivoIncluidoVendaRural,
        newData: updatedAtivoIncluidoVendaRural,
        tx,
      });

      return updatedAtivoIncluidoVendaRural;
    },
  );

  ativoIncluidoVendaRural = await filePopulateDownloadUrlInTree(
    ativoIncluidoVendaRural,
  );

  return ativoIncluidoVendaRural;
}
