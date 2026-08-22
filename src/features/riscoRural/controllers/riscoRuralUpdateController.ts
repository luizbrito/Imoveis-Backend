import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  riscoRuralUpdateBodyInputSchema,
  riscoRuralUpdateParamsInputSchema,
} from '../riscoRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const riscoRuralUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/risco-rural/{id}',
  params: riscoRuralUpdateParamsInputSchema,
  body: riscoRuralUpdateBodyInputSchema,
  response: 'RiscoRural',
};

export const riscoRuralUpdateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'riscoRural_update',
  description: dictionary.riscoRural.mcpDescription.update,
  requiredPermissions: { riscoRural: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: riscoRuralUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await riscoRuralUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function riscoRuralUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      riscoRural: ['update'],
    },
    context,
  );

  const { id } = riscoRuralUpdateParamsInputSchema.parse(params);

  const data = riscoRuralUpdateBodyInputSchema.parse(body);

  let riscoRural = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentRiscoRural = await tx.riscoRural.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentRiscoRural) {
          const currentUpdatedAt = currentRiscoRural.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldRiscoRural = await tx.riscoRural.findUniqueOrThrow({
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

      await tx.riscoRural.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          tipo: data.tipo,
          nivel: data.nivel,
          descricao: data.descricao,
          historicoOcorrencia: data.historicoOcorrencia,
          ultimaOcorrencia: data.ultimaOcorrencia,
          areaAfetadaHa: data.areaAfetadaHa,
          mitigacaoExistente: data.mitigacaoExistente,
          descricaoMitigacao: data.descricaoMitigacao,
          documentos: data.documentos,
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedRiscoRural = await tx.riscoRural.findUniqueOrThrow({
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
        entityName: 'RiscoRural',
        operation: auditLogOperations.update,
        context,
        oldData: oldRiscoRural,
        newData: updatedRiscoRural,
        tx,
      });

      return updatedRiscoRural;
    },
  );

  riscoRural = await filePopulateDownloadUrlInTree(riscoRural);

  return riscoRural;
}
