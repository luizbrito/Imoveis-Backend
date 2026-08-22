import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  propostaUpdateBodyInputSchema,
  propostaUpdateParamsInputSchema,
} from '../propostaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const propostaUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/proposta/{id}',
  params: propostaUpdateParamsInputSchema,
  body: propostaUpdateBodyInputSchema,
  response: 'Proposta',
};

export const propostaUpdateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'proposta_update',
  description: dictionary.proposta.mcpDescription.update,
  requiredPermissions: { proposta: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: propostaUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await propostaUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function propostaUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      proposta: ['update'],
    },
    context,
  );

  const { id } = propostaUpdateParamsInputSchema.parse(params);

  const data = propostaUpdateBodyInputSchema.parse(body);

  let proposta = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentProposta = await tx.proposta.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentProposta) {
          const currentUpdatedAt = currentProposta.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }
      const duplicatedCodigo = await tx.proposta.count({
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
            context.dictionary.proposta.fields.codigo,
          ),
        );
      }

      const oldProposta = await tx.proposta.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          condicoes: {
            select: {
              id: true,
              descricao: true,
            },
          },
          reservas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          vendasGeradas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          locacoesGeradas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          simulacoesFinanciamento: {
            select: {
              id: true,
              dataSimulacao: true,
            },
          },
          visitaOrigem: {
            select: {
              id: true,
              codigo: true,
            },
          },
          lead: {
            select: {
              id: true,
              nome: true,
            },
          },
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
          corretor: {
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

      await tx.proposta.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          codigo: data.codigo,
          tipo: data.tipo,
          dataProposta: data.dataProposta,
          validadeAte: data.validadeAte,
          status: data.status,
          valorProposto: data.valorProposto,
          moeda: data.moeda,
          sinal: data.sinal,
          formaPagamento: data.formaPagamento,
          percentualComissao: data.percentualComissao,
          termos: data.termos,
          documentos: data.documentos,
          motivoRecusa: data.motivoRecusa,
          visitaOrigem: prismaRelationship.connectOrDisconnectOne(
            data.visitaOrigem,
          ),
          lead: prismaRelationship.connectOrDisconnectOne(data.lead),
          cliente: prismaRelationship.connectOrDisconnectOne(data.cliente),
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          corretor: prismaRelationship.connectOrDisconnectOne(data.corretor),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedProposta = await tx.proposta.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          condicoes: {
            select: {
              id: true,
              descricao: true,
            },
          },
          reservas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          vendasGeradas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          locacoesGeradas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          simulacoesFinanciamento: {
            select: {
              id: true,
              dataSimulacao: true,
            },
          },
          visitaOrigem: {
            select: {
              id: true,
              codigo: true,
            },
          },
          lead: {
            select: {
              id: true,
              nome: true,
            },
          },
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
          corretor: {
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
        entityName: 'Proposta',
        operation: auditLogOperations.update,
        context,
        oldData: oldProposta,
        newData: updatedProposta,
        tx,
      });

      return updatedProposta;
    },
  );

  proposta = await filePopulateDownloadUrlInTree(proposta);

  return proposta;
}
