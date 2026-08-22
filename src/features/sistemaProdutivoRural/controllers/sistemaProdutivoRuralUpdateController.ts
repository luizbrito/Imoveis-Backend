import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  sistemaProdutivoRuralUpdateBodyInputSchema,
  sistemaProdutivoRuralUpdateParamsInputSchema,
} from '../sistemaProdutivoRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const sistemaProdutivoRuralUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/sistema-produtivo-rural/{id}',
  params: sistemaProdutivoRuralUpdateParamsInputSchema,
  body: sistemaProdutivoRuralUpdateBodyInputSchema,
  response: 'SistemaProdutivoRural',
};

export const sistemaProdutivoRuralUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'sistemaProdutivoRural_update',
  description: dictionary.sistemaProdutivoRural.mcpDescription.update,
  requiredPermissions: { sistemaProdutivoRural: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: sistemaProdutivoRuralUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await sistemaProdutivoRuralUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function sistemaProdutivoRuralUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      sistemaProdutivoRural: ['update'],
    },
    context,
  );

  const { id } = sistemaProdutivoRuralUpdateParamsInputSchema.parse(params);

  const data = sistemaProdutivoRuralUpdateBodyInputSchema.parse(body);

  let sistemaProdutivoRural = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentSistemaProdutivoRural =
          await tx.sistemaProdutivoRural.findUnique({
            where: {
              id_organizationId: {
                id,
                organizationId: currentOrganization.id,
              },
            },
            select: { updatedAt: true },
          });

        if (currentSistemaProdutivoRural) {
          const currentUpdatedAt =
            currentSistemaProdutivoRural.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldSistemaProdutivoRural =
        await tx.sistemaProdutivoRural.findUniqueOrThrow({
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

      await tx.sistemaProdutivoRural.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          nome: data.nome,
          tipo: data.tipo,
          areaHa: data.areaHa,
          irrigado: data.irrigado,
          tipoIrrigacao: data.tipoIrrigacao,
          quantidadePivos: data.quantidadePivos,
          areaIrrigadaHa: data.areaIrrigadaHa,
          fonteAgua: data.fonteAgua,
          capacidadeIrrigacaoHa: data.capacidadeIrrigacaoHa,
          certificadoOrganico: data.certificadoOrganico,
          observacoes: data.observacoes,
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedSistemaProdutivoRural =
        await tx.sistemaProdutivoRural.findUniqueOrThrow({
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
        entityName: 'SistemaProdutivoRural',
        operation: auditLogOperations.update,
        context,
        oldData: oldSistemaProdutivoRural,
        newData: updatedSistemaProdutivoRural,
        tx,
      });

      return updatedSistemaProdutivoRural;
    },
  );

  sistemaProdutivoRural = await filePopulateDownloadUrlInTree(
    sistemaProdutivoRural,
  );

  return sistemaProdutivoRural;
}
