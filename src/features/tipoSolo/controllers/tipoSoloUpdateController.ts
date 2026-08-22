import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  tipoSoloUpdateBodyInputSchema,
  tipoSoloUpdateParamsInputSchema,
} from '../tipoSoloSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const tipoSoloUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/tipo-solo/{id}',
  params: tipoSoloUpdateParamsInputSchema,
  body: tipoSoloUpdateBodyInputSchema,
  response: 'TipoSolo',
};

export const tipoSoloUpdateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'tipoSolo_update',
  description: dictionary.tipoSolo.mcpDescription.update,
  requiredPermissions: { tipoSolo: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: tipoSoloUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await tipoSoloUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function tipoSoloUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      tipoSolo: ['update'],
    },
    context,
  );

  const { id } = tipoSoloUpdateParamsInputSchema.parse(params);

  const data = tipoSoloUpdateBodyInputSchema.parse(body);

  let tipoSolo = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentTipoSolo = await tx.tipoSolo.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentTipoSolo) {
          const currentUpdatedAt = currentTipoSolo.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldTipoSolo = await tx.tipoSolo.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          areasImoveis: {
            select: {
              id: true,
              nomeArea: true,
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

      await tx.tipoSolo.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          nome: data.nome,
          codigo: data.codigo,
          descricao: data.descricao,
          classeTextural: data.classeTextural,
          origem: data.origem,
          corPredominante: data.corPredominante,
          drenagem: data.drenagem,
          fertilidadeNatural: data.fertilidadeNatural,
          materiaOrganica: data.materiaOrganica,
          acidez: data.acidez,
          riscoErosao: data.riscoErosao,
          riscoCompactacao: data.riscoCompactacao,
          riscoEncharcamento: data.riscoEncharcamento,
          aptidaoAgricola: data.aptidaoAgricola,
          aptidaoPastagem: data.aptidaoPastagem,
          aptidaoFlorestal: data.aptidaoFlorestal,
          observacoes: data.observacoes,
          fonteClassificacao: data.fonteClassificacao,
          mapaReferencia: data.mapaReferencia,
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedTipoSolo = await tx.tipoSolo.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          areasImoveis: {
            select: {
              id: true,
              nomeArea: true,
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
        entityName: 'TipoSolo',
        operation: auditLogOperations.update,
        context,
        oldData: oldTipoSolo,
        newData: updatedTipoSolo,
        tx,
      });

      return updatedTipoSolo;
    },
  );

  tipoSolo = await filePopulateDownloadUrlInTree(tipoSolo);

  return tipoSolo;
}
