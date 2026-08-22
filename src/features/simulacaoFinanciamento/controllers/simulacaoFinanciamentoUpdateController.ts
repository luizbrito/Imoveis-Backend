import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  simulacaoFinanciamentoUpdateBodyInputSchema,
  simulacaoFinanciamentoUpdateParamsInputSchema,
} from '../simulacaoFinanciamentoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const simulacaoFinanciamentoUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/simulacao-financiamento/{id}',
  params: simulacaoFinanciamentoUpdateParamsInputSchema,
  body: simulacaoFinanciamentoUpdateBodyInputSchema,
  response: 'SimulacaoFinanciamento',
};

export const simulacaoFinanciamentoUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'simulacaoFinanciamento_update',
  description: dictionary.simulacaoFinanciamento.mcpDescription.update,
  requiredPermissions: { simulacaoFinanciamento: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: simulacaoFinanciamentoUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await simulacaoFinanciamentoUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function simulacaoFinanciamentoUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      simulacaoFinanciamento: ['update'],
    },
    context,
  );

  const { id } = simulacaoFinanciamentoUpdateParamsInputSchema.parse(params);

  const data = simulacaoFinanciamentoUpdateBodyInputSchema.parse(body);

  let simulacaoFinanciamento = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentSimulacaoFinanciamento =
          await tx.simulacaoFinanciamento.findUnique({
            where: {
              id_organizationId: {
                id,
                organizationId: currentOrganization.id,
              },
            },
            select: { updatedAt: true },
          });

        if (currentSimulacaoFinanciamento) {
          const currentUpdatedAt =
            currentSimulacaoFinanciamento.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldSimulacaoFinanciamento =
        await tx.simulacaoFinanciamento.findUniqueOrThrow({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          include: {
            cliente: {
              select: {
                id: true,
                nomeRazaoSocial: true,
              },
            },
            imovel: {
              select: {
                id: true,
                titulo: true,
              },
            },
            proposta: {
              select: {
                id: true,
                codigo: true,
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

      await tx.simulacaoFinanciamento.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          dataSimulacao: data.dataSimulacao,
          valorImovel: data.valorImovel,
          valorEntrada: data.valorEntrada,
          valorFinanciado: data.valorFinanciado,
          prazoMeses: data.prazoMeses,
          taxaJurosAnual: data.taxaJurosAnual,
          sistemaAmortizacao: data.sistemaAmortizacao,
          valorParcelaInicial: data.valorParcelaInicial,
          instituicaoFinanceira: data.instituicaoFinanceira,
          status: data.status,
          observacoes: data.observacoes,
          cliente: prismaRelationship.connectOrDisconnectOne(data.cliente),
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          proposta: prismaRelationship.connectOrDisconnectOne(data.proposta),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedSimulacaoFinanciamento =
        await tx.simulacaoFinanciamento.findUniqueOrThrow({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          include: {
            cliente: {
              select: {
                id: true,
                nomeRazaoSocial: true,
              },
            },
            imovel: {
              select: {
                id: true,
                titulo: true,
              },
            },
            proposta: {
              select: {
                id: true,
                codigo: true,
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
        entityName: 'SimulacaoFinanciamento',
        operation: auditLogOperations.update,
        context,
        oldData: oldSimulacaoFinanciamento,
        newData: updatedSimulacaoFinanciamento,
        tx,
      });

      return updatedSimulacaoFinanciamento;
    },
  );

  simulacaoFinanciamento = await filePopulateDownloadUrlInTree(
    simulacaoFinanciamento,
  );

  return simulacaoFinanciamento;
}
