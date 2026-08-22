import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  solicitacaoManutencaoUpdateBodyInputSchema,
  solicitacaoManutencaoUpdateParamsInputSchema,
} from '../solicitacaoManutencaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const solicitacaoManutencaoUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/solicitacao-manutencao/{id}',
  params: solicitacaoManutencaoUpdateParamsInputSchema,
  body: solicitacaoManutencaoUpdateBodyInputSchema,
  response: 'SolicitacaoManutencao',
};

export const solicitacaoManutencaoUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'solicitacaoManutencao_update',
  description: dictionary.solicitacaoManutencao.mcpDescription.update,
  requiredPermissions: { solicitacaoManutencao: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: solicitacaoManutencaoUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await solicitacaoManutencaoUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function solicitacaoManutencaoUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      solicitacaoManutencao: ['update'],
    },
    context,
  );

  const { id } = solicitacaoManutencaoUpdateParamsInputSchema.parse(params);

  const data = solicitacaoManutencaoUpdateBodyInputSchema.parse(body);

  let solicitacaoManutencao = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentSolicitacaoManutencao =
          await tx.solicitacaoManutencao.findUnique({
            where: {
              id_organizationId: {
                id,
                organizationId: currentOrganization.id,
              },
            },
            select: { updatedAt: true },
          });

        if (currentSolicitacaoManutencao) {
          const currentUpdatedAt =
            currentSolicitacaoManutencao.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }
      const duplicatedCodigo = await tx.solicitacaoManutencao.count({
        where: {
          codigo: {
            equals: data.codigo,
            mode: 'insensitive',
          },
          id: { not: id },
          organizationId: currentOrganization.id,
        },
      });

      if (duplicatedCodigo) {
        throw new Error400(
          dictionaryFormat(
            context.dictionary.shared.errors.unique,
            context.dictionary.solicitacaoManutencao.fields.codigo,
          ),
        );
      }

      const oldSolicitacaoManutencao =
        await tx.solicitacaoManutencao.findUniqueOrThrow({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          include: {
            ordensServico: {
              select: {
                id: true,
                codigo: true,
              },
            },
            imovel: {
              select: {
                id: true,
                titulo: true,
              },
            },
            locacao: {
              select: {
                id: true,
                codigo: true,
              },
            },
            clienteSolicitante: {
              select: {
                id: true,
                nomeRazaoSocial: true,
              },
            },
            corretorResponsavel: {
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

      await tx.solicitacaoManutencao.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          codigo: data.codigo,
          dataAbertura: data.dataAbertura,
          origem: data.origem,
          categoria: data.categoria,
          prioridade: data.prioridade,
          status: data.status,
          titulo: data.titulo,
          descricao: data.descricao,
          imagens: data.imagens,
          responsabilidadeCusto: data.responsabilidadeCusto,
          valorLimiteAutorizado: data.valorLimiteAutorizado,
          dataConclusao: data.dataConclusao,
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          locacao: prismaRelationship.connectOrDisconnectOne(data.locacao),
          clienteSolicitante: prismaRelationship.connectOrDisconnectOne(
            data.clienteSolicitante,
          ),
          corretorResponsavel: prismaRelationship.connectOrDisconnectOne(
            data.corretorResponsavel,
          ),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedSolicitacaoManutencao =
        await tx.solicitacaoManutencao.findUniqueOrThrow({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          include: {
            ordensServico: {
              select: {
                id: true,
                codigo: true,
              },
            },
            imovel: {
              select: {
                id: true,
                titulo: true,
              },
            },
            locacao: {
              select: {
                id: true,
                codigo: true,
              },
            },
            clienteSolicitante: {
              select: {
                id: true,
                nomeRazaoSocial: true,
              },
            },
            corretorResponsavel: {
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
        entityId: id,
        entityName: 'SolicitacaoManutencao',
        operation: auditLogOperations.update,
        context,
        oldData: oldSolicitacaoManutencao,
        newData: updatedSolicitacaoManutencao,
        tx,
      });

      return updatedSolicitacaoManutencao;
    },
  );

  solicitacaoManutencao = await filePopulateDownloadUrlInTree(
    solicitacaoManutencao,
  );

  return solicitacaoManutencao;
}
