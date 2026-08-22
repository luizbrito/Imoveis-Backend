import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  ordemServicoUpdateBodyInputSchema,
  ordemServicoUpdateParamsInputSchema,
} from '../ordemServicoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const ordemServicoUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/ordem-servico/{id}',
  params: ordemServicoUpdateParamsInputSchema,
  body: ordemServicoUpdateBodyInputSchema,
  response: 'OrdemServico',
};

export const ordemServicoUpdateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'ordemServico_update',
  description: dictionary.ordemServico.mcpDescription.update,
  requiredPermissions: { ordemServico: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: ordemServicoUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await ordemServicoUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function ordemServicoUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      ordemServico: ['update'],
    },
    context,
  );

  const { id } = ordemServicoUpdateParamsInputSchema.parse(params);

  const data = ordemServicoUpdateBodyInputSchema.parse(body);

  let ordemServico = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentOrdemServico = await tx.ordemServico.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentOrdemServico) {
          const currentUpdatedAt = currentOrdemServico.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }
      const duplicatedCodigo = await tx.ordemServico.count({
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
            context.dictionary.ordemServico.fields.codigo,
          ),
        );
      }

      const oldOrdemServico = await tx.ordemServico.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          despesas: {
            select: {
              id: true,
              descricao: true,
            },
          },
          solicitacao: {
            select: {
              id: true,
              codigo: true,
            },
          },
          fornecedor: {
            select: {
              id: true,
              nomeRazaoSocial: true,
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

      await tx.ordemServico.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          codigo: data.codigo,
          status: data.status,
          dataEmissao: data.dataEmissao,
          dataAgendada: data.dataAgendada,
          dataConclusao: data.dataConclusao,
          descricaoServico: data.descricaoServico,
          valorOrcado: data.valorOrcado,
          valorAprovado: data.valorAprovado,
          valorFinal: data.valorFinal,
          documentos: data.documentos,
          fotosAntes: data.fotosAntes,
          fotosDepois: data.fotosDepois,
          avaliacaoServico: data.avaliacaoServico,
          solicitacao: prismaRelationship.connectOrDisconnectOne(
            data.solicitacao,
          ),
          fornecedor: prismaRelationship.connectOrDisconnectOne(
            data.fornecedor,
          ),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedOrdemServico = await tx.ordemServico.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          despesas: {
            select: {
              id: true,
              descricao: true,
            },
          },
          solicitacao: {
            select: {
              id: true,
              codigo: true,
            },
          },
          fornecedor: {
            select: {
              id: true,
              nomeRazaoSocial: true,
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
        entityName: 'OrdemServico',
        operation: auditLogOperations.update,
        context,
        oldData: oldOrdemServico,
        newData: updatedOrdemServico,
        tx,
      });

      return updatedOrdemServico;
    },
  );

  ordemServico = await filePopulateDownloadUrlInTree(ordemServico);

  return ordemServico;
}
