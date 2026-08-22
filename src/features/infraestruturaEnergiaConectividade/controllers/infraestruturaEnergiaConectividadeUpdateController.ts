import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  infraestruturaEnergiaConectividadeUpdateBodyInputSchema,
  infraestruturaEnergiaConectividadeUpdateParamsInputSchema,
} from '../infraestruturaEnergiaConectividadeSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const infraestruturaEnergiaConectividadeUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/infraestrutura-energia-conectividade/{id}',
  params: infraestruturaEnergiaConectividadeUpdateParamsInputSchema,
  body: infraestruturaEnergiaConectividadeUpdateBodyInputSchema,
  response: 'InfraestruturaEnergiaConectividade',
};

export const infraestruturaEnergiaConectividadeUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'infraestruturaEnergiaConectividade_update',
  description:
    dictionary.infraestruturaEnergiaConectividade.mcpDescription.update,
  requiredPermissions: { infraestruturaEnergiaConectividade: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: infraestruturaEnergiaConectividadeUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await infraestruturaEnergiaConectividadeUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function infraestruturaEnergiaConectividadeUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      infraestruturaEnergiaConectividade: ['update'],
    },
    context,
  );

  const { id } =
    infraestruturaEnergiaConectividadeUpdateParamsInputSchema.parse(params);

  const data =
    infraestruturaEnergiaConectividadeUpdateBodyInputSchema.parse(body);

  let infraestruturaEnergiaConectividade = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentInfraestruturaEnergiaConectividade =
          await tx.infraestruturaEnergiaConectividade.findUnique({
            where: {
              id_organizationId: {
                id,
                organizationId: currentOrganization.id,
              },
            },
            select: { updatedAt: true },
          });

        if (currentInfraestruturaEnergiaConectividade) {
          const currentUpdatedAt =
            currentInfraestruturaEnergiaConectividade.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldInfraestruturaEnergiaConectividade =
        await tx.infraestruturaEnergiaConectividade.findUniqueOrThrow({
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

      await tx.infraestruturaEnergiaConectividade.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          descricao: data.descricao,
          energiaDisponivel: data.energiaDisponivel,
          tipoRede: data.tipoRede,
          potenciaInstaladaKva: data.potenciaInstaladaKva,
          quantidadeTransformadores: data.quantidadeTransformadores,
          gerador: data.gerador,
          energiaSolar: data.energiaSolar,
          potenciaSolarKw: data.potenciaSolarKw,
          distanciaRedeEnergiaKm: data.distanciaRedeEnergiaKm,
          internetFibra: data.internetFibra,
          internetRadio: data.internetRadio,
          starlink: data.starlink,
          sinalCelular: data.sinalCelular,
          operadorasDisponiveis: data.operadorasDisponiveis,
          observacoes: data.observacoes,
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedInfraestruturaEnergiaConectividade =
        await tx.infraestruturaEnergiaConectividade.findUniqueOrThrow({
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
        entityName: 'InfraestruturaEnergiaConectividade',
        operation: auditLogOperations.update,
        context,
        oldData: oldInfraestruturaEnergiaConectividade,
        newData: updatedInfraestruturaEnergiaConectividade,
        tx,
      });

      return updatedInfraestruturaEnergiaConectividade;
    },
  );

  infraestruturaEnergiaConectividade = await filePopulateDownloadUrlInTree(
    infraestruturaEnergiaConectividade,
  );

  return infraestruturaEnergiaConectividade;
}
